import uuid
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy import UniqueConstraint, ForeignKey, Uuid

from .base import Base


class Customer(Base):
    __tablename__ = 'customers'
    names: Mapped[list["CustomerName"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    addresses: Mapped[list["CustomerAddress"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    mobiles: Mapped[list["CustomerMobileNo"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    emails: Mapped[list["CustomerEmail"]] = relationship(back_populates="customer", cascade="all, delete-orphan")

class CustomerName(Base):
    __tablename__ = 'customers_name'
    name: Mapped[str] = mapped_column(nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey('customers.id', ondelete="CASCADE", onupdate="CASCADE"))
    customer: Mapped["Customer"] = relationship(back_populates="names")
    __table_args__ = (UniqueConstraint('name', 'customer_id', name='_name_customer_uc'),)

class CustomerAddress(Base):
    __tablename__ = 'customers_address'
    address: Mapped[str] = mapped_column(nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey('customers.id', ondelete="CASCADE", onupdate="CASCADE"))
    customer: Mapped["Customer"] = relationship(back_populates="addresses")
    __table_args__ = (UniqueConstraint('address', 'customer_id', name='_address_customer_uc'),)

class CustomerMobileNo(Base):
    __tablename__ = 'customers_mobile_no'
    mobile_no: Mapped[str] = mapped_column(nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey('customers.id', ondelete="CASCADE", onupdate="CASCADE"))
    customer: Mapped["Customer"] = relationship(back_populates="mobiles")
    __table_args__ = (
        UniqueConstraint('mobile_no', name='_mobile_no_uc'),
        UniqueConstraint('mobile_no', 'customer_id', name='_mobile_no_customer_uc'),
    )

class CustomerEmail(Base):
    __tablename__ = 'customers_email'
    email: Mapped[str] = mapped_column(nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey('customers.id', ondelete="CASCADE", onupdate="CASCADE"))
    customer: Mapped["Customer"] = relationship(back_populates="emails")
    __table_args__ = (
        UniqueConstraint('email', name='_email_uc'),
        UniqueConstraint('email', 'customer_id', name='_email_customer_uc'),
    )
