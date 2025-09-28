#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Ensure test-data directory exists
const testDataDir = path.join(process.cwd(), 'test-data');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// Generate test users
function generateUsers(count = 100) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: i + 1,
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      password: faker.internet.password(12),
      phone: faker.phone.phoneNumber(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zipCode: faker.address.zipCode(),
        country: faker.address.country(),
      },
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    });
  }
  return users;
}

// Generate test products
function generateProducts(count = 50) {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      id: i + 1,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      inStock: faker.datatype.boolean(),
      quantity: faker.datatype.number({ min: 0, max: 100 }),
      imageUrl: faker.image.imageUrl(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    });
  }
  return products;
}

// Generate test orders
function generateOrders(count = 200, users, products) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    const user = faker.random.arrayElement(users);
    const productCount = faker.datatype.number({ min: 1, max: 5 });
    const orderItems = [];
    
    for (let j = 0; j < productCount; j++) {
      const product = faker.random.arrayElement(products);
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: faker.datatype.number({ min: 1, max: 3 }),
        price: product.price,
      });
    }
    
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orders.push({
      id: i + 1,
      userId: user.id,
      userEmail: user.email,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: faker.random.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      paymentMethod: faker.random.arrayElement(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
      shippingAddress: user.address,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    });
  }
  return orders;
}

// Generate API test scenarios
function generateApiTestScenarios() {
  return {
    validCredentials: [
      { email: 'eve.holt@reqres.in', password: 'cityslicka' },
      { email: 'peter@klaven', password: 'cityslicka' },
    ],
    invalidCredentials: [
      { email: 'invalid@example.com', password: 'wrongpassword' },
      { email: 'eve.holt@reqres.in', password: 'wrongpassword' },
      { email: '', password: 'password123' },
      { email: 'test@example.com', password: '' },
    ],
    userData: [
      { name: 'John Doe', job: 'Developer' },
      { name: 'Jane Smith', job: 'Designer' },
      { name: 'Bob Johnson', job: 'Manager' },
    ],
    edgeCases: {
      longEmail: 'a'.repeat(1000) + '@example.com',
      longPassword: 'a'.repeat(1000),
      specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      unicodeText: '测试用户 🚀 émojis',
    },
  };
}

// Generate performance test data
function generatePerformanceTestData() {
  return {
    loadTestScenarios: [
      { name: 'Light Load', users: 10, duration: '30s' },
      { name: 'Medium Load', users: 50, duration: '60s' },
      { name: 'Heavy Load', users: 100, duration: '120s' },
    ],
    stressTestScenarios: [
      { name: 'Gradual Ramp', users: 200, duration: '300s' },
      { name: 'Spike Test', users: 500, duration: '60s' },
    ],
    thresholds: {
      responseTime: { p95: 2000, p99: 5000 },
      errorRate: 0.1,
      throughput: 100,
    },
  };
}

// Main function
function main() {
  console.log('Generating test data...');
  
  // Generate users
  const users = generateUsers(100);
  fs.writeFileSync(
    path.join(testDataDir, 'users.json'),
    JSON.stringify(users, null, 2)
  );
  console.log(`Generated ${users.length} users`);
  
  // Generate products
  const products = generateProducts(50);
  fs.writeFileSync(
    path.join(testDataDir, 'products.json'),
    JSON.stringify(products, null, 2)
  );
  console.log(`Generated ${products.length} products`);
  
  // Generate orders
  const orders = generateOrders(200, users, products);
  fs.writeFileSync(
    path.join(testDataDir, 'orders.json'),
    JSON.stringify(orders, null, 2)
  );
  console.log(`Generated ${orders.length} orders`);
  
  // Generate API test scenarios
  const apiScenarios = generateApiTestScenarios();
  fs.writeFileSync(
    path.join(testDataDir, 'api-scenarios.json'),
    JSON.stringify(apiScenarios, null, 2)
  );
  console.log('Generated API test scenarios');
  
  // Generate performance test data
  const performanceData = generatePerformanceTestData();
  fs.writeFileSync(
    path.join(testDataDir, 'performance-data.json'),
    JSON.stringify(performanceData, null, 2)
  );
  console.log('Generated performance test data');
  
  // Generate test configuration
  const testConfig = {
    environments: {
      development: {
        baseUrl: 'http://localhost:3000',
        apiUrl: 'https://reqres.in/api',
        timeout: 30000,
      },
      staging: {
        baseUrl: 'https://staging.example.com',
        apiUrl: 'https://staging-api.example.com',
        timeout: 30000,
      },
      production: {
        baseUrl: 'https://example.com',
        apiUrl: 'https://api.example.com',
        timeout: 30000,
      },
    },
    browsers: ['chromium', 'firefox', 'webkit'],
    viewports: [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1366, height: 768, name: 'laptop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ],
    testSuites: {
      smoke: ['login', 'navigation', 'api-basic'],
      regression: ['all'],
      performance: ['api-load', 'api-stress', 'api-spike'],
    },
  };
  
  fs.writeFileSync(
    path.join(testDataDir, 'test-config.json'),
    JSON.stringify(testConfig, null, 2)
  );
  console.log('Generated test configuration');
  
  console.log('✅ Test data generation completed!');
  console.log(`📁 Data saved to: ${testDataDir}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateUsers,
  generateProducts,
  generateOrders,
  generateApiTestScenarios,
  generatePerformanceTestData,
};
