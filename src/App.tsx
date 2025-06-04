import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Housing from './pages/Housing';



// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  const { i18n } = useTranslation();
  const [isRtl, setIsRtl] = useState(i18n.language === 'ar');

  // Handle RTL direction based on language
  useEffect(() => {
    setIsRtl(i18n.language === 'ar');
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className={isRtl ? 'rtl' : ''}>
      <Routes>
        {/* Main Layout Routes */} 
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/housing" element={<Housing />} />
        </Route>
        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Route>
      </Routes>
      
    </div>
  );
}

export default App;