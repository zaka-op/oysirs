from aws_lambda_powertools.event_handler.api_gateway import Router
from aws_lambda_powertools import Logger
import boto3
from internal.database.models.upload import *
from internal.database.helpers.upload import (
    insert_or_update_upload,
    get_upload_by_id,
    list_uploads,
)
import os


banks_raw_bucket_name = os.getenv('BANKS_RAW_BUCKET_NAME')
aws_region = os.getenv('AWS_REGION')

logger = Logger()
router = Router()

s3_client = boto3.client(
    's3', 
    region_name=aws_region,
    endpoint_url=f'https://s3.{aws_region}.amazonaws.com'
)
logger.info(f"S3 Client initialized for region: {aws_region}")
logger.info(f"Bucket name from env: {banks_raw_bucket_name}")

@router.post("/uploads/ingest")
def ingest_upload(body: UploadIngestModel) -> UploadUrlModel:
    """
    Ingest a new upload record.
    Args:
        body (UploadIngestModel): The upload ingestion data.
    """
    # Generate a presigned URL for uploading the file to S3
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': banks_raw_bucket_name,
            'Key': f"{body.year}__{body.bank}.xlsx"
        },
        ExpiresIn=3600  # URL expires in 1 hour
    )
    # Create a new upload record
    new_upload = UploadModel(
        year=body.year,
        bank=body.bank,
        status="pending",
        progress=0,
        message=""
    )
    insert_or_update_upload(new_upload)
    
    logger.info(f"New upload ingested: {new_upload.model_dump()}")
    return UploadUrlModel(url=presigned_url)

@router.get("/uploads")
def list_all_uploads() -> UploadListModel:
    """
    List all uploads.
    """
    uploads = list_uploads()
    logger.info(f"Retrieved {len(uploads.uploads)} uploads")
    return uploads