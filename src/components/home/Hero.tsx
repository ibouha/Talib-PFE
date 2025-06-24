import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building, ShoppingBag, Users } from 'lucide-react';
import gsap from 'gsap';
import heroImage from '../../public/Image_fx (14).jpg';

const Hero = () => {
  const { t } = useTranslation();
  
  // Refs for animation targets
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create animation timeline
    const tl = gsap.timeline();
    
    // Animate elements
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(
      buttonsRef.current ? Array.from(buttonsRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(
      heroImageRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
      '-=1'
    );
  }, []);
  
  return (
    <div className={`relative  min-h-screen flex items-center `}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute h-32 w-32 rounded-full bg-primary-300 opacity-20 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute h-40 w-40 rounded-full bg-accent-300 opacity-20 bottom-1/3 right-1/4" />
        <div className="absolute h-24 w-24 rounded-full bg-secondary-300 opacity-20 top-1/3 right-1/4" />
      </div>
      
      <div className="container-custom mx-auto px-6 py-20 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="z-10">
            <h1 
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              {t('home.hero.title')}
            </h1>
            <p 
              ref={subtitleRef}
              className="mt-6 text-lg md:text-xl text-gray-700 max-w-xl"
            >
              {t('home.hero.subtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div ref={buttonsRef} className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
              <Link to="/housing" className="btn-primary text-base py-3 px-6 rounded-lg shadow-lg inline-flex items-center">
                <Building size={20} className="mr-2" />
                {t('home.hero.ctaHousing')}
              </Link>
              <Link to="/items" className="btn-outline border-2 text-base py-3 px-6 rounded-lg inline-flex items-center">
                <ShoppingBag size={20} className="mr-2" />
                {t('home.hero.ctaItems')}
              </Link>
              <Link to="/roommates" className="btn-outline border-2 text-base py-3 px-6 rounded-lg inline-flex items-center">
                <Users size={20} className="mr-2" />
                {t('home.hero.ctaRoommates')}
              </Link>
            </div>
          </div>
          
          {/* Right Side - Image */}
          <div ref={heroImageRef} className="relative lg:flex justify-end">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Students" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;