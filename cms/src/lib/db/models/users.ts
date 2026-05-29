import bcrypt from 'bcrypt';
import { sc } from '../supabase';

const SALT_ROUNDS = 10;

// Register a new user
export async function register(username: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  const { data, error } = await sc
    .from('cms_users')
    .insert([{ username, email, password_hash: passwordHash }])
    .select('id, username, email, role, created_at')
    .maybeSingle();
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.message.includes('username')) {
        throw new Error('Username already exists');
      }
      if (error.message.includes('email')) {
        throw new Error('Email already exists');
      }
    }
    throw error;
  }
  
  return data;
}

// Login user
export async function login(usernameOrEmail: string, password: string) {
  // Query for user by username OR email
  const { data, error } = await sc
    .from('cms_users')
    .select('id, username, email, password_hash, role, created_at')
    .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
    .maybeSingle();
  
  if (error) {
    throw new Error('Invalid credentials');
  }
  
  if (!data) {
    throw new Error('Invalid credentials');
  }
  
  const isValid = await bcrypt.compare(password, data.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  // Don't return password hash
  const { password_hash: _passwordHash, ...user } = data;
  void _passwordHash; // Intentionally unused
  return user;
}

// Get user by ID
export async function getUserById(id: number) {
  const { data, error } = await sc
    .from('cms_users')
    .select('id, username, email, role, created_at')
    .eq('id', id)
    .maybeSingle();
  
  if (error) return null;
  return data;
}

// Get all users
export async function getAllUsers() {
  const { data, error } = await sc
    .from('cms_users')
    .select('id, username, email, role, created_at')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}
