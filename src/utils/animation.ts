import { gsap } from 'gsap';

// Utility function to handle fade-in animations
export const fadeInElement = (element: HTMLElement, delay: number = 0): gsap.core.Tween => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 0.6, 
      delay,
      ease: 'power2.out'
    }
  );
};

// Stagger animation for list items
export const staggerElements = (elements: HTMLElement[], staggerAmount: number = 0.1): gsap.core.Timeline => {
  return gsap.timeline().fromTo(
    elements,
    { opacity: 0, y: 20 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 0.4, 
      stagger: staggerAmount,
      ease: 'power2.out'
    }
  );
};

// Scale in animation
export const scaleInElement = (element: HTMLElement, delay: number = 0): gsap.core.Tween => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    { 
      opacity: 1, 
      scale: 1, 
      duration: 0.5, 
      delay,
      ease: 'back.out(1.7)'
    }
  );
};

// Slide in from direction
export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

export const slideInElement = (
  element: HTMLElement, 
  direction: SlideDirection = 'left', 
  distance: number = 50,
  delay: number = 0
): gsap.core.Tween => {
  const xFrom = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const yFrom = direction === 'top' ? -distance : direction === 'bottom' ? distance : 0;
  
  return gsap.fromTo(
    element,
    { opacity: 0, x: xFrom, y: yFrom },
    { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      duration: 0.6, 
      delay,
      ease: 'power2.out'
    }
  );
};

// Setup scroll animations
export const setupScrollAnimations = (): void => {
  // Get all elements with the fade-in class
  const fadeElements = document.querySelectorAll('.fade-in');
  
  // Set up scroll trigger for each element
  fadeElements.forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleClass: 'appear',
          once: true
        }
      }
    );
  });
};