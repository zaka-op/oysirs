from pydantic import Field
from enum import Enum
from datetime import datetime

from .base import BaseModel, CleanBaseModel


class CustomerNameModel(BaseModel):
    name: str

class CustomerAddressModel(BaseModel):
    address: str

class CustomerMobileNoModel(BaseModel):
    mobile_no: str

class CustomerEmailModel(BaseModel):
    email: str

class CustomerTaxIdModel(BaseModel):
    tax_id: str

class CustomerTinModel(BaseModel):
    tin: str

class CustomerRcModel(BaseModel):
    rc: str

class CustomerModel(BaseModel):
    names: list[CustomerNameModel] = []
    addresses: list[CustomerAddressModel] = []
    mobiles: list[CustomerMobileNoModel] = []
    emails: list[CustomerEmailModel] = []
    tax_ids: list[CustomerTaxIdModel] = []
    tins: list[CustomerTinModel] = []
    rcs: list[CustomerRcModel] = []


class CustomerListModel(CleanBaseModel):
    customers: list[CustomerModel] = []
    total: int = 0
    offset: int = 0
    limit: int = 10

class TransactionSummaryModel(CleanBaseModel):
    bank: str
    total_trxns: int
    total_amount: float

class CustomerWithStatsModel(CleanBaseModel):
    customer: CustomerModel
    trxn_summary: list[TransactionSummaryModel] = []