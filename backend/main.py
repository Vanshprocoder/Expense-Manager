from datetime import date
from calendar import monthrange
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import (
    ShopSale,
    ShopExpense,
    PersonalSalary,
    PersonalExpense,
    HomeIncome,
    HomeExpense,
    SchoolFee,
    OpeningBalance,
)
import schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def month_bounds(year: int, month: int):
    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])
    return start, end


# paid_from: salary | shop_online | shop_cash | rent | other
# legacy value "shop" is treated as shop_cash
VALID_PAID_FROM = {"salary", "shop_online", "shop_cash", "shop", "rent", "other"}


def normalize_paid_from(paid_from: str) -> str:
    if paid_from == "shop":
        return "shop_cash"
    return paid_from


def validate_paid_from(paid_from: str) -> str:
    if paid_from not in VALID_PAID_FROM:
        raise HTTPException(
            400,
            "paid_from must be salary, shop_online, shop_cash, rent, or other",
        )
    return normalize_paid_from(paid_from)


def linked_home_amounts(db: Session, paid_from_values, start=None, end=None):
    """Sum home expenses + paid school fees for given paid_from values."""
    values = set(paid_from_values)
    # include legacy "shop" when asking for shop_cash
    if "shop_cash" in values:
        values.add("shop")

    he_q = db.query(HomeExpense).filter(HomeExpense.paid_from.in_(values))
    if start and end:
        he_q = he_q.filter(HomeExpense.expense_date >= start, HomeExpense.expense_date <= end)
    home_rows = he_q.all()

    sf_q = (
        db.query(SchoolFee)
        .filter(SchoolFee.paid_from.in_(values), SchoolFee.status == "paid")
    )
    if start and end:
        sf_q = sf_q.filter(SchoolFee.due_date >= start, SchoolFee.due_date <= end)
    fee_rows = sf_q.all()

    return sum(r.amount for r in home_rows) + sum(r.amount for r in fee_rows)


def linked_expense_rows(db: Session, paid_from_values, start=None, end=None):
    """Return home/school rows shaped like expense list items for cross-linking."""
    values = set(paid_from_values)
    if "shop_cash" in values:
        values.add("shop")

    items = []

    he_q = db.query(HomeExpense).filter(HomeExpense.paid_from.in_(values))
    if start and end:
        he_q = he_q.filter(HomeExpense.expense_date >= start, HomeExpense.expense_date <= end)
    for r in he_q.all():
        source = normalize_paid_from(r.paid_from)
        shop_source = "online" if source == "shop_online" else "cash" if source == "shop_cash" else None
        items.append(
            {
                "id": f"home-{r.id}",
                "expense_date": r.expense_date,
                "amount": r.amount,
                "category": r.category,
                "description": r.description,
                "is_major": False,
                "source": shop_source,
                "linked_from": "home",
                "linked_id": r.id,
                "editable": False,
            }
        )

    sf_q = (
        db.query(SchoolFee)
        .filter(SchoolFee.paid_from.in_(values), SchoolFee.status == "paid")
    )
    if start and end:
        sf_q = sf_q.filter(SchoolFee.due_date >= start, SchoolFee.due_date <= end)
    for r in sf_q.all():
        source = normalize_paid_from(r.paid_from)
        shop_source = "online" if source == "shop_online" else "cash" if source == "shop_cash" else None
        label = "School fee" + (f" · {r.child_name}" if r.child_name else "")
        items.append(
            {
                "id": f"school-{r.id}",
                "expense_date": r.due_date,
                "amount": r.amount,
                "category": label,
                "description": r.description,
                "is_major": True,
                "source": shop_source,
                "linked_from": "school",
                "linked_id": r.id,
                "editable": False,
            }
        )

    items.sort(key=lambda x: x["expense_date"], reverse=True)
    return items


def get_or_create_opening(db: Session) -> OpeningBalance:
    row = db.query(OpeningBalance).first()
    if not row:
        row = OpeningBalance(shop_online=0.0, shop_cash=0.0, personal=0.0, home=0.0)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


