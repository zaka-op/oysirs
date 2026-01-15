from pydantic import BaseModel as PydanticBaseModel
from datetime import datetime


class CleanBaseModel(PydanticBaseModel):
    class Config:
        from_attributes = True

class BaseModel(CleanBaseModel):
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
