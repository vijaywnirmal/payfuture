import express from 'express';
import { Request, Response } from 'express';
import { logger } from './logger';
import { SchemaValidator } from './schema-validator';
import { TestDataGenerator } from './test-data';

export interface MockServerConfig {
  port: number;
  basePath: string;
  enableCors: boolean;
  enableLogging: boolean;
}

export class MockServer {
  private app: express.Application;
  private config: MockServerConfig;
  private isRunning: boolean = false;

  constructor(config: Partial<MockServerConfig> = {}) {
    this.config = {
      port: config.port || 3001,
      basePath: config.basePath || '/api',
      enableCors: config.enableCors !== false,
      enableLogging: config.enableLogging !== false,
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS
    if (this.config.enableCors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    if (this.config.enableLogging) {
      this.app.use((req, res, next) => {
        logger.info(`${req.method} ${req.path}`, {
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      });
    }
  }

  private setupRoutes(): void {
    const basePath = this.config.basePath;

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Authentication routes
    this.app.post(`${basePath}/auth/login`, this.handleLogin.bind(this));
    this.app.post(`${basePath}/auth/register`, this.handleRegister.bind(this));
    this.app.post(`${basePath}/auth/logout`, this.handleLogout.bind(this));

    // User routes
    this.app.get(`${basePath}/users`, this.handleGetUsers.bind(this));
    this.app.get(`${basePath}/users/:id`, this.handleGetUser.bind(this));
    this.app.post(`${basePath}/users`, this.handleCreateUser.bind(this));
    this.app.put(`${basePath}/users/:id`, this.handleUpdateUser.bind(this));
    this.app.patch(`${basePath}/users/:id`, this.handlePatchUser.bind(this));
    this.app.delete(`${basePath}/users/:id`, this.handleDeleteUser.bind(this));

    // Product routes
    this.app.get(`${basePath}/products`, this.handleGetProducts.bind(this));
    this.app.get(`${basePath}/products/:id`, this.handleGetProduct.bind(this));
    this.app.post(`${basePath}/products`, this.handleCreateProduct.bind(this));
    this.app.put(`${basePath}/products/:id`, this.handleUpdateProduct.bind(this));
    this.app.delete(`${basePath}/products/:id`, this.handleDeleteProduct.bind(this));

    // Order routes
    this.app.get(`${basePath}/orders`, this.handleGetOrders.bind(this));
    this.app.get(`${basePath}/orders/:id`, this.handleGetOrder.bind(this));
    this.app.post(`${basePath}/orders`, this.handleCreateOrder.bind(this));
    this.app.put(`${basePath}/orders/:id`, this.handleUpdateOrder.bind(this));
    this.app.delete(`${basePath}/orders/:id`, this.handleDeleteOrder.bind(this));

    // Error handling
    this.app.use(this.handleError.bind(this));
  }

  // Authentication handlers
  private handleLogin(req: Request, res: Response): void {
    const validation = SchemaValidator.validateLogin(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid login data',
        errors: validation.errors,
      });
      return;
    }

    const { email, password } = req.body;

    // Mock authentication logic
    if (email === 'eve.holt@reqres.in' && password === 'cityslicka') {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            email,
            firstName: 'Eve',
            lastName: 'Holt',
          },
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  }

  private handleRegister(req: Request, res: Response): void {
    const validation = SchemaValidator.validateRegister(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid registration data',
        errors: validation.errors,
      });
      return;
    }

    const { email, password } = req.body;

    // Mock registration logic
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: Math.floor(Math.random() * 1000) + 1,
        email,
        token: 'mock-jwt-token-' + Date.now(),
      },
    });
  }

  private handleLogout(req: Request, res: Response): void {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  // User handlers
  private handleGetUsers(req: Request, res: Response): void {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 6;
    const total = 12; // Mock total
    const totalPages = Math.ceil(total / perPage);

    const users = TestDataGenerator.generateUsers(perPage).map((user, index) => ({
      ...user,
      id: (page - 1) * perPage + index + 1,
    }));

    res.json({
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      data: users,
      support: {
        url: 'https://reqres.in/#support-heading',
        text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
      },
    });
  }

  private handleGetUser(req: Request, res: Response): void {
    const id = parseInt(req.params.id);
    
    if (id < 1 || id > 12) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = TestDataGenerator.generateUser();
    user.id = id;

    res.json({
      data: user,
      support: {
        url: 'https://reqres.in/#support-heading',
        text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
      },
    });
  }

  private handleCreateUser(req: Request, res: Response): void {
    const validation = SchemaValidator.validateCreateUser(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
        errors: validation.errors,
      });
      return;
    }

    const { name, job } = req.body;

    res.status(201).json({
      name,
      job,
      id: Math.floor(Math.random() * 1000) + 1,
      createdAt: new Date().toISOString(),
    });
  }

  private handleUpdateUser(req: Request, res: Response): void {
    const validation = SchemaValidator.validateUpdateUser(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
        errors: validation.errors,
      });
      return;
    }

    const { name, job } = req.body;

    res.json({
      name: name || 'Updated Name',
      job: job || 'Updated Job',
      updatedAt: new Date().toISOString(),
    });
  }

  private handlePatchUser(req: Request, res: Response): void {
    this.handleUpdateUser(req, res);
  }

  private handleDeleteUser(req: Request, res: Response): void {
    res.status(204).send();
  }

  // Product handlers
  private handleGetProducts(req: Request, res: Response): void {
    const products = TestDataGenerator.generateProducts(6);
    res.json({
      data: products,
      support: {
        url: 'https://reqres.in/#support-heading',
        text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
      },
    });
  }

  private handleGetProduct(req: Request, res: Response): void {
    const id = parseInt(req.params.id);
    const product = TestDataGenerator.generateProduct();
    product.id = id;

    res.json({
      data: product,
      support: {
        url: 'https://reqres.in/#support-heading',
        text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
      },
    });
  }

  private handleCreateProduct(req: Request, res: Response): void {
    const validation = SchemaValidator.validateProduct(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid product data',
        errors: validation.errors,
      });
      return;
    }

    const product = { ...req.body, id: Math.floor(Math.random() * 1000) + 1 };
    res.status(201).json(product);
  }

  private handleUpdateProduct(req: Request, res: Response): void {
    const validation = SchemaValidator.validateProduct(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid product data',
        errors: validation.errors,
      });
      return;
    }

    const product = { ...req.body, id: parseInt(req.params.id) };
    res.json(product);
  }

  private handleDeleteProduct(req: Request, res: Response): void {
    res.status(204).send();
  }

  // Order handlers
  private handleGetOrders(req: Request, res: Response): void {
    const orders = TestDataGenerator.generateProducts(5).map((product, index) => ({
      id: index + 1,
      userId: 1,
      productId: product.id,
      quantity: Math.floor(Math.random() * 5) + 1,
      totalAmount: product.price * (Math.floor(Math.random() * 5) + 1),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }));

    res.json({
      data: orders,
      support: {
        url: 'https://reqres.in/#support-heading',
        text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
      },
    });
  }

  private handleGetOrder(req: Request, res: Response): void {
    const id = parseInt(req.params.id);
    const order = {
      id,
      userId: 1,
      productId: 1,
      quantity: 2,
      totalAmount: 29.99,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    res.json({
      data: order,
      support: {
        url: 'https://reqres.in/#support-heading',
        text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
      },
    });
  }

  private handleCreateOrder(req: Request, res: Response): void {
    const order = {
      ...req.body,
      id: Math.floor(Math.random() * 1000) + 1,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json(order);
  }

  private handleUpdateOrder(req: Request, res: Response): void {
    const order = {
      ...req.body,
      id: parseInt(req.params.id),
      updatedAt: new Date().toISOString(),
    };

    res.json(order);
  }

  private handleDeleteOrder(req: Request, res: Response): void {
    res.status(204).send();
  }

  // Error handling
  private handleError(err: any, req: Request, res: Response, next: any): void {
    logger.error('Mock server error:', err);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  }

  // Server control methods
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Mock server is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.app.listen(this.config.port, (err?: any) => {
        if (err) {
          logger.error('Failed to start mock server:', err);
          reject(err);
        } else {
          this.isRunning = true;
          logger.info(`Mock server started on port ${this.config.port}`);
          logger.info(`Health check: http://localhost:${this.config.port}/health`);
          logger.info(`API base path: http://localhost:${this.config.port}${this.config.basePath}`);
          resolve();
        }
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Mock server is not running');
      return;
    }

    // Note: In a real implementation, you'd need to store the server instance
    // and call server.close() here
    this.isRunning = false;
    logger.info('Mock server stopped');
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }

  getConfig(): MockServerConfig {
    return { ...this.config };
  }
}
