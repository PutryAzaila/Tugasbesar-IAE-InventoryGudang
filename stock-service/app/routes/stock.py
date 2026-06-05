from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies.auth import bearer_token, require_roles
from app.models import MovementReason, Stock, StockLocation, StockMovement
from app.schemas import StockAdjustment, StockInput
from app.services.item_client import ensure_item_exists

router = APIRouter()
guard = require_roles("admin", "manager")


@router.get("/stock", dependencies=[Depends(guard)])
def list_stock(db: Annotated[Session, Depends(get_db)]) -> list[dict]:
    rows = db.scalars(select(Stock).options(joinedload(Stock.location)).order_by(Stock.item_id)).all()
    return [serialize_stock(row) for row in rows]


@router.post("/stock", dependencies=[Depends(guard)], status_code=201)
def create_stock(
    payload: StockInput,
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str, Depends(bearer_token)],
) -> dict:
    ensure_item_exists(payload.item_id, authorization)
    ensure_location(db, payload.location_id)
    stock = Stock(
        item_id=payload.item_id,
        location_id=payload.location_id,
        quantity=payload.quantity,
        min_quantity=payload.min_quantity,
    )
    db.add(stock)
    try:
        db.flush()
        db.add(StockMovement(stock_id=stock.id, reason_id=reason_id(db, "INITIAL"), delta=payload.quantity, note="initial stock"))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="stock for item and location already exists") from exc
    return serialize_stock(find_stock(db, stock.id))


@router.get("/stock/{stock_id}", dependencies=[Depends(guard)])
def get_stock(stock_id: int, db: Annotated[Session, Depends(get_db)]) -> dict:
    return serialize_stock(find_stock(db, stock_id))


@router.put("/stock/{stock_id}", dependencies=[Depends(guard)])
def update_stock(
    stock_id: int,
    payload: StockInput,
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str, Depends(bearer_token)],
) -> dict:
    ensure_item_exists(payload.item_id, authorization)
    ensure_location(db, payload.location_id)
    stock = find_stock(db, stock_id)
    delta = payload.quantity - stock.quantity
    stock.item_id = payload.item_id
    stock.location_id = payload.location_id
    stock.quantity = payload.quantity
    stock.min_quantity = payload.min_quantity
    db.add(StockMovement(stock_id=stock.id, reason_id=reason_id(db, "MANUAL"), delta=delta, note="manual stock update"))
    db.commit()
    return serialize_stock(find_stock(db, stock_id))


@router.patch("/stock/{stock_id}/adjust", dependencies=[Depends(guard)])
def adjust_stock(stock_id: int, payload: StockAdjustment, db: Annotated[Session, Depends(get_db)]) -> dict:
    stock = find_stock(db, stock_id)
    new_quantity = stock.quantity + payload.delta
    if new_quantity < 0:
        raise HTTPException(status_code=400, detail="stock quantity cannot be negative")
    stock.quantity = new_quantity
    db.add(StockMovement(stock_id=stock.id, reason_id=reason_id(db, payload.reason_code), delta=payload.delta, note=payload.note))
    db.commit()
    return serialize_stock(find_stock(db, stock_id))


@router.delete("/stock/{stock_id}", dependencies=[Depends(guard)], status_code=204)
def delete_stock(stock_id: int, db: Annotated[Session, Depends(get_db)]) -> None:
    stock = find_stock(db, stock_id)
    db.delete(stock)
    db.commit()


@router.get("/stock-movements", dependencies=[Depends(guard)])
def list_movements(db: Annotated[Session, Depends(get_db)], item_id: int | None = None) -> list[dict]:
    statement = select(StockMovement).options(joinedload(StockMovement.stock), joinedload(StockMovement.reason)).order_by(StockMovement.id.desc()).limit(500)
    rows = db.scalars(statement).all()
    if item_id:
        rows = [row for row in rows if row.stock.item_id == item_id]
    return [
        {
            "id": row.id,
            "stock_id": row.stock_id,
            "item_id": row.stock.item_id,
            "reason": row.reason.code,
            "delta": row.delta,
            "note": row.note,
        }
        for row in rows
    ]


def find_stock(db: Session, stock_id: int) -> Stock:
    row = db.scalar(select(Stock).options(joinedload(Stock.location)).where(Stock.id == stock_id))
    if row is None:
        raise HTTPException(status_code=404, detail="stock not found")
    return row


def ensure_location(db: Session, location_id: int) -> None:
    if db.get(StockLocation, location_id) is None:
        raise HTTPException(status_code=400, detail="location not found")


def reason_id(db: Session, code: str) -> int:
    reason = db.scalar(select(MovementReason).where(MovementReason.code == code.strip().upper()))
    if reason is None:
        reason = db.scalar(select(MovementReason).where(MovementReason.code == "MANUAL"))
    if reason is None:
        raise HTTPException(status_code=500, detail="movement reason is not configured")
    return reason.id


def serialize_stock(stock: Stock) -> dict:
    return {
        "id": stock.id,
        "item_id": stock.item_id,
        "location_id": stock.location_id,
        "location": {"id": stock.location.id, "code": stock.location.code, "name": stock.location.name},
        "quantity": stock.quantity,
        "min_quantity": stock.min_quantity,
        "status": "LOW" if stock.quantity <= stock.min_quantity else "OK",
    }
