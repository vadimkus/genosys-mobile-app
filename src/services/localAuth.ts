import { User } from '../types';
import usersData from '../data/users.json';

interface LoginCredentials {
  email: string;
  password: string;
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

export class LocalAuthService {
  private static generateToken(): string {
    return 'local-jwt-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 LOCAL AUTH: Checking credentials for:', credentials.email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = usersData.users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      console.log('✅ LOCAL AUTH: Login successful for:', user.email);
      
      const token = this.generateToken();
      const userData: User = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone,
        role: user.role as 'customer' | 'distributor' | 'admin',
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      return {
        success: true,
        data: {
          user: userData,
          token: token
        },
        message: 'Login successful'
      };
    } else {
      console.log('❌ LOCAL AUTH: Invalid credentials');
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
  }

  static async validateToken(token: string): Promise<boolean> {
    // Simple token validation for local auth
    return token.startsWith('local-jwt-');
  }
}
