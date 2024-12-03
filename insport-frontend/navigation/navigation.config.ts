// navigation/navigation.config.ts
// Centralized navigation configuration/settings for route names and tab items
import LoginScreen from '@/app/auth/login';
import SignupScreen from '@/app/auth/signup';
import ForgotPasswordScreen from '@/app/auth/forgotPassword';
import HomeScreen from '@/app/(tabs)/home';
import ExamHubScreen from '@/app/(tabs)/exam-hub';
import FavoriteScreen from '@/app/(tabs)/favorite';
import MenuScreen from '@/app/(tabs)/menu';

export const ROOT_ROUTES = {
    SPLASH: 'splash',
    AUTH: 'auth',
    MAIN: 'main',
  };
  
  export const AUTH_ROUTES = {
    LOGIN: 'login',
    SIGNUP: 'signup',
    FORGOT_PASSWORD: 'forgotPassword',
    RESET_PASSWORD: 'resetPassword',
  };

  export const MAIN_ROUTES = {
    HOME: 'home',
    EXAM_HUB: 'exam-hub',
    FAVORITES: 'favorites',
    MENU: 'menu',
  };


export const AUTH_NAVIGATION = [
    { name: `${ROOT_ROUTES.AUTH}/${AUTH_ROUTES.LOGIN}`, component: LoginScreen },
    { name: `${ROOT_ROUTES.AUTH}/${AUTH_ROUTES.SIGNUP}`, component: SignupScreen },
    { name: `${ROOT_ROUTES.AUTH}/${AUTH_ROUTES.FORGOT_PASSWORD}`, component: ForgotPasswordScreen },
];
  
export const TAB_NAVIGATION = [
  { name: MAIN_ROUTES.HOME, icon: 'home', component: HomeScreen },
  { name: MAIN_ROUTES.EXAM_HUB, icon: 'book', component: ExamHubScreen },
  { name: MAIN_ROUTES.FAVORITES, icon: 'heart', component: FavoriteScreen },
  { name: MAIN_ROUTES.MENU, icon: 'menu', component: MenuScreen },
];
  
  export default {
    ROOT_ROUTES,
    AUTH_ROUTES,
    MAIN_ROUTES,
    TAB_NAVIGATION,
  };
  
  