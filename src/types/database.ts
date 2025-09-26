export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      beta_signups: {
        Row: {
          id: string
          email: string
          github_username: string | null
          gitlab_username: string | null
          current_tools: string[]
          documentation_platform: string[]
          pain_points: string
          use_case_description: string
          team_size: 'individual' | 'small_team' | 'medium_team' | 'large_team' | 'enterprise' | null
          signup_source: string | null
          referrer_code: string | null
          created_at: string
          email_verified: boolean
          beta_status: 'pending' | 'invited' | 'active'
          engagement_score: number
          notes: string | null
          opted_in_marketing: boolean
          opted_in_research: boolean
        }
        Insert: {
          id?: string
          email: string
          github_username?: string | null
          gitlab_username?: string | null
          current_tools: string[]
          documentation_platform: string[]
          pain_points: string
          use_case_description: string
          team_size?: 'individual' | 'small_team' | 'medium_team' | 'large_team' | 'enterprise' | null
          signup_source?: string | null
          referrer_code?: string | null
          created_at?: string
          email_verified?: boolean
          beta_status?: 'pending' | 'invited' | 'active'
          engagement_score?: number
          notes?: string | null
          opted_in_marketing?: boolean
          opted_in_research?: boolean
        }
        Update: {
          id?: string
          email?: string
          github_username?: string | null
          gitlab_username?: string | null
          current_tools?: string[]
          documentation_platform?: string[]
          pain_points?: string
          use_case_description?: string
          team_size?: 'individual' | 'small_team' | 'medium_team' | 'large_team' | 'enterprise' | null
          signup_source?: string | null
          referrer_code?: string | null
          created_at?: string
          email_verified?: boolean
          beta_status?: 'pending' | 'invited' | 'active'
          engagement_score?: number
          notes?: string | null
          opted_in_marketing?: boolean
          opted_in_research?: boolean
        }
      }
      page_analytics: {
        Row: {
          id: string
          page_path: string
          visitor_id: string | null
          session_id: string | null
          event_type: string
          timestamp: string
          referrer: string | null
          user_agent_hash: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          page_path: string
          visitor_id?: string | null
          session_id?: string | null
          event_type: string
          timestamp?: string
          referrer?: string | null
          user_agent_hash?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          page_path?: string
          visitor_id?: string | null
          session_id?: string | null
          event_type?: string
          timestamp?: string
          referrer?: string | null
          user_agent_hash?: string | null
          metadata?: Json | null
        }
      }
      email_events: {
        Row: {
          id: string
          user_id: string
          email_type: 'welcome' | 'update' | 'early_access' | 'feedback_request' | 're_engagement' | 'monthly_newsletter'
          event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam_report' | 'unsubscribe' | 'group_unsubscribe'
          timestamp: string
          email_subject: string | null
          campaign_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          email_type: 'welcome' | 'update' | 'early_access' | 'feedback_request' | 're_engagement' | 'monthly_newsletter'
          event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam_report' | 'unsubscribe' | 'group_unsubscribe'
          timestamp?: string
          email_subject?: string | null
          campaign_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          email_type?: 'welcome' | 'update' | 'early_access' | 'feedback_request' | 're_engagement' | 'monthly_newsletter'
          event_type?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam_report' | 'unsubscribe' | 'group_unsubscribe'
          timestamp?: string
          email_subject?: string | null
          campaign_id?: string | null
          metadata?: Json | null
        }
      }
      feedback_submissions: {
        Row: {
          id: string
          user_id: string
          feedback_type: 'survey' | 'bug_report' | 'feature_request'
          survey_id: string | null
          responses: Json | null
          free_form_feedback: string | null
          rating: number | null
          submitted_at: string
          internal_status: 'new' | 'reviewed' | 'addressed'
        }
        Insert: {
          id?: string
          user_id: string
          feedback_type: 'survey' | 'bug_report' | 'feature_request'
          survey_id?: string | null
          responses?: Json | null
          free_form_feedback?: string | null
          rating?: number | null
          submitted_at?: string
          internal_status?: 'new' | 'reviewed' | 'addressed'
        }
        Update: {
          id?: string
          user_id?: string
          feedback_type?: 'survey' | 'bug_report' | 'feature_request'
          survey_id?: string | null
          responses?: Json | null
          free_form_feedback?: string | null
          rating?: number | null
          submitted_at?: string
          internal_status?: 'new' | 'reviewed' | 'addressed'
        }
      }
      anonymous_visitors: {
        Row: {
          id: string
          visitor_hash: string
          session_id: string
          first_seen: string
          last_seen: string
          page_views: number
          total_sessions: number
          user_agent_hash: string | null
          timezone_offset: number | null
          screen_resolution: string | null
          referrer_domain: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          is_returning: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visitor_hash: string
          session_id: string
          first_seen?: string
          last_seen?: string
          page_views?: number
          total_sessions?: number
          user_agent_hash?: string | null
          timezone_offset?: number | null
          screen_resolution?: string | null
          referrer_domain?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          is_returning?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visitor_hash?: string
          session_id?: string
          first_seen?: string
          last_seen?: string
          page_views?: number
          total_sessions?: number
          user_agent_hash?: string | null
          timezone_offset?: number | null
          screen_resolution?: string | null
          referrer_domain?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          is_returning?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics_sessions: {
        Row: {
          id: string
          visitor_id: string
          session_start: string
          session_end: string | null
          pages_visited: number
          total_interactions: number
          max_scroll_depth: number
          time_on_site: number
          entry_page: string
          exit_page: string | null
          referrer: string | null
          utm_data: Json | null
          device_data: Json | null
          engagement_score: number
          converted: boolean
          bounce: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          session_start?: string
          session_end?: string | null
          pages_visited?: number
          total_interactions?: number
          max_scroll_depth?: number
          time_on_site?: number
          entry_page: string
          exit_page?: string | null
          referrer?: string | null
          utm_data?: Json | null
          device_data?: Json | null
          engagement_score?: number
          converted?: boolean
          bounce?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          session_start?: string
          session_end?: string | null
          pages_visited?: number
          total_interactions?: number
          max_scroll_depth?: number
          time_on_site?: number
          entry_page?: string
          exit_page?: string | null
          referrer?: string | null
          utm_data?: Json | null
          device_data?: Json | null
          engagement_score?: number
          converted?: boolean
          bounce?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          visitor_id: string
          session_id: string
          event_type: string
          page_path: string
          timestamp: string
          properties: Json | null
          user_agent_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          session_id: string
          event_type: string
          page_path: string
          timestamp?: string
          properties?: Json | null
          user_agent_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          session_id?: string
          event_type?: string
          page_path?: string
          timestamp?: string
          properties?: Json | null
          user_agent_hash?: string | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          communication_frequency: 'daily' | 'weekly' | 'monthly'
          preferred_contact_method: string
          timezone: string | null
          beta_testing_availability: Json | null
          technical_background: 'beginner' | 'intermediate' | 'expert' | null
          areas_of_interest: string[] | null
          updated_at: string
        }
        Insert: {
          user_id: string
          communication_frequency?: 'daily' | 'weekly' | 'monthly'
          preferred_contact_method: string
          timezone?: string | null
          beta_testing_availability?: Json | null
          technical_background?: 'beginner' | 'intermediate' | 'expert' | null
          areas_of_interest?: string[] | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          communication_frequency?: 'daily' | 'weekly' | 'monthly'
          preferred_contact_method?: string
          timezone?: string | null
          beta_testing_availability?: Json | null
          technical_background?: 'beginner' | 'intermediate' | 'expert' | null
          areas_of_interest?: string[] | null
          updated_at?: string
        }
      }
      email_campaigns: {
        Row: {
          id: string
          campaign_id: string
          campaign_type: string
          name: string | null
          subject: string
          template_id: string | null
          segment_filter: string
          scheduled_at: string | null
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          total_recipients: number
          sent_count: number | null
          error_count: number | null
          sent_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          campaign_type: string
          name?: string | null
          subject: string
          template_id?: string | null
          segment_filter: string
          scheduled_at?: string | null
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          total_recipients: number
          sent_count?: number | null
          error_count?: number | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          campaign_type?: string
          name?: string | null
          subject?: string
          template_id?: string | null
          segment_filter?: string
          scheduled_at?: string | null
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          total_recipients?: number
          sent_count?: number | null
          error_count?: number | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      email_bounces: {
        Row: {
          id: string
          email: string
          bounce_type: string
          reason: string | null
          status_code: string | null
          response_text: string | null
          sg_event_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          email: string
          bounce_type: string
          reason?: string | null
          status_code?: string | null
          response_text?: string | null
          sg_event_id: string
          timestamp?: string
        }
        Update: {
          id?: string
          email?: string
          bounce_type?: string
          reason?: string | null
          status_code?: string | null
          response_text?: string | null
          sg_event_id?: string
          timestamp?: string
        }
      }
      spam_complaints: {
        Row: {
          id: string
          email: string
          sg_event_id: string
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          email: string
          sg_event_id: string
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          email?: string
          sg_event_id?: string
          timestamp?: string
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
