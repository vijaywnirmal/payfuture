#!/bin/bash

# Full-Stack Test Automation Framework Installation Script

echo "🚀 Starting Full-Stack Test Automation Framework Installation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers. Please check the error messages above."
    exit 1
fi

# Install system dependencies (Linux/macOS)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Installing system dependencies..."
    npx playwright install-deps
fi

echo "✅ Playwright browsers installed successfully"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p test-results
mkdir -p allure-results
mkdir -p test-reports
mkdir -p test-data

echo "✅ Directories created successfully"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Generate test data
echo "🎲 Generating test data..."
node scripts/generate-test-data.js

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to generate test data. You can run this manually later with: npm run generate-test-data"
else
    echo "✅ Test data generated successfully"
fi

# Run a quick verification
echo "🧪 Running verification tests..."

# Test web tests (quick check)
echo "  - Testing web test setup..."
npx playwright test --grep "should display login form elements" --reporter=line > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "    ✅ Web tests setup verified"
else
    echo "    ⚠️  Web tests setup needs attention"
fi

# Test API tests (quick check)
echo "  - Testing API test setup..."
npx jest tests/api/users.spec.ts --testNamePattern="should retrieve users list successfully" --silent > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "    ✅ API tests setup verified"
else
    echo "    ⚠️  API tests setup needs attention"
fi

# Test performance tests (quick check)
echo "  - Testing performance test setup..."
k6 run --duration 5s --vus 1 tests/performance/api-load-test.js > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "    ✅ Performance tests setup verified"
else
    echo "    ⚠️  Performance tests setup needs attention"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Run tests: npm test"
echo "  3. Generate reports: npm run report:generate"
echo "  4. View documentation: docs/SETUP_GUIDE.md"
echo ""
echo "🔧 Available commands:"
echo "  npm run test:web          - Run web tests"
echo "  npm run test:api          - Run API tests"
echo "  npm run test:performance  - Run performance tests"
echo "  npm run test              - Run all tests"
echo "  npm run report            - View test reports"
echo ""
echo "Happy testing! 🚀"
