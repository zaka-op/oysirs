from aws_cdk import (
    aws_ec2 as ec2,
    aws_lambda as _lambda,
    Aws,
    RemovalPolicy,
    ILocalBundling
)
from constructs import Construct
from ..layer import Layer, LayerConfig
from typing import TypedDict
from pathlib import Path
import jsii
import subprocess
import shutil
import os

class SharedConfig(TypedDict):
    pass


class Shared(Construct):
    def __init__(self, scope: Construct, id: str, config: SharedConfig) -> None:
        super().__init__(scope, id)

        self.default_env_vars = {
            "LOG_LEVEL": "INFO",
            "POWERTOOLS_DEV": "true",
            "POWERTOOLS_TRACE_DISABLED": "true",
            "POWERTOOLS_LOGGER_LOG_EVENT": "true",
            "POWERTOOLS_SERVICE_NAME": "the-law-service",
        }
        self.removal_policy = RemovalPolicy.DESTROY
        # self.vpc = ec2.Vpc(
        #     self, "OysirsVPC",
        #     max_azs=2,
        #     nat_gateways=0,
        # )
        self.vpc = ec2.Vpc.from_lookup(
            self, "DefaultVPC",
            is_default=True
        )
        self.vpc.add_gateway_endpoint(
            "S3GatewayEndpoint",
            service=ec2.GatewayVpcEndpointAwsService.S3
        )
        self.powertools_layer = _lambda.LayerVersion.from_layer_version_arn(
            self, "PowertoolsLayer",
            layer_version_arn=f"arn:{Aws.PARTITION}:lambda:{Aws.REGION}:017000801446:layer:AWSLambdaPowertoolsPythonV3-python312-x86_64:18"
        )
        self.common_layer = Layer(
            self, "CommonLayer",
            config=LayerConfig(
                runtime=_lambda.Runtime.PYTHON_3_12,
                architecture=_lambda.Architecture.X86_64,
                path=str(Path(__file__).parent.joinpath("layers/common").resolve()),
                auto_upgrade=True,
                layer_type="txt"
            )
        ).layer
        self.internal_layer = Layer(
            self, "InternalLayer",
            config=LayerConfig(
                runtime=_lambda.Runtime.PYTHON_3_12,
                architecture=_lambda.Architecture.X86_64,
                path=str(Path(__file__).parent.joinpath("layers/python_sdk/internal").resolve()),
                auto_upgrade=True,
                layer_type="toml"
            )
        ).layer


# TODO: Improve generalization, error handling and logging
@jsii.implements(ILocalBundling)
class MyLocalBundler:
    def __init__(self, project_root):
        self.project_root = project_root

    def try_bundle(self, output_dir: str, options) -> bool:
        try:
            # 1. Install dependencies
            subprocess.run(["npm", "install", "--legacy-peer-deps"], cwd=self.project_root, check=True)
            # 2. Run the Next.js build
            subprocess.run(["npm", "run", "build"], cwd=self.project_root, check=True)
            # 3. Copy the 'out' folder contents to the CDK output directory
            dist_dir = os.path.join(self.project_root, "out")
            shutil.copytree(dist_dir, output_dir, dirs_exist_ok=True)
            return True
        except Exception as e:
            print(f"Local bundling failed: {e}")
            return False