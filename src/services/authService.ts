import api, { API_ENDPOINTS, ApiResponse, User } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  university?: string;
  role: 'student' | 'owner';
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

// Validation utility class
class ValidationUtils {
  static validateEmail(email: string, role?: 'student' | 'owner'): ValidationError | null {
    if (!email || email.trim() === '') {
      return { field: 'email', message: 'Email is required' };
    }

    if (role === 'student') {
      // Student email must end with -edu.ma
      const studentEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+-edu\.ma$/;
      if (!studentEmailPattern.test(email)) {
        return { field: 'email', message: 'Student email must be in format: example@university-edu.ma' };
      }
    } else if (role === 'owner') {
      // Owner email - standard email validation
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        return { field: 'email', message: 'Please enter a valid email address' };
      }
    } else {
      // General email validation for login
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        return { field: 'email', message: 'Please enter a valid email address' };
      }
    }

    return null;
  }

  static validatePassword(password: string, isRegistration: boolean = false): ValidationError | null {
    if (!password || password.trim() === '') {
      return { field: 'password', message: 'Password is required' };
    }

    if (isRegistration) {
      // Stricter validation for registration
      if (password.length < 8) {
        return { field: 'password', message: 'Password must be at least 8 characters long' };
      }

      if (!/[A-Z]/.test(password)) {
        return { field: 'password', message: 'Password must contain at least one uppercase letter' };
      }

      if (!/[a-z]/.test(password)) {
        return { field: 'password', message: 'Password must contain at least one lowercase letter' };
      }

      if (!/\d/.test(password)) {
        return { field: 'password', message: 'Password must contain at least one number' };
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { field: 'password', message: 'Password must contain at least one special character' };
      }
    } else {
      // Basic validation for login
      if (password.length < 6) {
        return { field: 'password', message: 'Password must be at least 6 characters long' };
      }
    }

    return null;
  }

  static validateName(name: string): ValidationError | null {
    if (!name || name.trim() === '') {
      return { field: 'name', message: 'Name is required' };
    }

    if (name.trim().length < 2) {
      return { field: 'name', message: 'Name must be at least 2 characters long' };
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return { field: 'name', message: 'Name can only contain letters and spaces' };
    }

    return null;
  }

  static validatePhone(phone: string): ValidationError | null {
    if (!phone || phone.trim() === '') {
      return { field: 'phone', message: 'Phone number is required' };
    }

    // Moroccan phone number validation
    const phonePattern = /^(\+212|0)[5-7][0-9]{8}$/;
    if (!phonePattern.test(phone.replace(/\s/g, ''))) {
      return { field: 'phone', message: 'Please enter a valid Moroccan phone number (e.g., +212612345678 or 0612345678)' };
    }

    return null;
  }

  static validateUniversity(university: string | undefined, role: string): ValidationError | null {
    if (role === 'student') {
      if (!university || university.trim() === '') {
        return { field: 'university', message: 'University is required for students' };
      }
    }

    return null;
  }

  static validateUsername(username: string): ValidationError | null {
    if (!username || username.trim() === '') {
      return { field: 'username', message: 'Username is required' };
    }

    if (username.trim().length < 3) {
      return { field: 'username', message: 'Username must be at least 3 characters long' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return { field: 'username', message: 'Username can only contain letters, numbers, and underscores' };
    }

    return null;
  }
}

class AuthService {
  // Validate login credentials
  private validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate email
    const emailError = ValidationUtils.validateEmail(credentials.email);
    if (emailError) errors.push(emailError);

    // Validate password (basic validation for login)
    const passwordError = ValidationUtils.validatePassword(credentials.password, false);
    if (passwordError) errors.push(passwordError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate registration data
  private validateRegistrationData(userData: RegisterData): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate name
    const nameError = ValidationUtils.validateName(userData.name);
    if (nameError) errors.push(nameError);

    // Validate email with role-specific rules
    const emailError = ValidationUtils.validateEmail(userData.email, userData.role);
    if (emailError) errors.push(emailError);

    // Validate password (strict validation for registration)
    const passwordError = ValidationUtils.validatePassword(userData.password, true);
    if (passwordError) errors.push(passwordError);

    // Validate phone
    const phoneError = ValidationUtils.validatePhone(userData.phone);
    if (phoneError) errors.push(phoneError);

    // Validate university (required for students)
    const universityError = ValidationUtils.validateUniversity(userData.university, userData.role);
    if (universityError) errors.push(universityError);

    // Validate role
    if (!userData.role || !['student', 'owner'].includes(userData.role)) {
      errors.push({ field: 'role', message: 'Role must be either student or owner' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate admin login credentials
  private validateAdminLoginCredentials(credentials: AdminLoginCredentials): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate username
    const usernameError = ValidationUtils.validateUsername(credentials.username);
    if (usernameError) errors.push(usernameError);

    // Validate password (basic validation for login)
    const passwordError = ValidationUtils.validatePassword(credentials.password, false);
    if (passwordError) errors.push(passwordError);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    // Validate input data before sending to backend
    const validation = this.validateLoginCredentials(credentials);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.map(error => error.message).join(', '),
        data: null as any
      };
    }

    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    // Validate input data before sending to backend
    const validation = this.validateRegistrationData(userData);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.map(error => error.message).join(', '),
        data: null as any
      };
    }

    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  }

  async adminLogin(credentials: AdminLoginCredentials): Promise<ApiResponse<User>> {
    // Validate input data before sending to backend
    const validation = this.validateAdminLoginCredentials(credentials);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.map(error => error.message).join(', '),
        data: null as any
      };
    }

    const response = await api.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, credentials);
    return response.data;
  }

  // Public validation methods for use in components
  validateLoginData(credentials: LoginCredentials): ValidationResult {
    return this.validateLoginCredentials(credentials);
  }

  validateRegisterData(userData: RegisterData): ValidationResult {
    return this.validateRegistrationData(userData);
  }

  validateAdminLoginData(credentials: AdminLoginCredentials): ValidationResult {
    return this.validateAdminLoginCredentials(credentials);
  }

  // Local storage helpers
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    // Store the actual token from the user object
    if ((user as any).token) {
      localStorage.setItem('token', (user as any).token);
      console.log('Token stored:', (user as any).token);
    } else {
      console.warn('No token found in user data:', user);
    }
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  isStudent(): boolean {
    const user = this.getUser();
    return user?.role === 'student';
  }

  isOwner(): boolean {
    const user = this.getUser();
    return user?.role === 'owner';
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}

export const authService = new AuthService();
export default authService;
