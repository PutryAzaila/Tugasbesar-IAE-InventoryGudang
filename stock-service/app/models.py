from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StockLocation(Base):
    __tablename__ = "stock_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    code: Mapped[str] = mapped_column(String(40))
    name: Mapped[str] = mapped_column(String(120))


class MovementReason(Base):
    __tablename__ = "movement_reasons"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    code: Mapped[str] = mapped_column(String(40))
    name: Mapped[str] = mapped_column(String(120))


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    item_id: Mapped[int] = mapped_column(BigInteger)
    location_id: Mapped[int] = mapped_column(ForeignKey("stock_locations.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    min_quantity: Mapped[int] = mapped_column(Integer)
    location: Mapped[StockLocation] = relationship()


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id"))
    reason_id: Mapped[int] = mapped_column(ForeignKey("movement_reasons.id"))
    delta: Mapped[int] = mapped_column(Integer)
    note: Mapped[str | None] = mapped_column(String(255))
    stock: Mapped[Stock] = relationship()
    reason: Mapped[MovementReason] = relationship()
