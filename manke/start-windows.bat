@echo off
chcp 65001 >nul
title Manke
cd /d "%~dp0"

echo.
echo  Manke – starter appen
echo  =====================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js er ikke installeret.
  echo  Hent LTS-versionen på https://nodejs.org, installér den, og dobbeltklik på denne fil igen.
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do echo  Node.js %%v fundet.
echo.

if not exist node_modules (
  echo  Første gang: installerer pakker. Det tager et par minutter...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo  Installationen fejlede. Tag et billede af skærmen, og vis det til Claude.
    pause
    exit /b 1
  )
  echo.
  echo  Tjekker at versionerne passer sammen...
  call npx expo install --fix
)

echo.
echo  Tjekker om du er logget ind hos Expo...
call npx expo whoami >nul 2>nul
if errorlevel 1 (
  echo  Log ind med din Expo-konto:
  call npx expo login
)

echo.
echo  Starter appen. Scan QR-koden med telefonens kamera, når den kommer frem.
echo  Spørger Windows om adgang til netværket, så tryk Tillad.
echo  Luk vinduet eller tryk Ctrl+C for at stoppe.
echo.
call npx expo start
pause
