import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, MapPin, Building } from 'lucide-react';
import { Housing } from '../../services/api';
import housingService from '../../services/housingService';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PopularListings = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [popularHousing, setPopularHousing] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);

  // Add to refs array
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  // Fetch popular housing from backend
  useEffect(() => {
    const fetchPopularHousing = async () => {
      try {
        setLoading(true);
        const response = await housingService.getFeatured(3); // Get 3 featured housing
        if (response.success) {
          setPopularHousing(response.data.housing || []);
        }
      } catch (error) {
        console.error('Error fetching popular housing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularHousing();
  }, []);
  
  // Set up animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Title animation
    gsap.fromTo(
      sectionRef.current?.querySelector('h2'),
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      }
    );
    
    // Cards animation
    cardRefs.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          delay: 0.1 * index,
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
  
  // Show loading state
  if (loading) {
    return (
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no housing data
  if (popularHousing.length === 0) {
    return null;
  }
  
  return (
    <section ref={sectionRef} className="section bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Popular Housing</h2>
          <Link to="/housing" className="flex items-center text-primary-600 font-medium hover:text-primary-700">
            {t('common.seeAll')}
            <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularHousing.map((housing, index) => (
            <div 
              key={housing.id}
              ref={addToRefs}
              className="card overflow-hidden h-full flex flex-col"
            >
              {/* Housing Image */}
              <div className="relative h-56 overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Building size={48} />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="badge-primary">
                    {housing.type}
                  </span>
                </div>
              </div>
              
              {/* Housing Details */}
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold mb-2 flex-grow">{housing.title}</h3>
                  <p className="text-primary-600 font-bold">
                    {housing.price.toLocaleString()} MAD/month
                  </p>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={16} className="mr-1" />
                  <span>{housing.city}, Morocco</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{housing.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                    <Building size={16} className="mr-1" />
                    <span>{housing.bedrooms} {housing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                    <span>{housing.area} m²</span>
                  </div>
                  {housing.is_furnished && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                      <span>Furnished</span>
                    </div>
                  )}
                </div>
                
                <Link 
                  to={`/housing/${housing.id}`} 
                  className="mt-auto btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularListings;