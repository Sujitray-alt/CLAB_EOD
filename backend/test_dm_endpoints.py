import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models import AdminUser, UserRole
from sqlalchemy import select
from app.utils.security import create_access_token
import httpx

async def test():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(AdminUser).where(AdminUser.role == UserRole.DISTRICT_MANAGER))
        dm = res.scalar()
        if not dm:
            print("No DM found")
            return
        
        token = create_access_token(str(dm.id))
        
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {token}"}
            print("Testing /api/filters/options")
            r1 = await client.get("http://localhost:8000/api/filters/options", headers=headers)
            print(r1.status_code, r1.text[:100])

            print("Testing /api/dm/overview")
            r2 = await client.get("http://localhost:8000/api/dm/overview", headers=headers)
            print(r2.status_code, r2.text[:200])

if __name__ == "__main__":
    asyncio.run(test())
