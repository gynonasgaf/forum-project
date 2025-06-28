import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string;
          post_count: number;
          reputation: number;
          is_verified: boolean;
          is_admin: boolean;
          is_owner: boolean;
          honorable_title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string;
          post_count?: number;
          reputation?: number;
          is_verified?: boolean;
          is_admin?: boolean;
          is_owner?: boolean;
          honorable_title?: string | null;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          bio?: string;
          post_count?: number;
          reputation?: number;
          is_verified?: boolean;
          is_admin?: boolean;
          is_owner?: boolean;
          honorable_title?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          color: string;
          created_at: string;
        };
      };
      threads: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          category_id: string;
          is_pinned: boolean;
          is_locked: boolean;
          views: number;
          created_at: string;
          updated_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          thread_id: string;
          created_at: string;
          updated_at: string;
        };
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          images: string[];
          status: 'pending' | 'approved' | 'rejected';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          images?: string[];
          status?: 'pending' | 'approved' | 'rejected';
          admin_notes?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          admin_notes?: string | null;
        };
      };
      site_settings: {
        Row: {
          id: string;
          site_title: string;
          site_logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Update: {
          site_title?: string;
          site_logo_url?: string | null;
        };
      };
    };
  };
};