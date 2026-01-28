// API Types for VERSERTILE

export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthSignupRequest {
  email: string;
  password: string;
  password_confirm: string;
  full_name?: string;
  wallet_address?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  text_content: string;
  text_length: number;
  originality_score: number;
  quality_score: number;
  expression_score: number;
  overall_score: number;
  feedback: string[];
  sentiment?: string;
  plagiarism_check?: Record<string, unknown>;
  model_version: string;
  processing_time_ms: number;
  created_at: string;
  is_published: boolean;
}

export interface PoemAnalyzeRequest {
  text: string;
  language?: string;
}

export interface PoemAnalyzeResponse {
  success: boolean;
  analysis?: Analysis;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}
