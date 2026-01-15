from aws_cdk import (
    aws_rds as rds,
    aws_ec2 as ec2,
    aws_lambda as _lambda,
    custom_resources as cr,
    RemovalPolicy,
    SecretValue,
    Duration,
    CustomResource,
)
from constructs import Construct
from typing import TypedDict
from pathlib import Path

from oysirs.shared.main import Shared


class DatabasesConfig(TypedDict):
    shared: Shared


class Databases(Construct):
    def __init__(self, scope: Construct, id: str, config: DatabasesConfig) -> None:
        super().__init__(scope, id)

        database_security_group = ec2.SecurityGroup(
            self, "DatabaseSecurityGroup",
            vpc=config['shared'].vpc,
            description="Security group for RDS database",
            allow_all_outbound=True
        )
        database_security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(5432),
            description="Allow PostgreSQL access from anywhere"
        )

        db_credentials = rds.Credentials.from_password(
            username="oysirs",
            password=SecretValue.unsafe_plain_text("Oysirs12345!")  # In production, use Secrets Manager or SSM Parameter Store
        )
        # db_cluster = rds.DatabaseCluster(
        #     self, "OysirsDBCluster",
        #     engine=rds.DatabaseClusterEngine.aurora_postgres(version=rds.AuroraPostgresEngineVersion.VER_17_5),
        #     credentials=db_credentials,
        #     writer=rds.ClusterInstance.serverless_v2("writer", publicly_accessible=True),
        #     vpc=config['shared'].vpc,
        #     vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
        #     security_groups=[database_security_group],
        #     serverless_v2_min_capacity=0,
        #     serverless_v2_max_capacity=1,
        #     removal_policy=RemovalPolicy.DESTROY,
        #     default_database_name="oysirsdb",
        # )
        db_instance = rds.DatabaseInstance(
            self, "OysirsDBInstance",
            engine=rds.DatabaseInstanceEngine.postgres(version=rds.PostgresEngineVersion.VER_17_5),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO,
            ),
            vpc=config['shared'].vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
            security_groups=[database_security_group],
            credentials=db_credentials,
            multi_az=False,
            allocated_storage=20,
            # max_allocated_storage=100,
            removal_policy=config['shared'].removal_policy,
            deletion_protection=False,
            database_name="oysirsdb",
        )
        self.env_vars = {
            # "DATABASE_HOST": db_cluster.cluster_endpoint.hostname,
            "DATABASE_HOST": db_instance.db_instance_endpoint_address,
            "DATABASE_PORT": db_instance.db_instance_endpoint_port,
            "DATABASE_NAME": "oysirsdb",
            "DATABASE_USERNAME": db_credentials.username,
            "DATABASE_PASSWORD": db_credentials.password.unsafe_unwrap(),
            "DATABASE_DRIVER": "postgresql+psycopg2",
        }
        migration_security_group = ec2.SecurityGroup(
            self, "MigrationLambdaSecurityGroup",
            vpc=config['shared'].vpc,
            description="Security group for Migration Lambda",
            allow_all_outbound=True
        )
        # Custom resource to initialize the database schema using an AWS Lambda function
        migration_lambda = _lambda.Function(
            self, "MigrationLambda",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="main.handler",
            code=_lambda.Code.from_asset(
                path=str((Path(__file__).parent / "functions/migrate").resolve())
            ),
            timeout=Duration.minutes(10),
            memory_size=512,
            environment={
                **config['shared'].default_env_vars,
                **self.env_vars,
            },
            # vpc=config['shared'].vpc,
            # vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
            # security_groups=[migration_security_group],
            layers=[
                config['shared'].powertools_layer,
                config['shared'].common_layer,
                config['shared'].internal_layer,
            ],
        )
        db_instance.grant_connect(
            migration_lambda.role, 
            db_credentials.username
        )

        migration_provider = cr.Provider(
            self, "MigrationProvider",
            on_event_handler=migration_lambda,
        )
        CustomResource(
            self, "MigrationCustomResource",
            service_token=migration_provider.service_token,
        )