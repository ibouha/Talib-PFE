import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { moroccanUniversities } from '../../data/mockData';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'owner';
  university?: string;
  termsAccepted: boolean;
};

const Register = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
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
  const onSubmit = (data: RegisterFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Register data:', data);
      setIsLoading(false);
      // In a real app, this would redirect after successful registration
    }, 1500);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        {t('auth.register.title')}
      </h2>
      
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
                required: t('forms.required') as string
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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