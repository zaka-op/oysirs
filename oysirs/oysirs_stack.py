from aws_cdk import (
    Stack,
)
from constructs import Construct

from .api.main import OysirsApi
from .authentications.main import Authentications
from .databases.main import Databases
from .shared.main import Shared
from .user_interface.main import UserInterface

class OysirsStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        shared = Shared(
            self, "SharedResources", 
            config={}
        )
        databases = Databases(
            self, "Databases", 
            config={
                "shared": shared,
            }
        )
        user_interface = UserInterface(
            self, "UserInterface",
            config={
                "shared": shared,
            }
        )
        authentications = Authentications(
            self, "Authentications", 
            config={
                "shared": shared,
                "user_interface": user_interface,
            }
        )
        api = OysirsApi(
            self, "OysirsApi", 
            config={
                "shared": shared,
                "databases": databases,
                "authentications": authentications,
            }
        )
