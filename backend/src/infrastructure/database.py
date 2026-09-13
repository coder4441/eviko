from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base, declared_attr
from src.core.config import settings

# Async Engine Setup — Ko'p foydalanuvchi uchun optimallashtirilgan
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    # === CONNECTION POOL SOZLAMALARI ===
    pool_size=20,          # Doimiy ochiq ulanishlar soni (20 kassir = 20 ulanish)
    max_overflow=30,       # Qo'shimcha ulanishlar (jami max: 50)
    pool_timeout=30,       # Ulanish kutish vaqti (sekund)
    pool_recycle=1800,     # 30 daqiqada ulanishni yangilash (stale connection oldini olish)
    pool_pre_ping=True,    # Har so'rovdan avval ulanishni tekshirish
)

SessionFactory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

class BaseCustom:
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"
    
    # Can add common columns here like created_at if needed, but we will put it in the base classes directly.

Base = declarative_base(cls=BaseCustom)

async def get_db_session() -> AsyncSession:
    async with SessionFactory() as session:
        yield session
