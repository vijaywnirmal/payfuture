import { faker } from '@faker-js/faker';

export interface UserData {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  phone?: string;
  address?: AddressData;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  quantity?: number;
}

export class TestDataGenerator {
  static generateUser(overrides: Partial<UserData> = {}): UserData {
    return {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      password: faker.internet.password(12),
      phone: faker.phone.phoneNumber(),
      address: this.generateAddress(),
      ...overrides,
    };
  }

  static generateAddress(overrides: Partial<AddressData> = {}): AddressData {
    return {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode(),
      country: faker.address.country(),
      ...overrides,
    };
  }

  static generateProduct(overrides: Partial<ProductData> = {}): ProductData {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      inStock: faker.datatype.boolean(),
      quantity: faker.datatype.number({ min: 0, max: 100 }),
      ...overrides,
    };
  }

  static generateUsers(count: number): UserData[] {
    return Array.from({ length: count }, () => this.generateUser());
  }

  static generateProducts(count: number): ProductData[] {
    return Array.from({ length: count }, () => this.generateProduct());
  }

  static generateRandomString(length: number = 10): string {
    return faker.random.alphaNumeric(length);
  }

  static generateRandomNumber(min: number = 1, max: number = 1000): number {
    return faker.datatype.number({ min, max });
  }

  static generateEmail(domain?: string): string {
    return faker.internet.email(undefined, undefined, domain);
  }

  static generateUrl(): string {
    return faker.internet.url();
  }

  static generateDateString(): string {
    return faker.date.recent().toISOString();
  }

  static generateUuid(): string {
    return faker.datatype.uuid();
  }
}
