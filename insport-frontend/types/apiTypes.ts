// apiTypes.ts: TypeScript types for API data

// Generic API Response Wrapper
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
    error?: string;
  }
  
  // Auth-Related Types
  export interface LoginRequest {
    emailOrUsername: string;
    password: string;
  }
  
  export interface SignupRequest {
    display_name: string;
    username: string;
    email: string;
    password: string;
    dob: Date;
    gender: 'male' | 'female'; 
  }
  
  export interface AuthResponse {
    token: string;
    user: UserProfile;
  }
  
  // User Profile Types
  export interface UserProfile {
    id: string;
    display_name: string;
    username: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Exam-Related Types
  export interface Exam {
    id: string;
    title: string;
    description: string;
    date: string;
    questions: Question[];
  }
  
  export interface Question {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface ExamResponse extends ApiResponse<Exam[]> {}  
  
  // Favorites API Types
  export interface FavoriteItem {
    id: string;
    itemType: 'exam' | 'tutorial' | 'note';
    itemId: string;
    itemTitle: string;
  }
  
  // Exam Hub Types
  export interface ExamHubItem {
    id: string;
    title: string;
    category: string;
    date: string;
  }
  
  // Error Handling Types
  export interface ApiError {
    status: number;
    message: string;
    errors?: { [field: string]: string };
  }
  