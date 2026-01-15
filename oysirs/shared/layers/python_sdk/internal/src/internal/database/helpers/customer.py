import os
from internal.database.session import get_session
from internal.database.schemas.customer import *
from internal.database.models.customer import *
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import joinedload


def get_customer_by_id(customer_id: str) -> CustomerModel | None:
    """
    Retrieve a customer from the customers table by their ID.

    Args:
        customer_id (str): The ID of the customer to retrieve.

    Returns:
        CustomerModel | None: The customer data if found, otherwise None.
    """
    with get_session() as session:
        customer = session.get(Customer, customer_id)
        if customer:
            return CustomerModel.model_validate(customer)
    return None

def insert_or_update_customer(customer: CustomerModel) -> int:
    """
    Insert or update a customer in the customers table.
    The update happens when there is customer ID provided.

    Args:
        customer (CustomerModel): The customer data to insert or update.
    Returns:
        int: The ID of the inserted or updated customer.
    """
    with get_session() as session:
        customer_id = customer.id
        if customer_id is None:
            customer_id = session.scalar(insert(Customer).returning(Customer.id))
        if customer.emails:
            emails = [{"email": entry.email, "customer_id": customer_id} for entry in customer.emails]
            session.execute(insert(CustomerEmail).values(emails).on_conflict_do_nothing())
        if customer.mobiles:
            mobiles = [{"mobile_no": entry.mobile_no, "customer_id": customer_id} for entry in customer.mobiles]
            session.execute(insert(CustomerMobileNo).values(mobiles).on_conflict_do_nothing())
        if customer.names:
            names = [{"name": entry.name, "customer_id": customer_id} for entry in customer.names]
            session.execute(insert(CustomerName).values(names).on_conflict_do_nothing())
        if customer.addresses:
            addresses = [{"address": entry.address, "customer_id": customer_id} for entry in customer.addresses]
            session.execute(insert(CustomerAddress).values(addresses).on_conflict_do_nothing())
        if customer.tax_ids:
            tax_ids = [{"tax_id": entry.tax_id, "customer_id": customer_id} for entry in customer.tax_ids]
            session.execute(insert(CustomerTaxId).values(tax_ids).on_conflict_do_nothing())
        if customer.tins:
            tins = [{"tin": entry.tin, "customer_id": customer_id} for entry in customer.tins]
            session.execute(insert(CustomerTin).values(tins).on_conflict_do_nothing())
        if customer.rcs:
            rcs = [{"rc": entry.rc, "customer_id": customer_id} for entry in customer.rcs]
            session.execute(insert(CustomerRc).values(rcs).on_conflict_do_nothing())
    return customer_id

def list_customers(
        name: str | None = None,
        email: str | None = None,
        mobile_no: str | None = None,
        tax_id: str | None = None,
        tin: str | None = None,
        rc: str | None = None,
        offset: int = 0,
        limit: int = 10,
) -> CustomerListModel:
    """
    List customers with optional filters.

    Args:
        name (str | None): The name of the customer to filter by.
        email (str | None): The email of the customer to filter by.
        mobile_no (str | None): The mobile number of the customer to filter by.
        tax_id (str | None): The tax ID of the customer to filter by.
        tin (str | None): The TIN of the customer to filter by.
        rc (str | None): The RC of the customer to filter by.
        offset (int): The offset for pagination.
        limit (int): The maximum number of records to return.

    Returns:
        CustomerListModel: A list of customers matching the filters.
    """
    # Implement the logic to query the customers table with the provided filters
    # and return the list of customers.

    with get_session() as session:
        query = sa.select(Customer)

        if name:
            query = query.join(Customer.names).filter(CustomerName.name.ilike(f"%{name}%"))
        if email:
            query = query.join(Customer.emails).filter(CustomerEmail.email.ilike(f"%{email}%"))
        if mobile_no:
            query = query.join(Customer.mobiles).filter(CustomerMobileNo.mobile_no.ilike(f"%{mobile_no}%"))
        if tax_id:
            query = query.join(Customer.tax_ids).filter(CustomerTaxId.tax_id.ilike(f"%{tax_id}%"))
        if tin:
            query = query.join(Customer.tins).filter(CustomerTin.tin.ilike(f"%{tin}%"))
        if rc:
            query = query.join(Customer.rcs).filter(CustomerRc.rc.ilike(f"%{rc}%"))

        # Count total before applying pagination
        count_query = sa.select(sa.func.count()).select_from(
            query.options(
                # Remove loading options for count query
            ).distinct().subquery()
        )
        total_count = session.scalar(count_query)

        # Remove duplicates if multiple joins
        query = query.options(
            joinedload(Customer.names),
            joinedload(Customer.addresses),
            joinedload(Customer.mobiles),
            joinedload(Customer.emails),
            joinedload(Customer.tax_ids),
            joinedload(Customer.tins),
            joinedload(Customer.rcs),
        ).distinct()

        # Pagination
        query = query.offset(offset).limit(limit)
        print(query.compile(compile_kwargs={"literal_binds": True}))
        customers = session.scalars(query).unique().all()
        return CustomerListModel(
            customers=[CustomerModel.model_validate(c) for c in customers],
            total=total_count,
            offset=offset,
            limit=limit
        )

def get_customer_id_from_emails(emails: list[str]) -> int | None:
    """
    Retrieve a customer ID from the customers_email table by their email.

    Args:
        emails (list[str]): The list of emails to search for.
    """
    with get_session() as session:
        return session.scalar(
            sa.select(CustomerEmail.customer_id).where(CustomerEmail.email.in_(emails))
        )

def get_customer_id_from_mobile_nos(mobile_nos: list[str]) -> int | None:
    """
    Retrieve a customer ID from the customers_mobile_no table by their mobile number.

    Args:
        mobile_nos (list[str]): The list of mobile numbers to search for.
    """
    with get_session() as session:
        return session.scalar(
            sa.select(CustomerMobileNo.customer_id).where(CustomerMobileNo.mobile_no.in_(mobile_nos))
        )

def get_customer_id_from_tax_ids(tax_ids: list[str]) -> int | None:
    """
    Retrieve a customer ID from the customers_tax_id table by their tax ID.

    Args:
        tax_ids (list[str]): The list of tax IDs to search for.
    """
    with get_session() as session:
        return session.scalar(
            sa.select(CustomerTaxId.customer_id).where(CustomerTaxId.tax_id.in_(tax_ids))
        )

def get_customer_id_from_tins(tins: list[str]) -> int | None:
    """
    Retrieve a customer ID from the customers_tin table by their TIN.

    Args:
        tins (list[str]): The list of TINs to search for.
    """
    with get_session() as session:
        return session.scalar(
            sa.select(CustomerTin.customer_id).where(CustomerTin.tin.in_(tins))
        )

def get_customer_id_from_rcs(rcs: list[str]) -> int | None:
    """
    Retrieve a customer ID from the customers_rc table by their RC.

    Args:
        rcs (list[str]): The list of RCs to search for.
    """
    with get_session() as session:
        return session.scalar(
            sa.select(CustomerRc.customer_id).where(CustomerRc.rc.in_(rcs))
        )