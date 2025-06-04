import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { setupScrollAnimations } from '../utils/animation';

const AuthLayout = () => {
  const { t } = useTranslation();
  
  // Set up animations
  useEffect(() => {
    setupScrollAnimations();
  }, []);
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Info */}
      <div className="hidden md:flex flex-col w-2/5 bg-primary-500 text-white p-10 justify-between">
        <div>
          <Link to="/" className="text-2xl font-bold">{t('app.name')}</Link>
          <h1 className="text-3xl font-bold mt-20">{t('app.tagline')}</h1>
          <p className="mt-4 text-white/80">
            Connect with other students, find housing, exchange items, and more.
          </p>
        </div>
        
        {/* Testimonial */}
        <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
          <p className="italic text-white/90 mb-4">
            "Thanks to Talib, I found the perfect apartment near my university and a great roommate. The platform saved me so much time!"
          </p>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              <img 
                src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Student" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">Hakim Ziani</p>
              <p className="text-sm text-white/70">Mohammed V University</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Content */}
      <div className="w-full md:w-3/5 flex flex-col">
        <div className="p-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="flex-grow flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md fade-in">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;