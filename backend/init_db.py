import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.infrastructure.database import engine, Base
from src.infrastructure.orm_models import *

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully.")

if __name__ == "__main__":
    asyncio.run(init_models())
