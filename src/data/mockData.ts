// Mock data for testing the application

// City data for Morocco
export const moroccanCities = [
  'Casablanca', 
  'Rabat', 
  'Marrakech', 
  'Fes', 
  'Tangier', 
  'Agadir', 
  'Meknes', 
  'Oujda', 
  'Kenitra', 
  'Tetouan'
];

// University data for Morocco
export const moroccanUniversities = [
  'Mohammed V University in Rabat',
  'Hassan II University of Casablanca',
  'Cadi Ayyad University',
  'Ibn Tofail University',
  'Abdelmalek Essaâdi University',
  'Mohammed First University',
  'Ibn Zohr University',
  'Moulay Ismail University',
  'International University of Rabat',
  'Al Akhawayn University'
];

// Mock user data
export const users = [
  {
    id: '1',
    name: 'Amal Benmoussa',
    email: 'amal.b@example.com',
    university: 'Mohammed V University in Rabat',
    city: 'Rabat',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '2',
    name: 'Youssef Mansouri',
    email: 'youssef.m@example.com',
    university: 'Hassan II University of Casablanca',
    city: 'Casablanca',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '3',
    name: 'Layla Idrissi',
    email: 'layla.i@example.com',
    university: 'Cadi Ayyad University',
    city: 'Marrakech',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '4',
    name: 'Omar El Fassi',
    email: 'omar.f@example.com',
    role: 'owner',
    city: 'Fes',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '5',
    name: 'Fatima Zahra',
    email: 'fatima.z@example.com',
    role: 'owner',
    city: 'Tangier',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

// Mock housing listings
export const housingListings = [
  {
    id: '1',
    title: 'Modern Studio Near University',
    description: 'A bright and modern studio apartment perfect for students. Fully furnished with all utilities included. Just 10 minutes walk to campus.',
    price: 2500,
    city: 'Rabat',
    address: '123 University Street, Agdal',
    type: 'studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    furnished: true,
    amenities: ['WiFi', 'Air Conditioning', 'Washing Machine', 'Refrigerator', 'Study Desk'],
    images: [
      'https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    ownerId: '4',
    postedDate: '2023-08-15',
    available: true
  },
  {
    id: '2',
    title: 'Shared Apartment in City Center',
    description: 'Large 3-bedroom apartment to share with two other students. Common living room and kitchen. Great location near restaurants and shops.',
    price: 1800,
    city: 'Casablanca',
    address: '45 Hassan II Boulevard',
    type: 'shared',
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    furnished: true,
    amenities: ['WiFi', 'Balcony', 'Elevator', 'Security', 'Parking'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    ownerId: '5',
    postedDate: '2023-07-30',
    available: true
  },
  {
    id: '3',
    title: 'Cozy Room in Student House',
    description: 'Private room in a house shared with 4 other students. Quiet neighborhood ideal for studying. Fully equipped kitchen and common areas.',
    price: 1500,
    city: 'Marrakech',
    address: '78 Majorelle Street',
    type: 'shared',
    bedrooms: 1,
    bathrooms: 2,
    area: 18,
    furnished: true,
    amenities: ['WiFi', 'Garden', 'Laundry Room', 'Study Room', 'Bike Storage'],
    images: [
      'https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    ownerId: '4',
    postedDate: '2023-08-05',
    available: true
  },
  {
    id: '4',
    title: 'Spacious 2-Bedroom Apartment',
    description: 'Modern apartment ideal for two students or a small family. Close to public transportation and shopping centers. Recently renovated.',
    price: 3200,
    city: 'Fes',
    address: '12 Medina View Avenue',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    furnished: false,
    amenities: ['WiFi', 'Balcony', 'New Appliances', 'Hardwood Floors', 'Pet Friendly'],
    images: [
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    ownerId: '5',
    postedDate: '2023-07-20',
    available: true
  },
  {
    id: '5',
    title: 'University Dormitory Room',
    description: 'Single room in the university dormitory. Access to all campus facilities. Meal plan available. Perfect for first-year students.',
    price: 1200,
    city: 'Tangier',
    address: 'Campus Dormitory, Room 304',
    type: 'dormitory',
    bedrooms: 1,
    bathrooms: 1,
    area: 15,
    furnished: true,
    amenities: ['WiFi', 'Cafeteria Access', 'Library Access', 'Gym Access', 'Laundry Services'],
    images: [
      'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2440471/pexels-photo-2440471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    ownerId: '4',
    postedDate: '2023-08-10',
    available: true
  }
];

// Mock item listings
export const itemListings = [
  {
    id: '1',
    title: 'Economics Textbook - 3rd Edition',
    description: 'Used economics textbook in good condition. Some highlighting on the first few chapters. Perfect for ECO201 course.',
    price: 150,
    category: 'textbooks',
    condition: 'good',
    images: [
      'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    sellerId: '1',
    city: 'Rabat',
    postedDate: '2023-08-10',
    available: true
  },
  {
    id: '2',
    title: 'Study Desk and Chair Set',
    description: 'Comfortable desk and chair for your study needs. Barely used - moving out and need to sell quickly. Can deliver within city.',
    price: 700,
    category: 'furniture',
    condition: 'likeNew',
    images: [
      'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    sellerId: '2',
    city: 'Casablanca',
    postedDate: '2023-07-28',
    available: true
  },
  {
    id: '3',
    title: 'Laptop - HP Pavilion',
    description: 'HP Pavilion laptop, 2 years old. 8GB RAM, 256GB SSD. Good for student work and light gaming. Comes with charger and laptop bag.',
    price: 2500,
    category: 'electronics',
    condition: 'good',
    images: [
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    sellerId: '3',
    city: 'Marrakech',
    postedDate: '2023-08-05',
    available: true
  },
  {
    id: '4',
    title: 'Mini Refrigerator',
    description: 'Compact refrigerator perfect for dorm rooms. 3.2 cubic feet capacity. Works perfectly, selling because I\'m moving to an apartment with a full kitchen.',
    price: 600,
    category: 'kitchenware',
    condition: 'good',
    images: [
      'https://images.pexels.com/photos/3637728/pexels-photo-3637728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    sellerId: '1',
    city: 'Rabat',
    postedDate: '2023-08-12',
    available: true
  },
  {
    id: '5',
    title: 'Scientific Calculator - TI-84',
    description: 'TI-84 Plus graphing calculator. Essential for math and engineering courses. Comes with cover and manual. Like new condition.',
    price: 350,
    category: 'electronics',
    condition: 'likeNew',
    images: [
      'https://images.pexels.com/photos/6238017/pexels-photo-6238017.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    sellerId: '2',
    city: 'Casablanca',
    postedDate: '2023-07-25',
    available: true
  }
];

// Mock roommate profiles
export const roommateProfiles = [
  {
    id: '1',
    userId: '1',
    name: 'Amal Benmoussa',
    age: 21,
    gender: 'female',
    university: 'Mohammed V University in Rabat',
    program: 'Business Administration',
    year: 3,
    bio: 'I\'m a third-year business student looking for a quiet roommate. I enjoy reading and occasional outings with friends. I\'m clean and organized.',
    interests: ['reading', 'cooking', 'hiking', 'photography'],
    lifestyle: ['early', 'quiet', 'clean'],
    preferences: {
      smoking: false,
      pets: true,
      gender: 'female',
      studyHabits: 'I usually study in the evenings and prefer a quiet environment'
    },
    budget: 1800,
    lookingFor: 'apartment',
    location: 'Agdal, Rabat',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
    postedDate: '2023-08-02'
  },
  {
    id: '2',
    userId: '2',
    name: 'Youssef Mansouri',
    age: 20,
    gender: 'male',
    university: 'Hassan II University of Casablanca',
    program: 'Computer Science',
    year: 2,
    bio: 'Computer science student with a passion for technology and music. I\'m looking for a roommate who shares similar interests. I\'m social but respect privacy.',
    interests: ['programming', 'music', 'gaming', 'sports'],
    lifestyle: ['night', 'social'],
    preferences: {
      smoking: false,
      pets: false,
      gender: 'noPreference',
      studyHabits: 'I code late into the night sometimes but wear headphones'
    },
    budget: 2000,
    lookingFor: 'shared',
    location: 'Maarif, Casablanca',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    postedDate: '2023-08-07'
  },
  {
    id: '3',
    userId: '3',
    name: 'Layla Idrissi',
    age: 22,
    gender: 'female',
    university: 'Cadi Ayyad University',
    program: 'Architecture',
    year: 4,
    bio: 'Architecture student in my final year. I spend a lot of time on projects so I need a place where I can spread out my work sometimes. I\'m friendly and like to keep common areas tidy.',
    interests: ['art', 'design', 'travel', 'coffee'],
    lifestyle: ['night', 'clean', 'social'],
    preferences: {
      smoking: false,
      pets: true,
      gender: 'noPreference',
      studyHabits: 'I work on my architecture models at home so need some space'
    },
    budget: 2200,
    lookingFor: 'apartment',
    location: 'Gueliz, Marrakech',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600',
    postedDate: '2023-07-29'
  }
];

// Mock testimonials
export const testimonials = [
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

// Mock statistics
export const statistics = {
  students: 5423,
  listings: 1872,
  universities: 15,
  cities: 10
};

// Mock messages
export const messages = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: 'Hi Amal, I saw your roommate profile and we seem to have compatible preferences. Would you be interested in discussing further?',
    timestamp: '2023-08-10T14:30:00',
    read: true
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    content: 'Hello Youssef, thank you for reaching out! I\'d be happy to chat more about potentially becoming roommates. What kind of apartment are you looking for?',
    timestamp: '2023-08-10T15:45:00',
    read: true
  },
  {
    id: '3',
    senderId: '3',
    receiverId: '1',
    content: 'Hello, I\'m interested in the economics textbook you\'re selling. Is it still available? Does it include all the chapters needed for the introductory course?',
    timestamp: '2023-08-11T09:20:00',
    read: false
  }
];

// Export all mock data
export default {
  users,
  housingListings,
  itemListings,
  roommateProfiles,
  moroccanCities,
  moroccanUniversities,
  testimonials,
  statistics,
  messages
};