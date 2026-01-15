from aws_cdk import (
    aws_s3 as s3,
    aws_lambda as _lambda,
    aws_s3_notifications as s3n,
    aws_ecs as ecs,
    aws_ec2 as ec2,
    aws_iam as iam,
    Duration,
)
from constructs import Construct
from typing import TypedDict
from pathlib import Path

from oysirs.shared.main import Shared
from oysirs.databases.main import Databases


class BanksS3BucketsConfig(TypedDict):
    shared: Shared
    databases: Databases


class BanksS3Buckets(Construct):
    def __init__(self, scope: Construct, id: str, config: BanksS3BucketsConfig) -> None:
        super().__init__(scope, id)

        self.banks_raw_bucket = s3.Bucket(
            self, "BanksRawBucket",
            bucket_name="oysirs-banks-raw-bucket",
            removal_policy=config['shared'].removal_policy,
            auto_delete_objects=True,
            cors=[
                s3.CorsRule(
                    allowed_methods=[s3.HttpMethods.PUT],
                    allowed_origins=["*"],
                    allowed_headers=["*"],
                ),
            ]
        )
        self.banks_bucket = s3.Bucket(
            self, "BanksBucket",
            bucket_name="oysirs-banks-bucket",
            removal_policy=config['shared'].removal_policy,
            auto_delete_objects=True,
        )

        self.env_vars = {
            "BANKS_RAW_BUCKET_NAME": self.banks_raw_bucket.bucket_name,
            "BANKS_BUCKET_NAME": self.banks_bucket.bucket_name,
        }

        fargate_security_group = ec2.SecurityGroup(
            self, "FargateTaskSecurityGroup",
            vpc=config['shared'].vpc,
            description="Security group for Fargate tasks",
            allow_all_outbound=True
        )
        execution_role = iam.Role(
            self, "EcsTaskExecutionRole",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AmazonECSTaskExecutionRolePolicy"),
                # Read and write from s3
                # iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3FullAccess"),
            ]
        )
        task_role = iam.Role(
            self, "EcsTaskRole",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managed_policies=[
                # Read and write from s3
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3FullAccess"),
            ]
        )
        # self.banks_bucket.grant_read_write(task_role)
        # self.banks_raw_bucket.grant_read_write(task_role)
        self.grant_read_write(task_role)
        cluster = ecs.Cluster(
            self, "OysirsContainerCluster",
            cluster_name="oysirs-container-cluster",
            vpc=config['shared'].vpc,
        )
        analyze_assets = ecs.ContainerImage.from_asset(
            directory=str((Path(__file__).parent.parent.parent.parent).resolve()),
            file="oysirs/api/banks_s3_buckets/functions/banks_raw_processor/Dockerfile",
            exclude=[
                # Everything but not oysirs directory
                "*",
                "!oysirs/api/banks_s3_buckets/functions/banks_raw_processor/**",
                "!oysirs/shared/layers/**",
            ]
        )
        analyze_task_definition = ecs.FargateTaskDefinition(
            self, "AnalyzeTaskDef",
            memory_limit_mib=2048,
            cpu=256,
            execution_role=execution_role,
            task_role=task_role,
        )
        analyze_container = analyze_task_definition.add_container(
            "AnalyzeContainer",
            image=analyze_assets,
            logging=ecs.LogDrivers.aws_logs(stream_prefix="OysirsAnalyze"),
            container_name="oysirs-analyze-container",
            environment={
                **config['shared'].default_env_vars,
                **config['databases'].env_vars,
                **self.env_vars,
            }
        )
        
        bank_raw_lambda = _lambda.Function(
            self, "BankRawLambda",
            # function_name="bank-raw-lambda",
            description="Lambda function for banks raw bucket notifications",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="main.handler",
            code=_lambda.Code.from_asset(
                path=str((Path(__file__).parent / "functions/banks_raw_handler").resolve())
            ),
            memory_size=128,
            timeout=Duration.minutes(5),
            environment={
                **config['shared'].default_env_vars,
                **self.env_vars,
                "CLUSTER_ARN": cluster.cluster_arn,
                "TASK_DEFINITION_ARN": analyze_task_definition.task_definition_arn,
                "SUBNETS": ",".join([subnet.subnet_id for subnet in config['shared'].vpc.public_subnets]),
                "ANALYZE_CONTAINER_NAME": analyze_container.container_name,
                "SECURITY_GROUPS": fargate_security_group.security_group_id,
            },
            layers=[
                config['shared'].powertools_layer,
                config['shared'].common_layer,
                config['shared'].internal_layer,
            ],
        )
        bank_raw_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=[
                    "ecs:RunTask",
                    "ecs:DescribeTasks",
                    "iam:PassRole"  # Required to pass roles to ECS tasks
                ],
                resources=["*"]  # You can restrict this to specific resources if needed
            )
        )
        self.banks_raw_bucket.add_event_notification(
            s3.EventType.OBJECT_CREATED,
            s3n.LambdaDestination(bank_raw_lambda)
        )

    def grant_read_write(self, identity: iam.IGrantable) -> None:
        self.banks_raw_bucket.grant_read_write(identity)
        self.banks_bucket.grant_read_write(identity)