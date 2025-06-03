import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { setupScrollAnimations } from '../utils/animation';

const MainLayout = () => {
  const location = useLocation();
  
  // Set up scroll animations on route change
  useEffect(() => {
    setupScrollAnimations();
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;