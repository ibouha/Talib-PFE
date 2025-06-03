import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Building, GraduationCap, MapPin } from 'lucide-react';
import { statistics } from '../../data/mockData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Stats = () => {
  const { t } = useTranslation();
  const statsRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<HTMLSpanElement[]>([]);
  
  const addToRefs = (el: HTMLSpanElement) => {
    if (el && !counterRefs.current.includes(el)) {
      counterRefs.current.push(el);
    }
  };
  
  // Animation setup
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Set initial values
    counterRefs.current.forEach(counter => {
      counter.textContent = '0';
    });
    
    // Animate stats counting up
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      onEnter: () => {
        counterRefs.current.forEach((counter, index) => {
          const value = Object.values(statistics)[index];
          const duration = 2;
          
          // Animate the counter
          gsap.to(counter, {
            duration,
            ease: 'power2.out',
            innerText: value.toString(),
            snap: { innerText: 1 }, // Ensure whole numbers only
            modifiers: {
              innerText: (value: string) => {
                return Math.round(parseFloat(value)).toString();
              }
            }
          });
        });
      },
      once: true
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  // Stats data with icons
  const statsItems = [
    { key: 'students', icon: <Users size={40} className="text-primary-500" />, color: 'bg-primary-50' },
    { key: 'listings', icon: <Building size={40} className="text-accent-500" />, color: 'bg-accent-50' },
    { key: 'universities', icon: <GraduationCap size={40} className="text-secondary-500" />, color: 'bg-secondary-50' },
    { key: 'cities', icon: <MapPin size={40} className="text-success-500" />, color: 'bg-success-50' }
  ];
  
  return (
    <section ref={statsRef} className="section bg-white">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('home.stats.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsItems.map((item, index) => (
            <div key={item.key} className="card p-6 text-center">
              <div className={`w-20 h-20 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4`}>
                {item.icon}
              </div>
              <span 
                ref={addToRefs}
                className="text-4xl font-bold block mb-2"
              >
                0
              </span>
              <span className="text-gray-600 text-lg">
                {t(`home.stats.${item.key}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;