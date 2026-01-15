from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.data_classes import event_source, S3Event
from internal.database.helpers.customer import (
    get_customer_by_id,
    list_customers, 
    get_customer_id_from_emails,
    get_customer_id_from_mobile_nos,
    get_customer_id_from_tax_ids,
    get_customer_id_from_tins,
    get_customer_id_from_rcs,
    insert_or_update_customer,
)
from internal.database.helpers.upload import (
    get_upload_by_id,
    list_uploads,
    insert_or_update_upload,
)
from internal.database.helpers.idx import (
    generate_id
)
from internal.database.schemas.base import tz_now
from internal.database.models.customer import *
from internal.database.models.upload import *
import os
import boto3
import io
import pandas as pd

from utils.helpers import (
    parse_email,
    parse_mobile_no,
    parse_name,
    parse_address,
    calc_time_diff_mins,
)


banks_bucket = os.environ['BANKS_BUCKET_NAME']
bucket_name = os.environ['BUCKET_NAME']
object_key = os.environ['OBJECT_KEY']
aws_region = os.getenv('AWS_REGION')

s3_client = boto3.client(
    's3', 
    region_name=aws_region,
    endpoint_url=f'https://s3.{aws_region}.amazonaws.com'
)

logger = Logger()
tracer = Tracer()


@tracer.capture_method
def handler():
    start_time = tz_now()
    logger.info(f"Processing file {object_key} from bucket {bucket_name}")

    year, bank = object_key.replace(".xlsx", "").split("__")
    year = int(year.strip())
    
    obj = s3_client.get_object(Bucket=bucket_name, Key=object_key)
    data = io.BytesIO(obj['Body'].read())
    df = pd.read_excel(data)
    customer_ids = []
    try:
        total_rows = len(df)
        progress_step = max(1, total_rows // 10)  # every 10%
        logger.info(f"Progress: 0% (1/{total_rows})")
        insert_or_update_upload(
            UploadModel(
                year=year,
                bank=bank,
                status=UploadStatus.IN_PROGRESS,
                progress=0,
                message="Started processing"
            )
        )
        for idx, row in df.iterrows():
            emails = parse_email(row.get("EMAIL"))
            mobile_nos = parse_mobile_no(row.get("MOBILE_NO"))
            names = parse_name(row.get("NAME"))
            address = parse_address(row.get("ADDRESS"))
            tax_ids = parse_name(row.get("TAX_ID"))  # Reuse parse_name for simple string parsing
            tins = parse_name(row.get("TIN"))
            rcs = parse_name(row.get("RC"))

            customer_id = get_customer_id_from_emails(emails)
            if not customer_id:
                customer_id = get_customer_id_from_mobile_nos(mobile_nos)
            if not customer_id and tax_ids:
                customer_id = get_customer_id_from_tax_ids(tax_ids)
            if not customer_id and tins:
                customer_id = get_customer_id_from_tins(tins)
            if not customer_id and rcs:
                customer_id = get_customer_id_from_rcs(rcs)
            customer_id = insert_or_update_customer(
                CustomerModel(
                    id=customer_id,
                    names=[CustomerNameModel(name=n) for n in names],
                    emails=[CustomerEmailModel(email=e) for e in emails],
                    mobiles=[CustomerMobileNoModel(mobile_no=m) for m in mobile_nos],
                    addresses=[CustomerAddressModel(address=address)] if address else [],
                    tax_ids=[CustomerTaxIdModel(tax_id=t) for t in tax_ids],
                    tins=[CustomerTinModel(tin=t) for t in tins],
                    rcs=[CustomerRcModel(rc=r) for r in rcs]
                )
            )
            customer_ids.append(customer_id)
            # --- Progress reporting ---
            if (idx + 1) % progress_step == 0 or (idx + 1) == total_rows:
                percent = int(((idx + 1) / total_rows) * 100)
                logger.info(f"Progress: {percent}% ({idx + 1}/{total_rows})")
                insert_or_update_upload(
                    UploadModel(
                        year=year,
                        bank=bank,
                        status=UploadStatus.IN_PROGRESS,
                        progress=percent,
                        message=f"Processed {idx + 1} of {total_rows} rows: elapsed { calc_time_diff_mins(start_time, tz_now()) }"
                    )
                )
        
        df['CUSTOMER_ID'] = customer_ids
        df = df[["CUSTOMER_ID", "TRXN_AMOUNT", "TRXN_DATE"]]

        trxn_data = io.BytesIO()
        df.to_parquet(trxn_data, engine='fastparquet')

        s3_client.put_object(
            Bucket=banks_bucket,
            Key=f"{year}/{bank}.parquet",
            Body=trxn_data.getvalue()
        )

        s3_client.delete_object(Bucket=bucket_name, Key=object_key)
        logger.info(f"Finished processing file {object_key} from bucket {bucket_name}")
        insert_or_update_upload(
            UploadModel(
                year=year,
                bank=bank,
                status=UploadStatus.COMPLETED,
                progress=100,
                message=f"Processing completed: elapsed { calc_time_diff_mins(start_time, tz_now()) }"
            )
        )
    except Exception as e:
        logger.exception(f"Error processing file {object_key} from bucket {bucket_name}: {e}")
        insert_or_update_upload(
            UploadModel(
                year=year,
                bank=bank,
                status=UploadStatus.FAILED,
                progress=0,
                message=f"Processing failed: {str(e)}"
            )
        )
        raise e


if __name__ == "__main__":
    handler()