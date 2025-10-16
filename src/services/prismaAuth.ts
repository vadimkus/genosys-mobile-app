import { User, UserRole } from '../types';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error?: string;
  message?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: 'customer' | 'distributor';
}

export class PrismaAuthService {
  private static generateToken(): string {
    return (
      'prisma-jwt-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
    );
  }

  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 PRISMA AUTH: Checking credentials for:', credentials.email);

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        console.log('❌ PRISMA AUTH: User not found');
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: 'Invalid email or password',
        };
      }

      // Check if user is active
      if (!user.isActive) {
        console.log('❌ PRISMA AUTH: User account is inactive');
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: 'Account is inactive. Please contact support.',
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        console.log('❌ PRISMA AUTH: Invalid password');
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: 'Invalid email or password',
        };
      }

      console.log('✅ PRISMA AUTH: Login successful for:', user.email);

      const token = this.generateToken();
      const userData: User = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone || '',
        role: user.role.toLowerCase() as 'customer' | 'distributor' | 'admin',
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      return {
        success: true,
        data: {
          user: userData,
          token: token,
        },
        message: 'Login successful',
      };
    } catch (error: any) {
      console.error('❌ PRISMA AUTH: Database error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        error: 'Authentication service temporarily unavailable',
      };
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('🔐 PRISMA AUTH: Registering new user:', userData.email);

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log('❌ PRISMA AUTH: User already exists');
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
          company: userData.company,
          role: userData.role?.toUpperCase() as UserRole || 'CUSTOMER',
          isActive: true,
          emailVerified: false,
        },
      });

      console.log('✅ PRISMA AUTH: Registration successful for:', newUser.email);

      const token = this.generateToken();
      const userDataResponse: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        name: newUser.name,
        phone: newUser.phone || '',
        role: newUser.role.toLowerCase() as 'customer' | 'distributor' | 'admin',
        isActive: newUser.isActive,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      };

      return {
        success: true,
        data: {
          user: userDataResponse,
          token: token,
        },
        message: 'Registration successful',
      };
    } catch (error: any) {
      console.error('❌ PRISMA AUTH: Registration error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        error: 'Registration failed. Please try again.',
      };
    }
  }

  static async validateToken(token: string): Promise<boolean> {
    // Simple token validation for now
    // In production, you'd want to implement proper JWT validation
    return token.startsWith('prisma-jwt-');
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone || '',
        role: user.role.toLowerCase() as 'customer' | 'distributor' | 'admin',
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('❌ PRISMA AUTH: Error fetching user:', error);
      return null;
    }
  }

  static async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          name: updateData.name,
          phone: updateData.phone,
          company: updateData.company,
          role: updateData.role?.toUpperCase() as UserRole,
          updatedAt: new Date(),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        phone: updatedUser.phone || '',
        role: updatedUser.role.toLowerCase() as 'customer' | 'distributor' | 'admin',
        isActive: updatedUser.isActive,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('❌ PRISMA AUTH: Error updating user:', error);
      return null;
    }
  }
}
