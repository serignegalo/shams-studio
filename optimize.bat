@echo off
REM ============================================================
REM  SHAMS STUDIO - Optimisation des images pour le web
REM  Double-cliquez sur ce fichier pour compresser les photos
REM  du dossier assets\img\gallery
REM ============================================================

setlocal enabledelayedexpansion
cd /d "%~dp0assets\img\gallery"

echo.
echo ==========================================
echo   Compression des images en cours...
echo ==========================================
echo.

set count=0
for %%F in (*.jpg *.jpeg *.png) do (
    magick "%%F" -auto-orient -resize "1920x1920>" -strip -interlace JPEG -quality 82 "%%F"
    echo   [OK] %%F
    set /a count+=1
)

echo.
echo ==========================================
echo   Termine ! !count! image(s) optimisee(s)
echo ==========================================
echo.
echo Pensez ensuite a publier :
echo   git add -A
echo   git commit -m "Nouvelles photos optimisees"
echo   git push
echo.
pause
