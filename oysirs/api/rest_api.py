from aws_cdk import (
    aws_apigateway as apigw,
    aws_lambda as _lambda,
    aws_ec2 as ec2,
    aws_iam as iam,
    Duration,
)
from constructs import Construct
from typing import TypedDict
from pathlib import Path

from ..shared.main import Shared
from ..authentications.main import Authentications
from ..databases.main import Databases
from .banks_s3_buckets.main import BanksS3Buckets


class RestApiConfig(TypedDict):
    shared: Shared
    authentications: Authentications
    databases: Databases
    banks_s3_buckets: BanksS3Buckets


class RestApi(Construct):
    def __init__(self, scope: Construct, id: str, config: RestApiConfig) -> None:
        super().__init__(scope, id)

        api_security_group = ec2.SecurityGroup(
            self, "ApiSecurityGroup",
            vpc=config['shared'].vpc,
            security_group_name="oysirs-api-sg",
            description="Security group for Oysirs API Lambda functions",
            allow_all_outbound=True,
        )

        default_lambda = _lambda.Function(
            self, "OysirsRestApiHandler",
            # function_name="oysirs-rest-api-handler",
            description="Handler for Oysirs REST API",
            runtime=_lambda.Runtime.PYTHON_3_12,
            architecture=_lambda.Architecture.X86_64,
            handler="main.handler",
            code=_lambda.Code.from_asset(
                path=str(Path(__file__).parent.joinpath("functions/rest_handler").resolve())
            ),
            # vpc=config['shared'].vpc,
            # security_groups=[api_security_group],
            layers=[
                config['shared'].powertools_layer,
                config['shared'].common_layer,
                config['shared'].internal_layer,
            ],
            environment={
                **config['shared'].default_env_vars,
                **config['authentications'].env_vars,
                **config['databases'].env_vars,
                **config['banks_s3_buckets'].env_vars,
            },
            timeout=Duration.minutes(10),
            memory_size=512,
            # allow_public_subnet=True,
        )
        config['banks_s3_buckets'].grant_read_write(default_lambda.role)

        cognito_authorizer = apigw.CognitoUserPoolsAuthorizer(
            self, "CognitoAuthorizer",
            cognito_user_pools=[config['authentications'].user_pool]
        )

        self.api = apigw.LambdaRestApi(
            self, "OysirsRestApi",
            rest_api_name="Oysirs REST API",
            description="API Gateway for Oyo state internal revenue service",
            proxy=True,
            handler=default_lambda,
            deploy_options=apigw.StageOptions(
                stage_name="prod",
            ),
            default_method_options=apigw.MethodOptions(
                authorization_type=apigw.AuthorizationType.COGNITO,
                authorizer=cognito_authorizer,
            ),
        )

        # Exempt /swagger path from Cognito authorization
        swagger_resource = self.api.root.add_resource("swagger")
        swagger_resource.add_method(
            "ANY",
            integration=apigw.LambdaIntegration(default_lambda),
            authorization_type=apigw.AuthorizationType.NONE,
        )