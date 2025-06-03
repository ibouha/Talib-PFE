import { useEffect } from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Testimonials from '../components/home/Testimonials';
import Stats from '../components/home/Stats';
import PopularListings from '../components/home/PopularListings';

const Home = () => {
  // Update document title
  useEffect(() => {
    document.title = 'Talib - Student Housing & Resources Platform';
  }, []);
  
  return (
    <div className="overflow-hidden">
      <Hero />
      <Features />
      <PopularListings />
      <Testimonials />
      <Stats />
    </div>
  );
};

export default Home;