export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'customer';
  avatar?: string;
  emailVerified: boolean;
  verificationToken?: string;
  createdAt: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  category: 'Luxury' | 'Sport' | 'SUV' | 'Economy' | 'Premium';
  pricePerDay: number;
  image: string;
  status: 'available' | 'rented' | 'maintenance';
  transmission: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'Electric' | 'Diesel' | 'Hybrid';
  seats: number;
  specs?: Record<string, string>;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  carId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
}
