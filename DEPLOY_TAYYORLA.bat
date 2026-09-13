@echo off
chcp 65001 >nul
title EVIKO POS - Server Tayyorlash

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║   EVIKO POS — Virtual Hosting Deploy Tayyorlash     ║
echo ║   cPanel + Phusion Passenger + PostgreSQL           ║
echo ╚══════════════════════════════════════════════════════╝
echo.

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend
set OUT=%ROOT%deploy_output

:: ── Eski output papkasini tozalash ──────────────────────
if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"
echo [✓] Output papkasi tayyor: deploy_output/
echo.

:: ── 1. NODE_ENV=production ni o'rnatish ─────────────────
echo [1/5] Environment tekshirilmoqda...
if not exist "%FRONTEND%\.env.production" (
    echo [!] .env.production topilmadi, .env.example dan nusxalanmoqda...
    copy "%FRONTEND%\.env.example" "%FRONTEND%\.env.production"
)
echo [✓] Environment fayl tayyor
echo.

:: ── 2. Dependencies o'rnatish ───────────────────────────
echo [2/5] Dependencies o'rnatilmoqda (npm ci)...
cd /d "%FRONTEND%"
call npm ci --prefer-offline 2>nul || call npm install
if errorlevel 1 (
    echo [✗] XATO: npm install muvaffaqiyatsiz!
    pause
    exit /b 1
)
echo [✓] Dependencies tayyor
echo.

:: ── 3. Prisma Client generatsiya ────────────────────────
echo [3/5] Prisma client generatsiya qilinmoqda...
call npx prisma generate
if errorlevel 1 (
    echo [!] Ogohlantirish: Prisma generate xato, davom etilmoqda...
)
echo [✓] Prisma client tayyor
echo.

:: ── 4. Production Build ──────────────────────────────────
echo [4/5] Production build qilinmoqda (bu biroz vaqt oladi)...
set NODE_ENV=production
call npm run build
if errorlevel 1 (
    echo [✗] XATO: Build muvaffaqiyatsiz! Yuqoridagi xatolarni tekshiring.
    pause
    exit /b 1
)
echo [✓] Build muvaffaqiyatli yakunlandi
echo.

:: ── 5. Deploy ZIP tayyorlash ─────────────────────────────
echo [5/5] Deploy ZIP tayyorlanmoqda...

:: Standalone build bo'lsa (output: 'standalone')
if exist "%FRONTEND%\.next\standalone" (
    echo     Standalone mode aniqlandi - optimal build!
    
    :: Standalone papkasini nusxalash
    xcopy /E /I /Q "%FRONTEND%\.next\standalone" "%OUT%\app" >nul
    
    :: Public fayllarni nusxalash
    xcopy /E /I /Q "%FRONTEND%\public" "%OUT%\app\public" >nul
    
    :: .next/static nusxalash
    xcopy /E /I /Q "%FRONTEND%\.next\static" "%OUT%\app\.next\static" >nul
    
    :: .env.production nusxalash
    copy "%FRONTEND%\.env.production" "%OUT%\app\.env" >nul
    
    :: server.js standalone papkasidagi server faylini almashtirish
    copy "%FRONTEND%\server.js" "%OUT%\app\server.js" >nul
    
    :: ZIP qilish
    powershell -Command "Compress-Archive -Force -Path '%OUT%\app\*' -DestinationPath '%OUT%\eviko_deploy.zip'"
) else (
    echo     Oddiy build mode
    powershell -Command ^
      "Compress-Archive -Force -Path @( ^
        '%FRONTEND%\.next', ^
        '%FRONTEND%\public', ^
        '%FRONTEND%\prisma', ^
        '%FRONTEND%\package.json', ^
        '%FRONTEND%\next.config.mjs', ^
        '%FRONTEND%\postcss.config.js', ^
        '%FRONTEND%\tailwind.config.ts', ^
        '%FRONTEND%\tsconfig.json', ^
        '%FRONTEND%\server.js' ^
      ) -DestinationPath '%OUT%\eviko_deploy.zip'"
)

:: Prisma migration fayllarini alohida ZIP qilish
powershell -Command "Compress-Archive -Force -Path '%FRONTEND%\prisma\migrations' -DestinationPath '%OUT%\migrations.zip'"

:: .env.production shablonini nusxalash (parolsiz version)
copy "%FRONTEND%\.env.production" "%OUT%\env_template.txt" >nul

echo [✓] ZIP fayllar tayyor
echo.

:: ── Natija ───────────────────────────────────────────────
echo ╔══════════════════════════════════════════════════════╗
echo ║                  TAYYOR! 🎉                          ║
echo ╠══════════════════════════════════════════════════════╣
echo ║  deploy_output/ papkasida:                          ║
echo ║  ├── eviko_deploy.zip    ← Asosiy kod               ║
echo ║  ├── migrations.zip      ← DB migration fayllar     ║
echo ║  └── env_template.txt    ← .env namunasi            ║
echo ╠══════════════════════════════════════════════════════╣
echo ║  Keyingi qadam: DEPLOY_QOLLANMA.md ni o'qing       ║
echo ╚══════════════════════════════════════════════════════╝
echo.

:: Papkani ochish
explorer "%OUT%"
pause
