import Joi from 'joi';
import { logger } from './logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export class SchemaValidator {
  // User schemas
  static readonly userSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    email: Joi.string().email().required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    address: Joi.object({
      street: Joi.string().min(1).max(100).required(),
      city: Joi.string().min(1).max(50).required(),
      state: Joi.string().min(1).max(50).required(),
      zipCode: Joi.string().min(1).max(20).required(),
      country: Joi.string().min(1).max(50).required(),
    }).optional(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
  });

  static readonly createUserSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    job: Joi.string().min(1).max(100).required(),
  });

  static readonly updateUserSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    job: Joi.string().min(1).max(100).optional(),
  });

  // Authentication schemas
  static readonly loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
  });

  static readonly registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
  });

  // Product schemas
  static readonly productSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(1).max(1000).optional(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().min(1).max(50).required(),
    inStock: Joi.boolean().required(),
    quantity: Joi.number().integer().min(0).optional(),
    imageUrl: Joi.string().uri().optional(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
  });

  // Order schemas
  static readonly orderItemSchema = Joi.object({
    productId: Joi.number().integer().positive().required(),
    productName: Joi.string().min(1).max(200).required(),
    quantity: Joi.number().integer().min(1).max(100).required(),
    price: Joi.number().positive().precision(2).required(),
  });

  static readonly orderSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    userId: Joi.number().integer().positive().required(),
    userEmail: Joi.string().email().required(),
    items: Joi.array().items(this.orderItemSchema).min(1).required(),
    totalAmount: Joi.number().positive().precision(2).required(),
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer').required(),
    shippingAddress: Joi.object({
      street: Joi.string().min(1).max(100).required(),
      city: Joi.string().min(1).max(50).required(),
      state: Joi.string().min(1).max(50).required(),
      zipCode: Joi.string().min(1).max(20).required(),
      country: Joi.string().min(1).max(50).required(),
    }).required(),
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
  });

  // API Response schemas
  static readonly apiResponseSchema = Joi.object({
    success: Joi.boolean().required(),
    message: Joi.string().optional(),
    data: Joi.any().optional(),
    error: Joi.string().optional(),
    timestamp: Joi.date().iso().optional(),
  });

  static readonly paginatedResponseSchema = Joi.object({
    data: Joi.array().required(),
    page: Joi.number().integer().min(1).required(),
    per_page: Joi.number().integer().min(1).required(),
    total: Joi.number().integer().min(0).required(),
    total_pages: Joi.number().integer().min(0).required(),
    support: Joi.object({
      url: Joi.string().uri().required(),
      text: Joi.string().required(),
    }).required(),
  });

  // Validation methods
  static validateUser(data: any): ValidationResult {
    return this.validate(data, this.userSchema, 'User');
  }

  static validateCreateUser(data: any): ValidationResult {
    return this.validate(data, this.createUserSchema, 'CreateUser');
  }

  static validateUpdateUser(data: any): ValidationResult {
    return this.validate(data, this.updateUserSchema, 'UpdateUser');
  }

  static validateLogin(data: any): ValidationResult {
    return this.validate(data, this.loginSchema, 'Login');
  }

  static validateRegister(data: any): ValidationResult {
    return this.validate(data, this.registerSchema, 'Register');
  }

  static validateProduct(data: any): ValidationResult {
    return this.validate(data, this.productSchema, 'Product');
  }

  static validateOrder(data: any): ValidationResult {
    return this.validate(data, this.orderSchema, 'Order');
  }

  static validateApiResponse(data: any): ValidationResult {
    return this.validate(data, this.apiResponseSchema, 'ApiResponse');
  }

  static validatePaginatedResponse(data: any): ValidationResult {
    return this.validate(data, this.paginatedResponseSchema, 'PaginatedResponse');
  }

  // Generic validation method
  static validate(data: any, schema: Joi.ObjectSchema, context: string): ValidationResult {
    try {
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errors = error.details.map(detail => detail.message);
        logger.warn(`Validation failed for ${context}:`, { errors, data });
        return {
          isValid: false,
          errors,
        };
      }

      logger.debug(`Validation successful for ${context}`);
      return {
        isValid: true,
        errors: [],
        data: value,
      };
    } catch (err) {
      const errorMessage = `Validation error for ${context}: ${err}`;
      logger.error(errorMessage, { error: err, data });
      return {
        isValid: false,
        errors: [errorMessage],
      };
    }
  }

  // Batch validation
  static validateBatch(data: any[], schema: Joi.ObjectSchema, context: string): ValidationResult[] {
    return data.map((item, index) => {
      const result = this.validate(item, schema, `${context}[${index}]`);
      return {
        ...result,
        index,
      };
    });
  }

  // Custom validation rules
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Schema generation from data
  static generateSchemaFromData(data: any, name: string): Joi.ObjectSchema {
    const schemaObject: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        if (this.validateEmail(value)) {
          schemaObject[key] = Joi.string().email();
        } else if (this.validateUrl(value)) {
          schemaObject[key] = Joi.string().uri();
        } else {
          schemaObject[key] = Joi.string();
        }
      } else if (typeof value === 'number') {
        schemaObject[key] = Joi.number();
      } else if (typeof value === 'boolean') {
        schemaObject[key] = Joi.boolean();
      } else if (Array.isArray(value)) {
        schemaObject[key] = Joi.array();
      } else if (typeof value === 'object' && value !== null) {
        schemaObject[key] = Joi.object();
      } else {
        schemaObject[key] = Joi.any();
      }
    }
    
    return Joi.object(schemaObject);
  }
}
