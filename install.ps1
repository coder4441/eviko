# 1. Node.js o'rnatish
Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.1/node-v20.18.1-x64.msi' -OutFile 'C:\Users\EVIKO\Downloads\node-setup.msi'
msiexec /i C:\Users\EVIKO\Downloads\node-setup.msi /qn /norestart ADDLOCAL=ALL

$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\node.exe' --version

# 2. Python o'rnatish
Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile 'C:\Users\EVIKO\Downloads\python-setup.exe'
Start-Process -FilePath 'C:\Users\EVIKO\Downloads\python-setup.exe' -ArgumentList '/quiet InstallAllUsers=1 PrependPath=1 Include_test=0' -Wait

# 3. PostgreSQL o'rnatish
Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64.exe' -OutFile 'C:\Users\EVIKO\Downloads\pg-setup.exe'
Start-Process -FilePath 'C:\Users\EVIKO\Downloads\pg-setup.exe' -ArgumentList '--mode unattended --superpassword postgres --servicename postgresql --serverport 5432 --unattendedmodeui none' -Wait

# 4. PostgreSQL database yaratish
$pgPath = 'C:\Program Files\PostgreSQL\16\bin'
& "$pgPath\psql.exe" -U postgres -c "CREATE DATABASE eviko_db;"
& "$pgPath\psql.exe" -U postgres -c "CREATE DATABASE billing_db;"

# 6. Frontend kutubxonalarni o'rnatish
Set-Location -Path "C:\Users\EVIKO\.gemini\antigravity\scratch\eviko-master\frontend"
npm install
npx prisma generate
npx prisma migrate dev --name init

# 8. Backend Python virtual environment
Set-Location -Path "C:\Users\EVIKO\.gemini\antigravity\scratch\eviko-master\backend"
$pythonPath = 'C:\Program Files\Python311'
& "$pythonPath\python.exe" -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# 9. Backend Alembic migratsiya
.\venv\Scripts\alembic.exe upgrade head

# 10. Serverlarni ishga tushurish
# Frontend (Alohida oynada yurgizing)
# cd C:\Users\EVIKO\.gemini\antigravity\scratch\eviko-master\frontend
# npm run dev

# Backend (Alohida oynada yurgizing)
# cd C:\Users\EVIKO\.gemini\antigravity\scratch\eviko-master\backend
# .\venv\Scripts\uvicorn main:app --reload --port 8000
