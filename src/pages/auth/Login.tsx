import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { LogIn, Mail, Lock } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Login = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form validation
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();
  
  // Handle form submission
  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login data:', data);
      setIsLoading(false);
      // In a real app, this would redirect after successful login
    }, 1500);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        {t('auth.login.title')}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.login.email')}
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
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: t('forms.invalid') as string
                }
              })}
              className="form-input pl-10"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
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
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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