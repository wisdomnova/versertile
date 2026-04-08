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

export interface UserStats {
  total_analyses: number;
  total_works: number;
  total_published_works: number;
  total_engagement_count: number;
  total_reads: number;
  total_likes: number;
  total_shares: number;
  total_ratings: number;
  average_poem_score: number | null;
  follower_count: number;
  following_count: number;
  reputation_score: number;
  total_earnings: number;
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

export interface Work {
  id: string;
  user_id: string;
  analysis_id?: string;
  title: string;
  description?: string;
  content: string;
  content_length: number;
  genre?: string;
  language_code: string;
  poem_score?: number;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  share_count: number;
  rating_average?: number;
  rating_count: number;
  nft_minted: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  author?: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'wallet_address'>;
}

export interface Engagement {
  id: string;
  user_id: string;
  work_id: string;
  engagement_type: 'read' | 'like' | 'share' | 'comment' | 'rate';
  duration_seconds?: number;
  rating_value?: number;
  comment_text?: string;
  created_at: string;
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

export interface PublishWorkRequest {
  analysis_id?: string;
  title: string;
  description?: string;
  content: string;
  genre?: string;
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
