import { User, Car, Booking, Review, Ticket } from './types';

// Database version (increment this to force reset)
const DB_VERSION = 2;

// Initial Mock Data
const INITIAL_CARS: Car[] = [
  { id: '1', make: 'Tesla', model: 'Model S', year: 2023, category: 'Luxury', pricePerDay: 150, image: '/images/cars/tesla.jpeg', status: 'available', transmission: 'Automatic', fuelType: 'Electric', seats: 5, specs: { '0-60': '3.1s', range: '405mi', power: '670hp' } },
  { id: '2', make: 'BMW', model: 'M4 Competition', year: 2022, category: 'Sport', pricePerDay: 200, image: '/images/cars/bmwm4.jpg', status: 'available', transmission: 'Automatic', fuelType: 'Petrol', seats: 4, specs: { engine: '3.0L I6', power: '503hp', topSpeed: '180mph' } },
  { id: '3', make: 'Audi', model: 'Q8', year: 2023, category: 'SUV', pricePerDay: 120, image: '/images/cars/audiq8.jpg', status: 'available', transmission: 'Automatic', fuelType: 'Diesel', seats: 5, specs: { drive: 'Quattro', towing: '7,700lbs', power: '335hp' } },
  { id: '4', make: 'Mercedes-Benz', model: 'E-Class', year: 2021, category: 'Luxury', pricePerDay: 110, image: '/images/cars/mercieclass.jpg', status: 'available', transmission: 'Automatic', fuelType: 'Hybrid', seats: 5, specs: { suspension: 'Air Body', interior: 'Burmester', safety: 'Distronic' } },
];

class DBService {
  private users: User[] = [];
  private cars: Car[] = INITIAL_CARS;
  private bookings: Booking[] = [];
  private reviews: Review[] = [];
  private tickets: Ticket[] = [];

  constructor() {
    this.load();
  }

  private save() {
    localStorage.setItem('vita_rent_db', JSON.stringify({
      version: DB_VERSION,
      users: this.users,
      cars: this.cars,
      bookings: this.bookings,
      reviews: this.reviews,
      tickets: this.tickets
    }));
  }

  private load() {
    const data = localStorage.getItem('vita_rent_db');
    if (data) {
      const parsed = JSON.parse(data);
      // Reset if version changed
      if (parsed.version !== DB_VERSION) {
        console.log('Database version updated. Resetting to initial data...');
        this.users = [];
        this.cars = INITIAL_CARS;
        this.bookings = [];
        this.reviews = [];
        this.tickets = [];
        this.save();
        return;
      }
      this.users = parsed.users || [];
      this.cars = parsed.cars || INITIAL_CARS;
      this.bookings = parsed.bookings || [];
      this.reviews = parsed.reviews || [];
      this.tickets = parsed.tickets || [];
    }
  }

  // Users
  async getUsers() { return this.users; }
  async getUserById(id: string) { return this.users.find(u => u.id === id); }
  async upsertUser(user: User) {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx >= 0) this.users[idx] = user;
    else this.users.push(user);
    this.save();
    return user;
  }

  // Cars
  async getCars() { return this.cars; }
  async getCarById(id: string) { return this.cars.find(c => c.id === id); }
  async addCar(car: Car) {
    this.cars.push(car);
    this.save();
    return car;
  }

  async updateCar(car: Car) {
    const idx = this.cars.findIndex(c => c.id === car.id);
    if (idx >= 0) this.cars[idx] = car;
    this.save();
    return car;
  }

  async deleteCar(id: string) {
    this.cars = this.cars.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // Bookings
  async getBookings() { return this.bookings; }
  async updateBookingStatus(bookingId: string, status: Booking['status']) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      // If cancelled, make car available again
      if (status === 'cancelled') {
        const car = this.cars.find(c => c.id === booking.carId);
        if (car) car.status = 'available';
      }
      this.save();
    }
    return booking;
  }
  async deleteBooking(id: string) {
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.save();
    return true;
  }
  async createBooking(booking: Booking) {
    this.bookings.push(booking);
    // Update car status
    const car = this.cars.find(c => c.id === booking.carId);
    if (car) car.status = 'rented';
    this.save();
    return booking;
  }

  // Support
  async getTickets() { return this.tickets; }
  async createTicket(ticket: Ticket) {
    this.tickets.push(ticket);
    this.save();
    return ticket;
  }
  async deleteTicket(id: string) {
    this.tickets = this.tickets.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // Reviews
  async getReviews() { return this.reviews; }
  async getReviewsByCarId(carId: string) { return this.reviews.filter(r => r.carId === carId); }
  async addReview(review: Review) {
    this.reviews.push(review);
    this.save();
    return review;
  }
}

export const DB = new DBService();
