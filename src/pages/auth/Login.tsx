import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, adminLogin } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      // Check if this looks like admin credentials (no @ symbol = username)
      const isAdminLogin = !data.email.includes('@');

      if (isAdminLogin) {
        // Use admin login
        result = await adminLogin({
          username: data.email, // Using email field as username for admin
          password: data.password
        });
      } else {
        // Use regular login
        result = await login({
          email: data.email,
          password: data.password
        });
      }

      if (result.success && result.user) {
        showToast('Login successful!', 'success');
        // Navigate based on user role
        if (result.user.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (result.user.role === 'owner') {
          navigate('/dashboard/owner');
        } else if (result.user.role === 'student') {
          navigate('/dashboard/student');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {/* Home Link */}
      <p className="mb-6 text-center text-xl">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors">
          <span className="mr-1">&#8592;</span> {t('common.backToHome', 'Back to Home')}
        </Link>
      </p>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        {t('auth.login.title')}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Email/Username Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email or Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="text"
              {...register('email', {
                required: 'Email or username is required',
                validate: (value) => {
                  // If it contains @, validate as email
                  if (value.includes('@')) {
                    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailPattern.test(value)) {
                      return 'Please enter a valid email address';
                    }
                  } else {
                    // Validate as username (for admin)
                    if (value.length < 3) {
                      return 'Username must be at least 3 characters long';
                    }
                    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                      return 'Username can only contain letters, numbers, and underscores';
                    }
                  }
                  return true;
                }
              })}
              className="form-input pl-10"
              placeholder="you@example.com or admin"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your email address or admin username
          </p>
        </div>
        
        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.login.password')}
            </label>
            <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
              {t('auth.login.forgotPassword')}
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: t('forms.required') as string,
                validate: (value) => {
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters long';
                  }
                  if (value.trim() !== value) {
                    return 'Password cannot start or end with spaces';
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
        </div>
        
        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        
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
                <LogIn size={20} className="mr-2" />
                {t('auth.login.submit')}
              </span>
            )}
          </button>
        </div>
      </form>
      
      {/* Register Link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          {t('auth.login.register')}
        </Link>
      </p>
      
    </div>
  );
};

export default Login;