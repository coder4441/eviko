@echo off
chcp 65001 >nul
echo ============================================
echo   EVIKO POS - cPanel Deploy Tayyorlash
echo ============================================
echo.

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend
set BACKEND=%ROOT%backend
set OUT=%ROOT%deploy_output

:: Output papkasini tozalab yaratish
if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"

echo [1/4] Frontend build qilinmoqda...
cd /d "%FRONTEND%"
call npm run build
if errorlevel 1 (
    echo XATO: Frontend build muvaffaqiyatsiz!
    pause
    exit /b 1
)
echo    ✓ Build muvaffaqiyatli

echo.
echo [2/4] Frontend ZIP tayyorlanmoqda...
:: node_modules, .next cache, .env fayllar kirmasin
powershell -Command ^
  "Compress-Archive -Force -Path @( ^
    '%FRONTEND%\.next', ^
    '%FRONTEND%\public', ^
    '%FRONTEND%\src', ^
    '%FRONTEND%\prisma', ^
    '%FRONTEND%\package.json', ^
    '%FRONTEND%\package-lock.json', ^
    '%FRONTEND%\next.config.mjs', ^
    '%FRONTEND%\postcss.config.js', ^
    '%FRONTEND%\tailwind.config.ts', ^
    '%FRONTEND%\tsconfig.json', ^
    '%FRONTEND%\server.js', ^
    '%FRONTEND%\next-env.d.ts', ^
    '%FRONTEND%\.env.production', ^
    '%FRONTEND%\scripts' ^
  ) -DestinationPath '%OUT%\frontend_deploy.zip'"
echo    ✓ frontend_deploy.zip tayyor

echo.
echo [3/4] Backend ZIP tayyorlanmoqda...
powershell -Command ^
  "Compress-Archive -Force -Path @( ^
    '%BACKEND%\main.py', ^
    '%BACKEND%\passenger_wsgi.py', ^
    '%BACKEND%\requirements.txt', ^
    '%BACKEND%\alembic.ini', ^
    '%BACKEND%\alembic', ^
    '%BACKEND%\src', ^
    '%BACKEND%\.env.example', ^
    '%BACKEND%\init_db.py' ^
  ) -DestinationPath '%OUT%\backend_deploy.zip'"
echo    ✓ backend_deploy.zip tayyor

echo.
echo [4/4] Natija...
echo.
echo ============================================
echo   TAYYOR! deploy_output/ papkasida:
echo   - frontend_deploy.zip
echo   - backend_deploy.zip
echo ============================================
echo.
echo ESLATMA: .env faylini serverda alohida yarating!
echo   DATABASE_URL=postgresql+asyncpg://...
echo   JWT_SECRET=...
echo.
echo cPanel ga upload tartib:
echo   1. api.eviko.uz - Python App yarating
echo      - backend_deploy.zip ni yuklang
echo      - .env faylini yarating
echo      - pip install -r requirements.txt
echo.
echo   2. eviko.uz - Node.js App yarating
echo      - frontend_deploy.zip ni yuklang
echo      - .env.production ni tekshiring
echo      - npm install --production
echo      - npm start
echo.
pause
