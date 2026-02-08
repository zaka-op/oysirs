from aws_cdk import (
    aws_cognito as cognito,
)
from constructs import Construct
from oysirs.shared.main import Shared
from typing import TypedDict

from ..user_interface.main import UserInterface


class AuthenticationsConfig(TypedDict):
    shared: Shared
    user_interface: UserInterface


class Authentications(Construct):
    def __init__(
        self, scope: Construct, id: str, config: AuthenticationsConfig
    ) -> None:
        super().__init__(scope, id)

        self.user_pool = cognito.UserPool(
            self,
            "UserPool",
            user_pool_name="oysirs_user_pool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(
                username=True,
                email=True,
            ),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=False),
                given_name=cognito.StandardAttribute(required=False, mutable=True),
                family_name=cognito.StandardAttribute(required=False, mutable=True),
            ),
            removal_policy=config["shared"].removal_policy,
        )

        cognito.CfnUserPoolGroup(
            self,
            "StaffGroup",
            user_pool_id=self.user_pool.user_pool_id,
            group_name="staff",
        )
        cognito.CfnUserPoolGroup(
            self,
            "SuperuserGroup",
            user_pool_id=self.user_pool.user_pool_id,
            group_name="superuser",
        )

        self.user_pool_client = cognito.UserPoolClient(
            self,
            "UserPoolClient",
            user_pool=self.user_pool,
            generate_secret=False,
            user_pool_client_name="oysirs_user_pool_client",
            o_auth=cognito.OAuthSettings(
                callback_urls=[
                    "http://localhost:3000",
                    config["user_interface"].domain_name,
                ],
                logout_urls=[
                    "http://localhost:3000",
                    config["user_interface"].domain_name,
                ],
                default_redirect_uri=config["user_interface"].domain_name,
                scopes=[
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.PHONE,
                ],
            ),
        )
        cognito.CfnUserPoolDomain(
            self,
            "UserPoolDomain",
            user_pool_id=self.user_pool.user_pool_id,
            domain="oysirs-auth-domain",
            managed_login_version=2,
        )

        self.env_vars = {
            "COGNITO_USER_POOL_ID": self.user_pool.user_pool_id,
            "COGNITO_USER_POOL_CLIENT_ID": self.user_pool_client.user_pool_client_id,
        }
