import { User } from '../types';

// Simple hash function for passwords (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encoding (NOT secure for production)
};

const comparePassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash;
};

// Generate verification token
export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Sign up function
export const signup = async (email: string, name: string, password: string): Promise<{ user: User; token: string }> => {
  // Check if user already exists
  const users = JSON.parse(localStorage.getItem('vita_users') || '[]');
  if (users.some((u: User) => u.email === email)) {
    throw new Error('Email already registered');
  }

  const verificationToken = generateVerificationToken();
  const userId = generateId();

  const newUser: User = {
    id: userId,
    email,
    name,
    password: hashPassword(password),
    role: 'customer',
    emailVerified: false,
    verificationToken,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem('vita_users', JSON.stringify(users));

  // In production, send verification email here
  console.log(`[DEMO] Verification link would be sent to ${email}: /verify/${verificationToken}`);

  return { user: newUser, token: verificationToken };
};

// Verify email
export const verifyEmail = async (token: string): Promise<User | null> => {
  const users = JSON.parse(localStorage.getItem('vita_users') || '[]');
  const userIndex = users.findIndex((u: User) => u.verificationToken === token);

  if (userIndex === -1) {
    throw new Error('Invalid verification token');
  }

  users[userIndex].emailVerified = true;
  users[userIndex].verificationToken = undefined;
  localStorage.setItem('vita_users', JSON.stringify(users));

  return users[userIndex];
};

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  const users = JSON.parse(localStorage.getItem('vita_users') || '[]');
  const user = users.find((u: User) => u.email === email);

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email first');
  }

  if (!comparePassword(password, user.password)) {
    throw new Error('Invalid password');
  }

  return user;
};

// Get user by email
export const getUserByEmail = (email: string): User | null => {
  const users = JSON.parse(localStorage.getItem('vita_users') || '[]');
  return users.find((u: User) => u.email === email) || null;
};

// Get user by ID
export const getUserById = (id: string): User | null => {
  const users = JSON.parse(localStorage.getItem('vita_users') || '[]');
  return users.find((u: User) => u.id === id) || null;
};
