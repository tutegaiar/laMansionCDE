@echo off
REM Programa el sync de La Mansion en Windows:
REM  - al iniciar sesion (con 1 minuto de espera para que haya internet)
REM  - al apagar o reiniciar (evento 1074 de Windows)
REM Requiere que exista C:\LaMansion\ea-sync.cmd (el lanzador con SITE_URL y CRON_SECRET).

if not exist "C:\LaMansion\ea-sync.cmd" (
  echo No encuentro C:\LaMansion\ea-sync.cmd. Crealo primero.
  exit /b 1
)

REM Si existia la tarea de cada 30 minutos, se borra.
schtasks /delete /tn "La Mansion Sync" /f >nul 2>&1
schtasks /create /tn "La Mansion Sync - Al prender" /tr "C:\LaMansion\ea-sync.cmd" /sc onlogon /delay 0001:00 /f
schtasks /create /tn "La Mansion Sync - Al apagar" /tr "C:\LaMansion\ea-sync.cmd" /sc onevent /ec System /mo "*[System[(EventID=1074)]]" /f

echo.
echo Listo. Tareas programadas:
schtasks /query /tn "La Mansion Sync - Al prender" /fo list | findstr /i "Nombre TaskName Estado Status"
schtasks /query /tn "La Mansion Sync - Al apagar" /fo list | findstr /i "Nombre TaskName Estado Status"
