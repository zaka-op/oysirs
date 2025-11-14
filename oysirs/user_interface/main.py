from aws_cdk import (
    aws_s3 as s3,
    aws_s3_deployment as s3_deploy,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as cloudfront_origins,
    RemovalPolicy,
    Duration,
    CfnOutput,
)
from constructs import Construct
from pathlib import Path
from typing import TypedDict

from ..shared.main import Shared


class UserInterfaceConfig(TypedDict):
    shared: Shared


class UserInterface(Construct):
    def __init__(self, scope: Construct, id: str, config: UserInterfaceConfig) -> None:
        super().__init__(scope, id)

        # Create S3 bucket for hosting the user interface
        ui_bucket = s3.Bucket(
            self, "UserInterfaceBucket",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
        )

        # Create CloudFront distribution for the S3 bucket
        distribution = cloudfront.Distribution(
            self, "UserInterfaceDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=cloudfront_origins.S3BucketOrigin.with_origin_access_control(ui_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(30)
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/404.html",
                    ttl=Duration.minutes(30)
                )
            ],
            comment="CloudFront distribution for Oysirs user interface",
        )

        # Deploy static files to the S3 bucket
        s3_deploy.BucketDeployment(
            self, "DeployUserInterface",
            sources=[
                s3_deploy.Source.asset(
                    path=str(Path(__file__).parent.joinpath("next-app/out").resolve())
                ),
            ],
            destination_bucket=ui_bucket,
            distribution=distribution,
            distribution_paths=["/*"],
        )

        self.domain_name = f"https://{distribution.domain_name}"

        # Output the CloudFront distribution domain name
        CfnOutput(
            self, "UserInterfaceURL",
            value=self.domain_name,
            description="URL of the Oysirs user interface",
        )