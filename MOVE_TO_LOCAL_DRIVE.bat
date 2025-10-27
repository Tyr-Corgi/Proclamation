@echo off
echo ================================================
echo  Moving Proclamation to Local Windows Drive
echo ================================================
echo.
echo This will copy the project from Parallels shared
echo folder to your Windows Desktop to fix file watcher
echo and performance issues.
echo.
echo Source: C:\Mac\Home\Desktop\Repos\Proclamation
echo Target: C:\Users\%USERNAME%\Desktop\Proclamation
echo.
pause

echo.
echo Copying files... (this may take a minute)
xcopy "C:\Mac\Home\Desktop\Repos\Proclamation" "C:\Users\%USERNAME%\Desktop\Proclamation" /E /I /H /Y

echo.
echo ================================================
echo  Copy Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Open new terminal in: C:\Users\%USERNAME%\Desktop\Proclamation
echo.
echo 2. Start Backend:
echo    cd backend
echo    dotnet run --project Proclamation.API/Proclamation.API.csproj
echo.
echo 3. Start Mobile App (in another terminal):
echo    cd ProclamationApp
echo    npm install
echo    npm start
echo    Then press 'w' for web!
echo.
echo ================================================
echo.
pause

