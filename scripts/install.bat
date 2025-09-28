@echo off
REM Full-Stack Test Automation Framework Installation Script for Windows

echo 🚀 Starting Full-Stack Test Automation Framework Installation...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies. Please check the error messages above.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Install Playwright browsers
echo 🎭 Installing Playwright browsers...
npx playwright install

if %errorlevel% neq 0 (
    echo ❌ Failed to install Playwright browsers. Please check the error messages above.
    pause
    exit /b 1
)

echo ✅ Playwright browsers installed successfully

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist test-results mkdir test-results
if not exist allure-results mkdir allure-results
if not exist test-reports mkdir test-reports
if not exist test-data mkdir test-data

echo ✅ Directories created successfully

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy env.example .env
    echo ✅ Environment file created. Please edit .env with your configuration.
) else (
    echo ✅ Environment file already exists
)

REM Generate test data
echo 🎲 Generating test data...
node scripts/generate-test-data.js

if %errorlevel% neq 0 (
    echo ⚠️  Warning: Failed to generate test data. You can run this manually later with: npm run generate-test-data
) else (
    echo ✅ Test data generated successfully
)

REM Run a quick verification
echo 🧪 Running verification tests...

REM Test web tests (quick check)
echo   - Testing web test setup...
npx playwright test --grep "should display login form elements" --reporter=line >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Web tests setup verified
) else (
    echo     ⚠️  Web tests setup needs attention
)

REM Test API tests (quick check)
echo   - Testing API test setup...
npx jest tests/api/users.spec.ts --testNamePattern="should retrieve users list successfully" --silent >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ API tests setup verified
) else (
    echo     ⚠️  API tests setup needs attention
)

REM Test performance tests (quick check)
echo   - Testing performance test setup...
k6 run --duration 5s --vus 1 tests/performance/api-load-test.js >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Performance tests setup verified
) else (
    echo     ⚠️  Performance tests setup needs attention
)

echo.
echo 🎉 Installation completed successfully!
echo.
echo 📋 Next steps:
echo   1. Edit .env file with your configuration
echo   2. Run tests: npm test
echo   3. Generate reports: npm run report:generate
echo   4. View documentation: docs/SETUP_GUIDE.md
echo.
echo 🔧 Available commands:
echo   npm run test:web          - Run web tests
echo   npm run test:api          - Run API tests
echo   npm run test:performance  - Run performance tests
echo   npm run test              - Run all tests
echo   npm run report            - View test reports
echo.
echo Happy testing! 🚀
pause
