from internal.database.models.upload import *
from internal.database.schemas.upload import *
from internal.database.session import get_session
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import joinedload
from aws_lambda_powertools import Logger

logger = Logger()


def get_upload_by_id(upload_id: str) -> UploadModel | None:
    """
    Retrieve an upload from the uploads table by its ID.

    Args:
        upload_id (str): The ID of the upload to retrieve.

    Returns:
        UploadModel | None: The upload object if found, otherwise None.
    """
    with get_session() as session:
        upload = session.get(Upload, upload_id)
        if upload:
            return UploadModel.model_validate(upload)
    return None


def insert_or_update_upload(upload: UploadModel) -> int:
    """
    Insert or update an upload in the uploads table.
    The update happens when there is an existing year and bank in the database.

    Args:
        upload (UploadModel): The upload data to insert or update.
    Returns:
        int: The ID of the inserted or updated upload.
    """
    with get_session() as session:
        stmt = insert(Upload).values(
            year=upload.year,
            bank=upload.bank,
            status=upload.status,
            progress=upload.progress,
            message=upload.message,
        ).on_conflict_do_update(
            index_elements=['year', 'bank'],
            set_={
                "status": upload.status,
                "progress": upload.progress,
                "message": upload.message,
            },
            where=(Upload.year == upload.year) & (Upload.bank == upload.bank)
        )
        session.execute(stmt)
    return upload.id


def list_uploads() -> UploadListModel:
    """
    List all uploads in the uploads table.

    Returns:
        UploadListModel: A list of all uploads.
    """
    with get_session() as session:
        uploads = session.execute(sa.select(Upload)).scalars().all()
        # return [UploadModel.model_validate(upload) for upload in uploads]
        return UploadListModel(
            uploads=[UploadModel.model_validate(upload) for upload in uploads],
            total=len(uploads),
            offset=0,
            limit=len(uploads),
        )
