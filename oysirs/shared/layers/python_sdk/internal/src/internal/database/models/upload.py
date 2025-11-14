from enum import Enum

from .base import BaseModel, CleanBaseModel


class UploadStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class UploadModel(BaseModel):
    year: int
    bank: str
    status: UploadStatus
    progress: int
    message: str = ""

class UploadUrlModel(CleanBaseModel):
    url: str

class UploadIngestModel(CleanBaseModel):
    year: int
    bank: str

class UploadListModel(CleanBaseModel):
    uploads: list[UploadModel] = []
    total: int = 0
    offset: int = 0
    limit: int = 10