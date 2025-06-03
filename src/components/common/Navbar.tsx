import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  User, 
  Heart, 
  LogOut, 
  Home, 
  Building, 
  ShoppingBag, 
  Users, 
  LayoutDashboard,
  Globe,
  ChevronDown,
  Bell
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  
  // Mock auth state - in a real app, this would come from an auth context
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];
  
  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsLanguageOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // For demo purposes only - toggle auth state
  const toggleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  // Desktop Navigation Link Component
  const NavLink = ({ to, icon: Icon, label, isActive }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group ${
        isActive 
          ? 'text-primary-600 bg-white/60' 
          : 'text-gray-800 hover:text-primary-600 hover:bg-white/60'
      }`}
    >
      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
      <span>{label}</span>
    </Link>
  );

  // Mobile Navigation Link Component
  const MobileNavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100/50 transition-all duration-200 group"
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      <span className="font-medium">{label}</span>
    </Link>
  );
  
  return (
    <>
      

      {/* Floating Navbar */}
      <nav
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          scrolled
            ? "w-[95%] max-w-6xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20"
            : "w-[90%] max-w-7xl bg-white/80 backdrop-blur-md shadow-lg border border-white/30"
        } rounded-2xl`}
      >
        <div className="px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">{t('app.name')}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center space-x-1 bg-gray-50/50 rounded-full p-1">
                <NavLink 
                  to="/" 
                  icon={Home} 
                  label={t('nav.home')} 
                  isActive={location.pathname === '/'}
                />
                <NavLink 
                  to="/housing" 
                  icon={Building} 
                  label={t('nav.housing')} 
                  isActive={location.pathname === '/housing'}
                />
                <NavLink 
                  to="/items" 
                  icon={ShoppingBag} 
                  label={t('nav.items')} 
                  isActive={location.pathname === '/items'}
                />
                <NavLink 
                  to="/roommates" 
                  icon={Users} 
                  label={t('nav.roommates')} 
                  isActive={location.pathname === '/roommates'}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100/50 transition-all duration-200"
                >
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm hidden sm:block">🇺🇸</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 animate-in slide-in-from-top-2 duration-200">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          // Handle language change here
                          setIsLanguageOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100/50 flex items-center space-x-3 transition-colors duration-150"
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth section */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  {/* Notifications */}
                  <button className="relative p-2 rounded-full hover:bg-gray-100/50 transition-all duration-200">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100/50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">John Doe</div>
                          <div className="text-xs text-gray-500">john@example.com</div>
                        </div>
                        <Link
                          to="/favorites"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors duration-150"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {t('nav.favorites')}
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors duration-150"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {t('nav.dashboard')}
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors duration-150"
                        >
                          <User className="w-4 h-4 mr-2" />
                          {t('nav.profile')}
                        </Link>
                        <button
                          onClick={toggleAuth}
                          className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-red-50/50 transition-colors duration-150 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm px-4 py-1.5"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100/50 transition-all duration-200"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-100/50 bg-white/50 backdrop-blur-sm rounded-b-2xl">
            <div className="px-6 py-4 space-y-3">
              <MobileNavLink to="/" icon={Home} label={t('nav.home')} />
              <MobileNavLink to="/housing" icon={Building} label={t('nav.housing')} />
              <MobileNavLink to="/items" icon={ShoppingBag} label={t('nav.items')} />
              <MobileNavLink to="/roommates" icon={Users} label={t('nav.roommates')} />

              {isLoggedIn ? (
                <div className="pt-3 border-t border-gray-100/50 space-y-2">
                  <MobileNavLink to="/favorites" icon={Heart} label={t('nav.favorites')} />
                  <MobileNavLink to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
                  <MobileNavLink to="/profile" icon={User} label={t('nav.profile')} />
                  <button
                    onClick={toggleAuth}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-error-600 hover:bg-red-50/50 transition-all duration-200 group w-full text-left"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100/50 space-y-2">
                  <Link
                    to="/login"
                    className="block py-2 px-4"
                  >
                    <button className="btn-outline w-full">{t('nav.login')}</button>
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 px-4"
                  >
                    <button className="btn-primary w-full">{t('nav.register')}</button>
                  </Link>
                </div>
              )}

              {/* Language Switcher for Mobile */}
              <div className="pt-3 border-t border-gray-100/50">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;