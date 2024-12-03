// authApi.ts: Handles authentication-related API calls
import { ApiError } from '../../utils/ApiError';
import { getConfig } from '../../utils/config';

const API_URL = getConfig('API_URL', 'http://localhost:3000/api');

export interface RegistrationData {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
}

export class AuthService {
  static async requestOtp(phone: string): Promise<{ token: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      if (!response.ok) throw new ApiError(data.message, response.status);
      
      return data;
    } catch (error) {
      throw new ApiError('Failed to request OTP', 500);
    }
  }

  static async verifyOtp(phone: string, otp: string): Promise<{ token: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      
      const data = await response.json();
      if (!response.ok) throw new ApiError(data.message, response.status);
      
      return data;
    } catch (error) {
      throw new ApiError('Failed to verify OTP', 500);
    }
  }

  static async register(data: RegistrationData): Promise<{ user: any, token: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!response.ok) throw new ApiError(result.message, response.status);
      
      return result;
    } catch (error) {
      throw new ApiError('Registration failed', 500);
    }
  }
}