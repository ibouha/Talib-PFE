import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, MapPin, Building } from 'lucide-react';
import { housingListings } from '../../data/mockData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PopularListings = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  
  // Add to refs array
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };
  
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
  
  // Get 3 popular listings
  const popularHousing = housingListings.slice(0, 3);
  
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
              <div className="relative h-56 overflow-hidden">
                <img
                  src={housing.images[0]}
                  alt={housing.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                  <span className="badge-primary">
                    {t(`housing.types.${housing.type}`)}
                  </span>
                </div>
              </div>
              
              {/* Housing Details */}
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold mb-2 flex-grow">{housing.title}</h3>
                  <p className="text-primary-600 font-bold">
                    {t('common.price', { price: housing.price })}
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
                  {housing.furnished && (
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