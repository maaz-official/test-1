// constants/ApiRoutes.ts
import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:6000';
export const LOGIN_ENDPOINT = `${API_BASE_URL}/api/signin`;
export const SIGNUP_ENDPOINT = `${API_BASE_URL}/api/users`;
export const USER_PROFILE_ENDPOINT = `${API_BASE_URL}/user/profile`;
