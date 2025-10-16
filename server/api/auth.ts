import { PrismaAuthService } from '../services/prismaAuth';
import { User } from '../../src/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: 'customer' | 'distributor';
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
  message?: string;
}

// Simple in-memory API for demonstration
// In production, this would be a proper Express.js server
export class AuthAPI {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 SERVER API: Login request for:', credentials.email);
    
    try {
      const result = await PrismaAuthService.login(credentials);
      return result;
    } catch (error: any) {
      console.error('❌ SERVER API: Login error:', error);
      return {
        success: false,
        error: 'Server authentication failed',
      };
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('🔐 SERVER API: Register request for:', userData.email);
    
    try {
      const result = await PrismaAuthService.register(userData);
      return result;
    } catch (error: any) {
      console.error('❌ SERVER API: Register error:', error);
      return {
        success: false,
        error: 'Server registration failed',
      };
    }
  }
}

// Export for use in server-side scripts
export default AuthAPI;
