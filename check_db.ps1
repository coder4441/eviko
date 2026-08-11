$env:PGPASSWORD = "postgres"
$psql = "C:\tools\pgsql\bin\psql.exe"
& $psql -U postgres -d eviko_db -c "SELECT id FROM public.""Tenant"" LIMIT 5"
