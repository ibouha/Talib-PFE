import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, ShoppingBag, Users } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Features = () => {
  const { t } = useTranslation();
  const featuresRef = useRef<HTMLDivElement>(null);
  const featureCards = useRef<HTMLDivElement[]>([]);
  
  // Add to refs array
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !featureCards.current.includes(el)) {
      featureCards.current.push(el);
    }
  };
  
  // Set up animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Title animation
    gsap.fromTo(
      featuresRef.current?.querySelector('h2'),
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        }
      }
    );
    
    // Cards animation
    featureCards.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          delay: 0.2 * index,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        }
      );
    });
    
    return () => {
      // Clean up
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  return (
    <section ref={featuresRef} className="section bg-white">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('home.features.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Housing Feature */}
          <div 
            ref={addToRefs} 
            className="card p-8 border border-gray-100 hover:border-primary-300 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
              <Building size={32} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('home.features.housing.title')}</h3>
            <p className="text-gray-600">{t('home.features.housing.description')}</p>
            
            {/* Feature highlights */}
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Verified listings</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Near-campus options</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Direct contact with owners</span>
              </li>
            </ul>
          </div>
          
          {/* Items Feature */}
          <div 
            ref={addToRefs} 
            className="card p-8 border border-gray-100 hover:border-primary-300 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('home.features.items.title')}</h3>
            <p className="text-gray-600">{t('home.features.items.description')}</p>
            
            {/* Feature highlights */}
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Buy & sell textbooks</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Dorm essentials</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Safe campus exchanges</span>
              </li>
            </ul>
          </div>
          
          {/* Roommates Feature */}
          <div 
            ref={addToRefs} 
            className="card p-8 border border-gray-100 hover:border-primary-300 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-6">
              <Users size={32} className="text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('home.features.roommates.title')}</h3>
            <p className="text-gray-600">{t('home.features.roommates.description')}</p>
            
            {/* Feature highlights */}
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Compatibility matching</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Lifestyle preferences</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600">Student-verified profiles</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;