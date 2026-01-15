from aws_lambda_powertools.event_handler.api_gateway import Router
from aws_lambda_powertools import Logger
from aws_lambda_powertools.event_handler.openapi.params import Query
from typing import Annotated
from internal.database.models.customer import (
    CustomerModel,
    CustomerListModel,
    CustomerWithStatsModel,
    TransactionSummaryModel,
)
from internal.database.helpers.customer import (
    list_customers as db_list_customers,
    get_customer_by_id
)
import boto3
import os
import io
from pathlib import Path
import pandas as pd
from datetime import date


banks_bucket_name = os.getenv('BANKS_BUCKET_NAME')
aws_region = os.getenv('AWS_REGION')

logger = Logger()
router = Router()

s3_client = boto3.client(
    's3', 
    region_name=aws_region,
    endpoint_url=f'https://s3.{aws_region}.amazonaws.com'
)


@router.get("/customers")
def list_customers(
    name: Annotated[str | None, Query()] = None,
    email: Annotated[str | None, Query()] = None,
    mobile_no: Annotated[str | None, Query()] = None,
    tax_id: Annotated[str | None, Query()] = None,
    tin: Annotated[str | None, Query()] = None,
    rc: Annotated[str | None, Query()] = None,
    offset: Annotated[int, Query()] = 0,
    limit: Annotated[int, Query()] = 10,
) -> CustomerListModel:
    """
    List customers with optional pagination.
    """
    customers = db_list_customers(
        name=name,
        email=email,
        mobile_no=mobile_no,
        tax_id=tax_id,
        tin=tin,
        rc=rc,
        offset=offset,
        limit=limit,
    )
    return customers

@router.get("/customers/<customer_id>")
def get_customer(
    customer_id: int,
    year: Annotated[int, Query()] = date.today().year,
    bank: Annotated[str, Query()] = "all",
) -> CustomerWithStatsModel | None:
    """
    Get a customer by their ID, including transaction statistics for a given year and bank.
    """
    customer = get_customer_by_id(customer_id)
    if not customer:
        return None, 404

    # Here you would typically fetch the transaction statistics based on the year and bank
    trxn_summary = []
    obj_list = s3_client.list_objects_v2(Bucket=banks_bucket_name, Prefix=f"{year}/")
    for obj in obj_list.get('Contents', []):
        if (bank.lower() == "all" or f"{bank}" in obj['Key']) and obj['Key'].endswith('.parquet'):
            trxn_key = obj['Key']
            bank_name = Path(trxn_key).stem
            obj = s3_client.get_object(Bucket=banks_bucket_name, Key=trxn_key)
            trxn_data = io.BytesIO(obj['Body'].read())
            df = pd.read_parquet(trxn_data)
            customer_trxns = df[df['CUSTOMER_ID'] == customer_id]
            trxn_summary.append(TransactionSummaryModel(
                bank=bank_name,
                total_trxns=len(customer_trxns),
                total_amount=float(customer_trxns['TRXN_AMOUNT'].sum()),
            ))

    return CustomerWithStatsModel(customer=customer, trxn_summary=trxn_summary)