import { supabase } from './supabase';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role: 'customer' | 'distributor' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error?: string;
  message?: string;
}

export class SupabaseAuthService {
  /**
   * Sign in with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 SUPABASE AUTH: Attempting login for:', credentials.email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.log('❌ SUPABASE AUTH: Login error:', error.message);
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: error.message,
        };
      }

      if (!data.user) {
        console.log('❌ SUPABASE AUTH: No user data returned');
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: 'Login failed - no user data',
        };
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.log('⚠️ SUPABASE AUTH: Profile not found, creating default profile');
        
        // Create a default profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
            phone: data.user.user_metadata?.phone || '',
            is_admin: false,
            can_see_prices: false,
          })
          .select()
          .single();

        if (createError) {
          console.log('❌ SUPABASE AUTH: Failed to create profile:', createError.message);
          return {
            success: false,
            data: { user: {} as User, token: '' },
            error: 'Failed to create user profile',
          };
        }

        console.log('✅ SUPABASE AUTH: Created new profile for user');
        const userData: User = this.mapSupabaseUserToAppUser(newProfile, data.session?.access_token || '');
        
        return {
          success: true,
          data: {
            user: userData,
            token: data.session?.access_token || '',
          },
          message: 'Login successful',
        };
      }

      console.log('✅ SUPABASE AUTH: Login successful for:', profile.email);

      const userData: User = this.mapSupabaseUserToAppUser(profile, data.session?.access_token || '');

      return {
        success: true,
        data: {
          user: userData,
          token: data.session?.access_token || '',
        },
        message: 'Login successful',
      };
    } catch (error) {
      console.error('❌ SUPABASE AUTH: Unexpected error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        error: 'An unexpected error occurred during login',
      };
    }
  }

  /**
   * Sign up with email and password
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('🔐 SUPABASE AUTH: Attempting registration for:', userData.email);

    try {
      // First, sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone || '',
            company: userData.company || '',
            role: userData.role,
            can_see_prices: userData.role === 'distributor' || userData.role === 'admin',
          },
        },
      });

      if (error) {
        console.log('❌ SUPABASE AUTH: Registration error:', error.message);
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: error.message,
        };
      }

      if (!data.user) {
        console.log('❌ SUPABASE AUTH: No user data returned from registration');
        return {
          success: false,
          data: { user: {} as User, token: '' },
          error: 'Registration failed - no user data',
        };
      }

      console.log('✅ SUPABASE AUTH: User created in auth.users, waiting for trigger...');

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to get the user profile (created by trigger)
      let profile = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (!profile && attempts < maxAttempts) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.log(`⚠️ SUPABASE AUTH: Profile not ready yet (attempt ${attempts + 1}/${maxAttempts}):`, profileError.message);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          profile = profileData;
          console.log('✅ SUPABASE AUTH: Profile found after trigger');
        }
      }

      if (!profile) {
        console.log('❌ SUPABASE AUTH: Profile not created by trigger, continuing without public.users profile...');
        
        // Even if profile creation fails, we can still return success since user is created in auth.users
        // The app can work without the public.users profile for now
        console.log('⚠️ SUPABASE AUTH: User created in auth.users, skipping public.users profile...');
        
        // Create a minimal user object from auth data
        const minimalUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone || '',
          role: userData.role as 'customer' | 'distributor' | 'admin',
          isActive: true,
          emailVerified: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
        };

        return {
          success: true,
          data: {
            user: minimalUser,
            token: data.session?.access_token || '',
          },
          message: 'Registration successful',
        };
      }

      console.log('✅ SUPABASE AUTH: Registration successful for:', profile.email);

      const userDataResponse: User = this.mapSupabaseUserToAppUser(profile, data.session?.access_token || '');

      return {
        success: true,
        data: {
          user: userDataResponse,
          token: data.session?.access_token || '',
        },
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('❌ SUPABASE AUTH: Unexpected error:', error);
      return {
        success: false,
        data: { user: {} as User, token: '' },
        error: 'An unexpected error occurred during registration',
      };
    }
  }

  /**
   * Sign out
   */
  static async logout(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ SUPABASE AUTH: Logout error:', error.message);
        return false;
      }
      console.log('✅ SUPABASE AUTH: Logout successful');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE AUTH: Unexpected logout error:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('⚠️ SUPABASE AUTH: No current user');
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log('⚠️ SUPABASE AUTH: No profile found for user');
        return null;
      }

      return this.mapSupabaseUserToAppUser(profile, '');
    } catch (error) {
      console.error('❌ SUPABASE AUTH: Error getting current user:', error);
      return null;
    }
  }

  /**
   * Map Supabase user to app User type
   */
  private static mapSupabaseUserToAppUser(supabaseUser: any, token: string): User {
    const nameParts = supabaseUser.name?.split(' ') || ['', ''];
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      name: supabaseUser.name || '',
      phone: supabaseUser.phone || '',
      role: supabaseUser.is_admin ? 'admin' : (supabaseUser.can_see_prices ? 'distributor' : 'customer'),
      isActive: true,
      emailVerified: true,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      updatedAt: supabaseUser.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Validate token
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      return !error && !!data.user;
    } catch (error) {
      console.error('❌ SUPABASE AUTH: Token validation error:', error);
      return false;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updateData.name || `${updateData.firstName} ${updateData.lastName}`,
          phone: updateData.phone,
          is_admin: updateData.role === 'admin',
          can_see_prices: updateData.role === 'distributor' || updateData.role === 'admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ SUPABASE AUTH: Update error:', error.message);
        return null;
      }

      return this.mapSupabaseUserToAppUser(data, '');
    } catch (error) {
      console.error('❌ SUPABASE AUTH: Unexpected update error:', error);
      return null;
    }
  }
}
