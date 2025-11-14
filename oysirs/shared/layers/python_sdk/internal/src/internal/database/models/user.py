from pydantic import Field
from enum import Enum

from .base import BaseModel


class UserGroup(str, Enum):
    STAFF = "staff"
    SUPERUSER = "superuser"


class UserModel(BaseModel):
    username: str
    sub: str
    email: str
    given_name: str
    gender: str
    groups: list[UserGroup]
    created_at: None = None
    updated_at: None = None