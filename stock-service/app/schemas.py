from pydantic import BaseModel, Field


class StockInput(BaseModel):
    item_id: int = Field(gt=0)
    location_id: int = Field(default=1, gt=0)
    quantity: int = Field(ge=0)
    min_quantity: int = Field(default=0, ge=0)


class StockAdjustment(BaseModel):
    delta: int
    reason_code: str = "MANUAL"
    note: str = ""