# ==================== SHOP SALES ====================
@app.get("/api/shop/sales", response_model=list[schemas.ShopSaleOut])
def list_shop_sales(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(ShopSale)
    if year and month:
        start, end = month_bounds(year, month)
        q = q.filter(ShopSale.sale_date >= start, ShopSale.sale_date <= end)
    return q.order_by(ShopSale.sale_date.desc()).all()


@app.post("/api/shop/sales", response_model=schemas.ShopSaleOut)
def create_shop_sale(payload: schemas.ShopSaleCreate, db: Session = Depends(get_db)):
    row = ShopSale(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/shop/sales/{sale_id}")
def delete_shop_sale(sale_id: int, db: Session = Depends(get_db)):
    row = db.query(ShopSale).filter(ShopSale.id == sale_id).first()
    if not row:
        raise HTTPException(404, "Sale not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


# ==================== SHOP EXPENSES ====================
@app.get("/api/shop/expenses")
def list_shop_expenses(
    year: Optional[int] = None,
    month: Optional[int] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db),
):
    start = end = None
    if year and month:
        start, end = month_bounds(year, month)

    q = db.query(ShopExpense)
    if start and end:
        q = q.filter(ShopExpense.expense_date >= start, ShopExpense.expense_date <= end)
    if source:
        q = q.filter(ShopExpense.source == source)

    items = [
        {
            "id": r.id,
            "expense_date": r.expense_date,
            "amount": r.amount,
            "source": r.source,
            "category": r.category,
            "description": r.description,
            "linked_from": None,
            "editable": True,
        }
        for r in q.order_by(ShopExpense.expense_date.desc()).all()
    ]

    # Home / school fees paid from shop wallets also appear here
    linked_values = []
    if source == "online":
        linked_values = ["shop_online"]
    elif source == "cash":
        linked_values = ["shop_cash"]
    elif source is None:
        linked_values = ["shop_online", "shop_cash"]

    if linked_values:
        for row in linked_expense_rows(db, linked_values, start, end):
            items.append(
                {
                    "id": row["id"],
                    "expense_date": row["expense_date"],
                    "amount": row["amount"],
                    "source": row["source"],
                    "category": row["category"],
                    "description": row["description"],
                    "linked_from": row["linked_from"],
                    "editable": False,
                }
            )
        items.sort(key=lambda x: x["expense_date"], reverse=True)

    return items


@app.post("/api/shop/expenses", response_model=schemas.ShopExpenseOut)
def create_shop_expense(payload: schemas.ShopExpenseCreate, db: Session = Depends(get_db)):
    if payload.source not in ("online", "cash"):
        raise HTTPException(400, "source must be 'online' or 'cash'")
    row = ShopExpense(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/shop/expenses/{expense_id}")
def delete_shop_expense(expense_id: int, db: Session = Depends(get_db)):
    row = db.query(ShopExpense).filter(ShopExpense.id == expense_id).first()
    if not row:
        raise HTTPException(404, "Expense not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/shop/summary")
def shop_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    today = date.today()
    year = year or today.year
    month = month or today.month
    start, end = month_bounds(year, month)

    # previous month
    if month == 1:
        py, pm = year - 1, 12
    else:
        py, pm = year, month - 1
    p_start, p_end = month_bounds(py, pm)

    sales = db.query(ShopSale).filter(ShopSale.sale_date >= start, ShopSale.sale_date <= end).all()
    prev_sales = db.query(ShopSale).filter(ShopSale.sale_date >= p_start, ShopSale.sale_date <= p_end).all()
    expenses = db.query(ShopExpense).filter(ShopExpense.expense_date >= start, ShopExpense.expense_date <= end).all()

    online_sales = sum(s.online_amount for s in sales)
    cash_sales = sum(s.cash_amount for s in sales)
    total_sales = online_sales + cash_sales

    prev_total = sum(s.online_amount + s.cash_amount for s in prev_sales)

    shop_online_exp = sum(e.amount for e in expenses if e.source == "online")
    shop_cash_exp = sum(e.amount for e in expenses if e.source == "cash")
    linked_online = linked_home_amounts(db, ["shop_online"], start, end)
    linked_cash = linked_home_amounts(db, ["shop_cash"], start, end)

    online_expenses = shop_online_exp + linked_online
    cash_expenses = shop_cash_exp + linked_cash

    # Lifetime balances for account & cash in hand (includes home/school paid from shop)
    all_sales = db.query(ShopSale).all()
    all_expenses = db.query(ShopExpense).all()
    lifetime_online_sales = sum(s.online_amount for s in all_sales)
    lifetime_cash_sales = sum(s.cash_amount for s in all_sales)
    lifetime_online_exp = (
        sum(e.amount for e in all_expenses if e.source == "online")
        + linked_home_amounts(db, ["shop_online"])
    )
    lifetime_cash_exp = (
        sum(e.amount for e in all_expenses if e.source == "cash")
        + linked_home_amounts(db, ["shop_cash"])
    )

    opening = get_or_create_opening(db)

    return {
        "year": year,
        "month": month,
        "online_sales": online_sales,
        "cash_sales": cash_sales,
        "total_sales": total_sales,
        "online_expenses": online_expenses,
        "cash_expenses": cash_expenses,
        "shop_only_expenses": shop_online_exp + shop_cash_exp,
        "linked_home_expenses": linked_online + linked_cash,
        "total_expenses": online_expenses + cash_expenses,
        "opening_shop_online": opening.shop_online,
        "opening_shop_cash": opening.shop_cash,
        "account_balance": opening.shop_online + lifetime_online_sales - lifetime_online_exp,
        "cash_in_hand": opening.shop_cash + lifetime_cash_sales - lifetime_cash_exp,
        "previous_month_sales": prev_total,
        "sales_change": total_sales - prev_total,
        "sales_change_percent": (
            round(((total_sales - prev_total) / prev_total) * 100, 1) if prev_total else None
        ),
    }


# ==================== PERSONAL ====================
@app.get("/api/personal/salaries", response_model=list[schemas.PersonalSalaryOut])
def list_salaries(db: Session = Depends(get_db)):
    return db.query(PersonalSalary).order_by(PersonalSalary.year.desc(), PersonalSalary.month.desc()).all()


@app.post("/api/personal/salaries", response_model=schemas.PersonalSalaryOut)
def create_salary(payload: schemas.PersonalSalaryCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(PersonalSalary)
        .filter(PersonalSalary.month == payload.month, PersonalSalary.year == payload.year)
        .first()
    )
    if existing:
        existing.amount = payload.amount
        existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        return existing
    row = PersonalSalary(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/personal/salaries/{salary_id}")
def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    row = db.query(PersonalSalary).filter(PersonalSalary.id == salary_id).first()
    if not row:
        raise HTTPException(404, "Salary not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/personal/expenses")
def list_personal_expenses(
    year: Optional[int] = None,
    month: Optional[int] = None,
    major_only: bool = False,
    db: Session = Depends(get_db),
):
    start = end = None
    if year and month:
        start, end = month_bounds(year, month)

    q = db.query(PersonalExpense)
    if start and end:
        q = q.filter(PersonalExpense.expense_date >= start, PersonalExpense.expense_date <= end)
    if major_only:
        q = q.filter(PersonalExpense.is_major == 1)
    rows = q.order_by(PersonalExpense.expense_date.desc()).all()

    items = [
        {
            "id": r.id,
            "expense_date": r.expense_date,
            "amount": r.amount,
            "category": r.category,
            "is_major": bool(r.is_major),
            "description": r.description,
            "linked_from": None,
            "editable": True,
        }
        for r in rows
    ]

    # Home / school fees paid from salary also appear against salary
    if not major_only:
        for row in linked_expense_rows(db, ["salary"], start, end):
            items.append(
                {
                    "id": row["id"],
                    "expense_date": row["expense_date"],
                    "amount": row["amount"],
                    "category": row["category"],
                    "is_major": row["is_major"],
                    "description": row["description"],
                    "linked_from": row["linked_from"],
                    "editable": False,
                }
            )
        items.sort(key=lambda x: x["expense_date"], reverse=True)

    return items


@app.post("/api/personal/expenses", response_model=schemas.PersonalExpenseOut)
def create_personal_expense(payload: schemas.PersonalExpenseCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["is_major"] = 1 if data.pop("is_major") else 0
    row = PersonalExpense(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "expense_date": row.expense_date,
        "amount": row.amount,
        "category": row.category,
        "is_major": bool(row.is_major),
        "description": row.description,
    }


@app.delete("/api/personal/expenses/{expense_id}")
def delete_personal_expense(expense_id: int, db: Session = Depends(get_db)):
    row = db.query(PersonalExpense).filter(PersonalExpense.id == expense_id).first()
    if not row:
        raise HTTPException(404, "Expense not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/personal/summary")
def personal_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    today = date.today()
    year = year or today.year
    month = month or today.month
    start, end = month_bounds(year, month)

    salary = (
        db.query(PersonalSalary)
        .filter(PersonalSalary.month == month, PersonalSalary.year == year)
        .first()
    )
    salary_amount = salary.amount if salary else 0.0

    expenses = (
        db.query(PersonalExpense)
        .filter(PersonalExpense.expense_date >= start, PersonalExpense.expense_date <= end)
        .all()
    )
    personal_only = sum(e.amount for e in expenses)
    major_expenses = sum(e.amount for e in expenses if e.is_major)
    linked_from_home = linked_home_amounts(db, ["salary"], start, end)
    total_expenses = personal_only + linked_from_home
    savings = salary_amount - total_expenses

    opening = get_or_create_opening(db)
    all_salaries = sum(s.amount for s in db.query(PersonalSalary).all())
    all_personal_exp = sum(e.amount for e in db.query(PersonalExpense).all())
    all_linked_salary = linked_home_amounts(db, ["salary"])
    available_balance = opening.personal + all_salaries - all_personal_exp - all_linked_salary

    return {
        "year": year,
        "month": month,
        "salary": salary_amount,
        "personal_only_expenses": personal_only,
        "linked_home_expenses": linked_from_home,
        "total_expenses": total_expenses,
        "major_expenses": major_expenses,
        "month_end_savings": savings,
        "opening_personal": opening.personal,
        "available_balance": available_balance,
    }


# ==================== HOME ====================
@app.get("/api/home/incomes", response_model=list[schemas.HomeIncomeOut])
def list_home_incomes(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(HomeIncome)
    if year and month:
        start, end = month_bounds(year, month)
        q = q.filter(HomeIncome.income_date >= start, HomeIncome.income_date <= end)
    return q.order_by(HomeIncome.income_date.desc()).all()


@app.post("/api/home/incomes", response_model=schemas.HomeIncomeOut)
def create_home_income(payload: schemas.HomeIncomeCreate, db: Session = Depends(get_db)):
    row = HomeIncome(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/home/incomes/{income_id}")
def delete_home_income(income_id: int, db: Session = Depends(get_db)):
    row = db.query(HomeIncome).filter(HomeIncome.id == income_id).first()
    if not row:
        raise HTTPException(404, "Income not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/home/expenses", response_model=list[schemas.HomeExpenseOut])
def list_home_expenses(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(HomeExpense)
    if year and month:
        start, end = month_bounds(year, month)
        q = q.filter(HomeExpense.expense_date >= start, HomeExpense.expense_date <= end)
    return q.order_by(HomeExpense.expense_date.desc()).all()


@app.post("/api/home/expenses", response_model=schemas.HomeExpenseOut)
def create_home_expense(payload: schemas.HomeExpenseCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["paid_from"] = validate_paid_from(data["paid_from"])
    row = HomeExpense(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/home/expenses/{expense_id}")
def delete_home_expense(expense_id: int, db: Session = Depends(get_db)):
    row = db.query(HomeExpense).filter(HomeExpense.id == expense_id).first()
    if not row:
        raise HTTPException(404, "Expense not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/home/school-fees", response_model=list[schemas.SchoolFeeOut])
def list_school_fees(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(SchoolFee)
    if year and month:
        start, end = month_bounds(year, month)
        q = q.filter(SchoolFee.due_date >= start, SchoolFee.due_date <= end)
    return q.order_by(SchoolFee.due_date.desc()).all()


@app.post("/api/home/school-fees", response_model=schemas.SchoolFeeOut)
def create_school_fee(payload: schemas.SchoolFeeCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["paid_from"] = validate_paid_from(data["paid_from"])
    row = SchoolFee(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.patch("/api/home/school-fees/{fee_id}")
def update_school_fee_status(fee_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    row = db.query(SchoolFee).filter(SchoolFee.id == fee_id).first()
    if not row:
        raise HTTPException(404, "Fee not found")
    if status not in ("pending", "paid"):
        raise HTTPException(400, "status must be pending or paid")
    row.status = status
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/home/school-fees/{fee_id}")
def delete_school_fee(fee_id: int, db: Session = Depends(get_db)):
    row = db.query(SchoolFee).filter(SchoolFee.id == fee_id).first()
    if not row:
        raise HTTPException(404, "Fee not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.get("/api/home/summary")
def home_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    today = date.today()
    year = year or today.year
    month = month or today.month
    start, end = month_bounds(year, month)

    incomes = db.query(HomeIncome).filter(HomeIncome.income_date >= start, HomeIncome.income_date <= end).all()
    expenses = db.query(HomeExpense).filter(HomeExpense.expense_date >= start, HomeExpense.expense_date <= end).all()
    fees = db.query(SchoolFee).filter(SchoolFee.due_date >= start, SchoolFee.due_date <= end).all()

    rent_income = sum(i.amount for i in incomes if i.source == "rent")
    other_income = sum(i.amount for i in incomes if i.source != "rent")
    total_expenses = sum(e.amount for e in expenses)
    school_fees_total = sum(f.amount for f in fees)
    school_fees_paid = sum(f.amount for f in fees if f.status == "paid")

    by_source = {}
    for e in expenses:
        by_source[e.paid_from] = by_source.get(e.paid_from, 0) + e.amount

    opening = get_or_create_opening(db)
    all_home_income = sum(i.amount for i in db.query(HomeIncome).all())
    all_rent_paid = linked_home_amounts(db, ["rent"])
    balance_in_hand = opening.home + all_home_income - all_rent_paid

    return {
        "year": year,
        "month": month,
        "rent_income": rent_income,
        "other_income": other_income,
        "total_income": rent_income + other_income,
        "total_expenses": total_expenses,
        "school_fees_total": school_fees_total,
        "school_fees_paid": school_fees_paid,
        "expenses_by_source": by_source,
        "opening_home": opening.home,
        "balance_in_hand": balance_in_hand,
    }


# ==================== DASHBOARD ====================
@app.get("/api/opening-balances", response_model=schemas.OpeningBalanceOut)
def get_opening_balances(db: Session = Depends(get_db)):
    return get_or_create_opening(db)


@app.put("/api/opening-balances", response_model=schemas.OpeningBalanceOut)
def update_opening_balances(payload: schemas.OpeningBalanceUpdate, db: Session = Depends(get_db)):
    row = get_or_create_opening(db)
    row.shop_online = float(payload.shop_online or 0)
    row.shop_cash = float(payload.shop_cash or 0)
    row.personal = float(payload.personal or 0)
    row.home = float(payload.home or 0)
    db.commit()
    db.refresh(row)
    return row


@app.get("/api/dashboard")
def dashboard(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    today = date.today()
    year = year or today.year
    month = month or today.month
    start, end = month_bounds(year, month)

    shop_sales = db.query(ShopSale).filter(ShopSale.sale_date >= start, ShopSale.sale_date <= end).all()
    shop_exp = db.query(ShopExpense).filter(ShopExpense.expense_date >= start, ShopExpense.expense_date <= end).all()
    salary = (
        db.query(PersonalSalary)
        .filter(PersonalSalary.month == month, PersonalSalary.year == year)
        .first()
    )
    personal_exp = (
        db.query(PersonalExpense)
        .filter(PersonalExpense.expense_date >= start, PersonalExpense.expense_date <= end)
        .all()
    )
    home_inc = db.query(HomeIncome).filter(HomeIncome.income_date >= start, HomeIncome.income_date <= end).all()
    home_exp = db.query(HomeExpense).filter(HomeExpense.expense_date >= start, HomeExpense.expense_date <= end).all()
    fees = db.query(SchoolFee).filter(SchoolFee.due_date >= start, SchoolFee.due_date <= end).all()

    shop_income = sum(s.online_amount + s.cash_amount for s in shop_sales)
    salary_income = salary.amount if salary else 0.0
    home_income = sum(i.amount for i in home_inc)

    total_income = shop_income + salary_income + home_income
    total_expenses = (
        sum(e.amount for e in shop_exp)
        + sum(e.amount for e in personal_exp)
        + sum(e.amount for e in home_exp)
        + sum(f.amount for f in fees if f.status == "paid")
    )

    # daily sales for chart (this month)
    daily = {}
    for s in shop_sales:
        key = s.sale_date.isoformat()
        daily[key] = daily.get(key, 0) + s.online_amount + s.cash_amount

    return {
        "year": year,
        "month": month,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net": total_income - total_expenses,
        "breakdown": {
            "shop_income": shop_income,
            "salary_income": salary_income,
            "home_income": home_income,
            "shop_expenses": sum(e.amount for e in shop_exp),
            "personal_expenses": sum(e.amount for e in personal_exp),
            "home_expenses": sum(e.amount for e in home_exp),
            "school_fees_paid": sum(f.amount for f in fees if f.status == "paid"),
        },
        "daily_shop_sales": [{"date": k, "amount": v} for k, v in sorted(daily.items())],
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
