import boto3
import os

from internal.tables.models.user import *


user_pool_id = os.getenv('COGNITO_USER_POOL_ID')

cognito_client = boto3.client('cognito-idp')
dynamodb_resource = boto3.resource('dynamodb')


def get_user(access_token: str) -> UserModel | None:
    """
    Retrieve user information from AWS Cognito using the provided access token.

    Args:
        access_token (str): The access token of the user.

    Returns:
        UserModel | None: A UserModel instance containing user information or None if not found.
    """
    try:
        response = cognito_client.get_user(AccessToken=access_token)
        groups_response = cognito_client.admin_list_groups_for_user(
            UserPoolId=user_pool_id,
            Username=response['Username']
        )
        return UserModel(
            **{attr['Name']: attr['Value'] for attr in response['UserAttributes']},
            username=response['Username'],
            groups=[UserGroup(group['GroupName']) for group in groups_response['Groups']]
        )
    except Exception as e:
        print(f"Error retrieving user information: {e}")
        return None