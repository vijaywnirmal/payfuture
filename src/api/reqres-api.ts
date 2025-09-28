import { ApiClient, ApiResponse } from './api-client';
import { testConfig } from '@config/test.config';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface CreateUserRequest {
  name: string;
  job: string;
}

export interface CreateUserResponse {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  job?: string;
}

export interface UpdateUserResponse {
  name: string;
  job: string;
  updatedAt: string;
}

export interface UsersListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
  support: {
    url: string;
    text: string;
  };
}

export interface SingleUserResponse {
  data: User;
  support: {
    url: string;
    text: string;
  };
}

export class ReqResApiClient extends ApiClient {
  constructor() {
    super('https://reqres.in/api');
  }

  // User endpoints
  async getUsers(page: number = 1, perPage: number = 6): Promise<ApiResponse<UsersListResponse>> {
    return this.get<UsersListResponse>(`/users?page=${page}&per_page=${perPage}`);
  }

  async getUserById(id: number): Promise<ApiResponse<SingleUserResponse>> {
    return this.get<SingleUserResponse>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
    return this.post<CreateUserResponse>('/users', userData);
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<ApiResponse<UpdateUserResponse>> {
    return this.put<UpdateUserResponse>(`/users/${id}`, userData);
  }

  async patchUser(id: number, userData: UpdateUserRequest): Promise<ApiResponse<UpdateUserResponse>> {
    return this.patch<UpdateUserResponse>(`/users/${id}`, userData);
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/users/${id}`);
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    return this.post<{ token: string }>('/login', { email, password });
  }

  async register(email: string, password: string): Promise<ApiResponse<{ id: number; token: string }>> {
    return this.post<{ id: number; token: string }>('/register', { email, password });
  }

  // Resource endpoints
  async getResources(): Promise<ApiResponse<{ data: any[]; support: any }>> {
    return this.get<{ data: any[]; support: any }>('/unknown');
  }

  async getResourceById(id: number): Promise<ApiResponse<{ data: any; support: any }>> {
    return this.get<{ data: any; support: any }>(`/unknown/${id}`);
  }

  // Utility methods for testing
  async getRandomUser(): Promise<User> {
    const response = await this.getUsers(1, 12); // Get all users from first page
    const users = response.data.data;
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
  }

  async getUserWithRetry(id: number, maxAttempts: number = 3): Promise<User> {
    return this.withRetry(async () => {
      const response = await this.getUserById(id);
      return response.data.data;
    }, maxAttempts);
  }

  async createUserWithRetry(userData: CreateUserRequest, maxAttempts: number = 3): Promise<CreateUserResponse> {
    return this.withRetry(async () => {
      const response = await this.createUser(userData);
      return response.data;
    }, maxAttempts);
  }

  // Data validation helpers
  validateUser(user: User): boolean {
    return !!(
      user.id &&
      user.email &&
      user.first_name &&
      user.last_name &&
      user.avatar &&
      typeof user.id === 'number' &&
      typeof user.email === 'string' &&
      typeof user.first_name === 'string' &&
      typeof user.last_name === 'string' &&
      typeof user.avatar === 'string'
    );
  }

  validateCreateUserResponse(response: CreateUserResponse): boolean {
    return !!(
      response.name &&
      response.job &&
      response.id &&
      response.createdAt &&
      typeof response.name === 'string' &&
      typeof response.job === 'string' &&
      typeof response.id === 'string' &&
      typeof response.createdAt === 'string'
    );
  }

  validateUpdateUserResponse(response: UpdateUserResponse): boolean {
    return !!(
      response.name &&
      response.job &&
      response.updatedAt &&
      typeof response.name === 'string' &&
      typeof response.job === 'string' &&
      typeof response.updatedAt === 'string'
    );
  }
}
