import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, Phone, Lock, User, GraduationCap } from 'lucide-react';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

// Moroccan universities list
const moroccanUniversities = [
  'Mohammed V University in Rabat',
  'Hassan II University of Casablanca',
  'Cadi Ayyad University',
  'Ibn Tofail University',
  'Abdelmalek Essaâdi University',
  'Mohammed First University',
  'Ibn Zohr University',
  'Moulay Ismail University',
  'International University of Rabat',
  'Al Akhawayn University'
];

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'owner';
  university?: string;
  termsAccepted: boolean;
};

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form validation
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'student'
    }
  });
  
  // Watch the role field to conditionally show university field
  const selectedRole = watch('role');
  
  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare registration data
      const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        ...(data.role === 'student' && { university: data.university })
      };

      console.log('Registering with data:', registrationData);

      // Call the registration API
      const response = await authService.register(registrationData);

      if (response.success) {
        // Registration successful
        showToast('Registration successful! Please login with your credentials.', 'success');
        navigate('/login');
      } else {
        // Registration failed
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {/* Home Link */}
      <p className="mb-6 text-center text-sm">
        <Link to="/" className="text-xl inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors">
          <span className="mr-1">&#8592;</span> {t('common.backToHome', 'Back to Home')}
        </Link>
      </p>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        {t('auth.register.title')}
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.name')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              id="name"
              type="text"
              {...register('name', {
                required: t('forms.required') as string,
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters long'
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'Name can only contain letters and spaces'
                }
              })}
              className="form-input pl-10"
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>
        
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.email')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: t('forms.required') as string,
                validate: (value) => {
                  const role = watch('role');

                  if (role === 'student') {
                    // Student email must end with -edu.ma
                    const studentEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+-edu\.ma$/;
                    if (!studentEmailPattern.test(value)) {
                      return 'Student email must be in format: example@university-edu.ma';
                    }
                  } else if (role === 'owner') {
                    // Owner email - simple email validation
                    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailPattern.test(value)) {
                      return 'Please enter a valid email address';
                    }
                  }

                  return true;
                }
              })}
              className="form-input pl-10"
              placeholder={selectedRole === 'student' ? 'student@university-edu.ma' : 'you@example.com'}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
          {/* Email format helper text */}
          <div className="mt-1">
            {selectedRole === 'student' ? (
              <p className="text-xs text-gray-500">
                Student email must end with -edu.ma (e.g., student@university-edu.ma)
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Enter a valid email address
              </p>
            )}
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Phone size={18} />
            </div>
            <input
              id="phone"
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(\+212|0)[5-7][0-9]{8}$/,
                  message: 'Please enter a valid Moroccan phone number (e.g., +212612345678 or 0612345678)'
                }
              })}
              className="form-input pl-10"
              placeholder="+212 6 12 34 56 78"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.password')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: t('forms.required') as string,
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                validate: (value) => {
                  // Check for at least one uppercase letter
                  if (!/[A-Z]/.test(value)) {
                    return 'Password must contain at least one uppercase letter';
                  }
                  // Check for at least one lowercase letter
                  if (!/[a-z]/.test(value)) {
                    return 'Password must contain at least one lowercase letter';
                  }
                  // Check for at least one number
                  if (!/\d/.test(value)) {
                    return 'Password must contain at least one number';
                  }
                  // Check for at least one special character
                  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                    return 'Password must contain at least one special character';
                  }
                  return true;
                }
              })}
              className="form-input pl-10"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
          {/* Password requirements helper text */}
          <div className="mt-1">
            <p className="text-xs text-gray-500">
              Password must contain: 8+ characters, uppercase, lowercase, number, and special character
            </p>
          </div>
        </div>
        
        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.register.confirmPassword')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { 
                required: t('forms.required') as string,
                validate: (value) => value === watch('password') || 'Passwords do not match'
              })}
              className="form-input pl-10"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.register.role')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === 'student' 
                ? 'bg-primary-50 border-primary-500 text-primary-700' 
                : 'border-gray-200 hover:border-primary-200'
            }`}>
              <input
                type="radio"
                value="student"
                {...register('role')}
                className="sr-only"
              />
              <span className="flex flex-col items-center">
                <GraduationCap size={24} className={selectedRole === 'student' ? 'text-primary-500' : 'text-gray-400'} />
                <span className="mt-2">{t('auth.register.student')}</span>
              </span>
            </label>
            
            <label className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === 'owner' 
                ? 'bg-primary-50 border-primary-500 text-primary-700' 
                : 'border-gray-200 hover:border-primary-200'
            }`}>
              <input
                type="radio"
                value="owner"
                {...register('role')}
                className="sr-only"
              />
              <span className="flex flex-col items-center">
                <User size={24} className={selectedRole === 'owner' ? 'text-primary-500' : 'text-gray-400'} />
                <span className="mt-2">{t('auth.register.owner')}</span>
              </span>
            </label>
          </div>
        </div>
        
        {/* University Field - Only for Students */}
        {selectedRole === 'student' && (
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.register.university')}
            </label>
            <select
              id="university"
              {...register('university', { 
                required: selectedRole === 'student' ? t('forms.required') as string : false
              })}
              className="form-input"
            >
              <option value="">Select University</option>
              {moroccanUniversities.map((university, index) => (
                <option key={index} value={university}>
                  {university}
                </option>
              ))}
            </select>
            {errors.university && (
              <p className="mt-1 text-sm text-error-600">{errors.university.message}</p>
            )}
          </div>
        )}
        
        {/* Terms Acceptance */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            {...register('termsAccepted', { 
              required: 'You must accept the terms and conditions' 
            })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="mt-1 text-sm text-error-600">{errors.termsAccepted.message}</p>
        )}
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center py-3"
          >
            {isLoading ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                {t('common.loading')}
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus size={20} className="mr-2" />
                {t('auth.register.submit')}
              </span>
            )}
          </button>
        </div>
      </form>
      
      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          {t('auth.register.login')}
        </Link>
      </p>
      
    </div>
  );
};

export default Register;