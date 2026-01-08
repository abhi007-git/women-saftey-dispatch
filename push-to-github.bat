@echo off
echo.
echo ========================================
echo   PUSH TO GITHUB - RUN THIS AFTER
echo   CREATING THE REPOSITORY
echo ========================================
echo.
echo Repository URL: https://github.com/abhi007-git/women-safety-dispatch
echo.
cd "c:\Users\psabh\DSA(el)"

git remote add origin https://github.com/abhi007-git/women-safety-dispatch.git
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   DONE! Code pushed to GitHub
echo ========================================
echo.
echo Next: Deploy on Render.com
echo   1. Go to https://render.com
echo   2. Sign up with GitHub
echo   3. New + Web Service
echo   4. Connect women-safety-dispatch repo
echo   5. Click Create Web Service
echo.
echo Your live links will be:
echo   Desktop: https://women-safety-dispatch.onrender.com/desktop/index.html
echo   Mobile:  https://women-safety-dispatch.onrender.com/mobile/index.html
echo.
pause
