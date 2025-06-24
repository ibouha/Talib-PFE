import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';
import gsap from 'gsap';

const Testimonials = () => {
  const { t } = useTranslation();
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Static testimonials data
  const testimonials = [
    {
      id: '1',
      name: 'Hakim Ziani',
      university: 'Mohammed V University',
      text: 'Thanks to Talib, I found the perfect apartment near my university and a great roommate. The platform saved me so much time!',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: '2',
      name: 'Nora El Amrani',
      university: 'Hassan II University',
      text: 'I was able to sell all my textbooks from last semester and buy the ones I needed for this year. The item exchange feature is amazing!',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: '3',
      name: 'Karim Tazi',
      university: 'Ibn Tofail University',
      text: 'Moving to a new city for studies was intimidating, but Talib made finding accommodation and connecting with other students so easy.',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];
  
  // Animation setup
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: testimonialsRef.current,
        start: 'top 80%',
      }
    });
    
    tl.fromTo(
      testimonialsRef.current?.querySelector('h2'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo(
      testimonialsRef.current?.querySelectorAll('.testimonial-card'),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, stagger: 0.2, duration: 0.8 },
      '-=0.4'
    );
  }, []);
  
  // Handle automatic testimonial cycling for mobile view
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section ref={testimonialsRef} className="section bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('home.testimonials.title')}
        </h2>
        
        {/* Desktop Testimonials Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="testimonial-card bg-white rounded-xl shadow-md p-6 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 text-primary-200">
                <Quote size={32} />
              </div>
              
              <p className="text-gray-700 mb-6">{testimonial.text}</p>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.university}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile Testimonial Carousel */}
        <div className="md:hidden">
          <div className="bg-white rounded-xl shadow-md p-6 relative">
            <div className="absolute top-4 right-4 text-primary-200">
              <Quote size={32} />
            </div>
            
            <p className="text-gray-700 mb-6">{testimonials[activeIndex].text}</p>
            
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                <img 
                  src={testimonials[activeIndex].avatar} 
                  alt={testimonials[activeIndex].name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold">{testimonials[activeIndex].name}</h4>
                <p className="text-sm text-gray-600">{testimonials[activeIndex].university}</p>
              </div>
            </div>
            
            {/* Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index ? 'w-6 bg-primary-500' : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;