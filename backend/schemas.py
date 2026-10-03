from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Shop ----------
class ShopSaleCreate(BaseModel):
    sale_date: date
    online_amount: float = 0.0
    cash_amount: float = 0.0
    notes: Optional[str] = None


class ShopSaleOut(ShopSaleCreate):
    id: int

    class Config:
        from_attributes = True


class ShopExpenseCreate(BaseModel):
    expense_date: date
    amount: float = Field(gt=0)
    source: str  # online | cash
    category: Optional[str] = None
    description: Optional[str] = None


class ShopExpenseOut(ShopExpenseCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Personal ----------
class PersonalSalaryCreate(BaseModel):
    month: int = Field(ge=1, le=12)
    year: int
    amount: float = Field(gt=0)
    notes: Optional[str] = None


class PersonalSalaryOut(PersonalSalaryCreate):
    id: int

    class Config:
        from_attributes = True


class PersonalExpenseCreate(BaseModel):
    expense_date: date
    amount: float = Field(gt=0)
    category: str
    is_major: bool = False
    description: Optional[str] = None


class PersonalExpenseOut(BaseModel):
    id: int
    expense_date: date
    amount: float
    category: str
    is_major: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Home ----------
class HomeIncomeCreate(BaseModel):
    income_date: date
    amount: float = Field(gt=0)
    source: str = "rent"
    description: Optional[str] = None


class HomeIncomeOut(HomeIncomeCreate):
    id: int

    class Config:
        from_attributes = True


class HomeExpenseCreate(BaseModel):
    expense_date: date
    amount: float = Field(gt=0)
    paid_from: str  # salary | shop_online | shop_cash | rent | other
    category: str
    description: Optional[str] = None


class HomeExpenseOut(HomeExpenseCreate):
    id: int

    class Config:
        from_attributes = True


class SchoolFeeCreate(BaseModel):
    due_date: date
    amount: float = Field(gt=0)
    paid_from: str  # salary | shop_online | shop_cash | rent | other
    child_name: Optional[str] = None
    status: str = "pending"
    description: Optional[str] = None


class SchoolFeeOut(SchoolFeeCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Opening balances ----------
class OpeningBalanceUpdate(BaseModel):
    shop_online: float = 0.0
    shop_cash: float = 0.0
    personal: float = 0.0
    home: float = 0.0


class OpeningBalanceOut(OpeningBalanceUpdate):
    id: int

    class Config:
        from_attributes = True
