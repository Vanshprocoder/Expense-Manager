from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum
import enum

from database import Base


class PaymentSource(str, enum.Enum):
    online = "online"
    cash = "cash"
    salary = "salary"
    rent = "rent"
    shop = "shop"
    other = "other"


class ShopSale(Base):
    __tablename__ = "shop_sales"

    id = Column(Integer, primary_key=True, index=True)
    sale_date = Column(Date, nullable=False, index=True)
    online_amount = Column(Float, default=0.0)
    cash_amount = Column(Float, default=0.0)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ShopExpense(Base):
    __tablename__ = "shop_expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)  # online | cash
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PersonalSalary(Base):
    __tablename__ = "personal_salaries"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PersonalExpense(Base):
    __tablename__ = "personal_expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    is_major = Column(Integer, default=0)  # 0 = no, 1 = yes
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class HomeIncome(Base):
    __tablename__ = "home_incomes"

    id = Column(Integer, primary_key=True, index=True)
    income_date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)  # rent | other
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class HomeExpense(Base):
    __tablename__ = "home_expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    paid_from = Column(String, nullable=False)  # salary | shop_online | shop_cash | rent | other
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SchoolFee(Base):
    __tablename__ = "school_fees"

    id = Column(Integer, primary_key=True, index=True)
    due_date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    paid_from = Column(String, nullable=False)  # salary | shop_online | shop_cash | rent | other
    child_name = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending | paid
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OpeningBalance(Base):
    """Single-row starting balances already available before / outside app tracking."""

    __tablename__ = "opening_balances"

    id = Column(Integer, primary_key=True, index=True)
    shop_online = Column(Float, default=0.0)
    shop_cash = Column(Float, default=0.0)
    personal = Column(Float, default=0.0)
    home = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
