@echo off
REM Create deployment package for XAMPP installation

echo ========================================
echo Creating Deployment Package
echo ========================================
echo.

REM Set package name
set PACKAGE_NAME=nautilus-reporting-v1.0.0
set PACKAGE_DIR=%PACKAGE_NAME%

REM Create package directory
echo Creating package directory...
if exist %PACKAGE_DIR% rmdir /s /q %PACKAGE_DIR%
mkdir %PACKAGE_DIR%

REM Copy essential files
echo Copying application files...
xcopy /E /I /Y pages %PACKAGE_DIR%\pages
xcopy /E /I /Y public %PACKAGE_DIR%\public
xcopy /E /I /Y types %PACKAGE_DIR%\types
xcopy /E /I /Y lib %PACKAGE_DIR%\lib
xcopy /E /I /Y styles %PACKAGE_DIR%\styles
xcopy /E /I /Y database %PACKAGE_DIR%\database
xcopy /E /I /Y scripts %PACKAGE_DIR%\scripts
xcopy /E /I /Y docs %PACKAGE_DIR%\docs

REM Copy configuration files
echo Copying configuration files...
copy package.json %PACKAGE_DIR%\
copy package-lock.json %PACKAGE_DIR%\
copy next.config.js %PACKAGE_DIR%\
copy tsconfig.json %PACKAGE_DIR%\
copy .env.example %PACKAGE_DIR%\

REM Copy documentation
echo Copying documentation...
copy README.md %PACKAGE_DIR%\
copy COMPLETE_FIX_SUMMARY.md %PACKAGE_DIR%\
copy QUICK_START_GUIDE.md %PACKAGE_DIR%\
copy DEPLOYMENT_PACKAGE_README.md %PACKAGE_DIR%\INSTALLATION_GUIDE.md
copy LOGIN_CREDENTIALS.txt %PACKAGE_DIR%\

REM Create .gitignore for package
echo Creating .gitignore...
echo node_modules/> %PACKAGE_DIR%\.gitignore
echo .next/>> %PACKAGE_DIR%\.gitignore
echo .env>> %PACKAGE_DIR%\.gitignore
echo .env.local>> %PACKAGE_DIR%\.gitignore

REM Create zip file
echo.
echo Creating ZIP file...
powershell Compress-Archive -Path %PACKAGE_DIR% -DestinationPath %PACKAGE_NAME%.zip -Force

REM Cleanup
echo Cleaning up...
rmdir /s /q %PACKAGE_DIR%

echo.
echo ========================================
echo Package created successfully!
echo ========================================
echo.
echo Package: %PACKAGE_NAME%.zip
echo Size: 
dir %PACKAGE_NAME%.zip | findstr /C:"%PACKAGE_NAME%"
echo.
echo Ready to install on XAMPP server!
echo.
pause

