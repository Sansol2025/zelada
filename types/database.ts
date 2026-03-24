export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "teacher" | "student" | "family" | "admin";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role: "teacher" | "student" | "family" | "admin";
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: "teacher" | "student" | "family" | "admin";
          avatar_url?: string | null;
        };
      };
      students: {
        Row: {
          id: string;
          profile_id: string;
          school_name: string | null;
          grade: string | null;
          section: string | null;
          qr_code_value: string | null;
          magic_link_token: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          school_name?: string | null;
          grade?: string | null;
          section?: string | null;
          qr_code_value?: string | null;
          magic_link_token?: string | null;
          active?: boolean;
        };
        Update: {
          school_name?: string | null;
          grade?: string | null;
          section?: string | null;
          qr_code_value?: string | null;
          magic_link_token?: string | null;
          active?: boolean;
        };
      };
      families: {
        Row: {
          id: string;
          profile_id: string;
          relation_type: string | null;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          relation_type?: string | null;
        };
        Update: {
          relation_type?: string | null;
        };
      };
      family_students: {
        Row: {
          id: string;
          family_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          family_id: string;
          student_id: string;
        };
        Update: {
          family_id?: string;
          student_id?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          description: string | null;
          color: string;
          icon: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          teacher_id: string;
          title: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          is_active?: boolean;
        };
      };
      modules: {
        Row: {
          id: string;
          subject_id: string;
          title: string;
          description: string | null;
          position: number;
          is_locked_by_default: boolean;
          created_at: string;
        };
        Insert: {
          subject_id: string;
          title: string;
          description?: string | null;
          position: number;
          is_locked_by_default?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          position?: number;
          is_locked_by_default?: boolean;
        };
      };
      activities: {
        Row: {
          id: string;
          module_id: string;
          type: string;
          title: string;
          prompt: string;
          instructions: string | null;
          audio_url: string | null;
          image_url: string | null;
          settings_json: Json | null;
          position: number;
          created_at: string;
        };
        Insert: {
          module_id: string;
          type: string;
          title: string;
          prompt: string;
          instructions?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          settings_json?: Json | null;
          position: number;
          created_at?: string;
        };
        Update: {
          type?: string;
          title?: string;
          prompt?: string;
          instructions?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          settings_json?: Json | null;
          position?: number;
        };
      };
      student_subjects: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          assigned_at: string;
        };
        Insert: {
          student_id: string;
          subject_id: string;
          assigned_at?: string;
        };
        Update: never;
      };
      student_activity_progress: {
        Row: {
          id: string;
          student_id: string;
          activity_id: string;
          status: string;
          score: number | null;
          completed_at: string | null;
          time_spent_seconds: number;
          attempts: number;
          response_json: Json | null;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          activity_id: string;
          status?: string;
          score?: number | null;
          completed_at?: string | null;
          time_spent_seconds?: number;
          attempts?: number;
          response_json?: Json | null;
          updated_at?: string;
        };
        Update: {
          status?: string;
          score?: number | null;
          completed_at?: string | null;
          time_spent_seconds?: number;
          attempts?: number;
          response_json?: Json | null;
          updated_at?: string;
        };
      };
      student_module_progress: {
        Row: {
          id: string;
          student_id: string;
          module_id: string;
          status: string;
          unlocked_at: string | null;
          completed_at: string | null;
          progress_percent: number;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          module_id: string;
          status?: string;
          unlocked_at?: string | null;
          completed_at?: string | null;
          progress_percent?: number;
          updated_at?: string;
        };
        Update: {
          status?: string;
          unlocked_at?: string | null;
          completed_at?: string | null;
          progress_percent?: number;
          updated_at?: string;
        };
      };
      student_subject_progress: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          progress_percent: number;
          completed_modules: number;
          total_modules: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          subject_id: string;
          progress_percent?: number;
          completed_modules?: number;
          total_modules?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          progress_percent?: number;
          completed_modules?: number;
          total_modules?: number;
          status?: string;
          updated_at?: string;
        };
      };
      access_links: {
        Row: {
          id: string;
          student_id: string;
          type: "qr" | "magic_link";
          token: string;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          student_id: string;
          type: "qr" | "magic_link";
          token: string;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          message?: string;
          read?: boolean;
        };
      };
    };
  };
};
