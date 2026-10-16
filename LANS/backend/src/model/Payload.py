# ------------------------------------------------------------------------------
# Pydantic Schemas for Normalized Lead Output
# ------------------------------------------------------------------------------
from typing import Optional

from pydantic import BaseModel


class LeadPayload(BaseModel):
    leadgen_id: str
    form_id: Optional[str] = "N/A"
    created_time: Optional[int] = None
    name: Optional[str] = "N/A"
    email: Optional[str] = "N/A"
    phone: Optional[str] = "N/A"