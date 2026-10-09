import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.dependencies.auth import require_dm
from app.models import AdminUser
from app.schemas.daily import DailyRow, DailySummaryResponse, DailyBreakdownResponse
from app.schemas.monthly import MonthlyRow
from app.utils.pagination import PaginatedResponse, create_paginated_response
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/overview", response_model=DailySummaryResponse)
async def get_dm_overview(
    start_date: Optional[date] = Query(None, description="Start date filter YYYY-MM-DD"),
    end_date: Optional[date] = Query(None, description="End date filter YYYY-MM-DD"),
    month: Optional[int] = Query(None, description="Enrollment month YYYYMM"),
    db: AsyncSession = Depends(get_db),
    current_dm: AdminUser = Depends(require_dm)
):
    """
    Fetch DM Dashboard Overview.
    Automatically scoped to the authenticated DM's district.
    """
    # Use existing analytics service but strictly force dm_id to be current_dm.id
    return await AnalyticsService.get_daily_summary_overview(
        db=db,
        start_date=start_date,
        end_date=end_date,
        month=month,
        dm_id=current_dm.id,
        district_id=None
    )

@router.get("/daily", response_model=PaginatedResponse[DailyRow])
async def get_dm_daily_records(
    start_date: Optional[date] = Query(None, description="Start date filter YYYY-MM-DD"),
    end_date: Optional[date] = Query(None, description="End date filter YYYY-MM-DD"),
    month: Optional[int] = Query(None, description="Enrollment month YYYYMM"),
    station_id: Optional[str] = Query(None, description="Filter by Station ID"),
    operator_code: Optional[str] = Query(None, description="Filter by Operator Code"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_dm: AdminUser = Depends(require_dm)
):
    """
    Fetch Daily records specifically for this DM's district.
    """
    items, total = await AnalyticsService.get_daily_records(
        db=db,
        start_date=start_date,
        end_date=end_date,
        month=month,
        dm_id=current_dm.id,
        district_id=None,
        station_id=station_id,
        operator_code=operator_code,
        page=page,
        page_size=page_size
    )
    return create_paginated_response(items=items, total=total, page=page, page_size=page_size)

@router.get("/daily/breakdown", response_model=DailyBreakdownResponse)
async def get_dm_daily_breakdown(
    month: int = Query(..., description="Enrollment month YYYYMM"),
    station_id: str = Query(..., description="Station ID"),
    operator_code: str = Query(..., description="Operator Code"),
    db: AsyncSession = Depends(get_db),
    current_dm: AdminUser = Depends(require_dm)
):
    """
    Fetch Daily records breakdown for a specific DM station & operator
    """
    return await AnalyticsService.get_daily_breakdown(
        db=db,
        month=month,
        dm_id=current_dm.id,
        district_id=None,
        station_id=station_id,
        operator_code=operator_code
    )

@router.get("/monthly", response_model=PaginatedResponse[MonthlyRow])
async def get_dm_monthly_records(
    month: Optional[int] = Query(None, description="Enrollment month YYYYMM"),
    station_id: Optional[str] = Query(None, description="Filter by Station ID"),
    operator_code: Optional[str] = Query(None, description="Filter by Operator Code"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_dm: AdminUser = Depends(require_dm)
):
    """
    Fetch Monthly records specifically for this DM's district.
    """
    items, total = await AnalyticsService.get_monthly_records(
        db=db,
        month=month,
        dm_id=current_dm.id,
        district_id=None,
        station_id=station_id,
        operator_code=operator_code,
        page=page,
        page_size=page_size
    )
    return create_paginated_response(items=items, total=total, page=page, page_size=page_size)

