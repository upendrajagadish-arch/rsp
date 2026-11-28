export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "student" | "college_admin" | "recruiter";
export type VerificationStatus =
  | "pending"
  | "issuer_verified"
  | "institution_reviewed"
  | "unavailable"
  | "rejected"
  | "expired"
  | "revoked";
export type EvidenceSource = "credential" | "assessment" | "project" | "self_declared";
export type CertificatePipelineStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "confirmed"
  | "verifying"
  | "complete"
  | "failed";
export type JobStatus = "queued" | "processing" | "needs_review" | "completed" | "failed" | "cancelled";
export type AchievementStatus =
  | "locked"
  | "submitted"
  | "verified"
  | "rejected"
  | "revoked";
export type PhysicalStampStatus =
  | "eligible"
  | "awaiting_allocation"
  | "ready_for_collection"
  | "issued"
  | "replacement_requested"
  | "cancelled";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      organization_memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: AppRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role: AppRole;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["organization_memberships"]["Row"]>;
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          passport_id: string;
          degree: string | null;
          branch: string | null;
          graduation_year: number | null;
          bio: string | null;
          profile_completion: number;
          target_job_role_id: string | null;
          sharing_enabled: boolean;
          public_sections: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          organization_id: string;
          passport_id: string;
          degree?: string | null;
          branch?: string | null;
          graduation_year?: number | null;
          bio?: string | null;
          profile_completion?: number;
          target_job_role_id?: string | null;
          sharing_enabled?: boolean;
          public_sections?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["student_profiles"]["Row"]>;
        Relationships: [];
      };
      technology_categories: {
        Row: { id: string; slug: string; name: string; sort_order: number };
        Insert: { slug: string; name: string; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["technology_categories"]["Row"]>;
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          category_id?: string | null;
          description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["skills"]["Row"]>;
        Relationships: [];
      };
      skill_aliases: {
        Row: { id: string; skill_id: string; alias: string };
        Insert: { skill_id: string; alias: string };
        Update: Partial<Database["public"]["Tables"]["skill_aliases"]["Row"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          organization_id: string;
          student_profile_id: string;
          uploaded_by: string;
          title: string | null;
          issuing_organization: string | null;
          recipient_name: string | null;
          issue_date: string | null;
          expiration_date: string | null;
          credential_number: string | null;
          credential_url: string | null;
          storage_path: string;
          mime_type: string;
          file_size_bytes: number;
          content_hash: string;
          credential_fingerprint: string | null;
          pipeline_status: CertificatePipelineStatus;
          verification_status: VerificationStatus;
          extraction_metadata: Json;
          student_asserted: Json;
          independently_verified: Json;
          duplicate_of: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          student_profile_id: string;
          uploaded_by: string;
          storage_path: string;
          mime_type: string;
          file_size_bytes: number;
          content_hash: string;
          title?: string | null;
          issuing_organization?: string | null;
          recipient_name?: string | null;
          issue_date?: string | null;
          expiration_date?: string | null;
          credential_number?: string | null;
          credential_url?: string | null;
          credential_fingerprint?: string | null;
          pipeline_status?: CertificatePipelineStatus;
          verification_status?: VerificationStatus;
          extraction_metadata?: Json;
          student_asserted?: Json;
          independently_verified?: Json;
          duplicate_of?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Row"]>;
        Relationships: [];
      };
      certificate_extractions: {
        Row: {
          id: string;
          certificate_id: string;
          raw_text: string | null;
          structured: Json;
          provider: string | null;
          confidence: number | null;
          student_confirmed: boolean;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          certificate_id: string;
          raw_text?: string | null;
          structured?: Json;
          provider?: string | null;
          confidence?: number | null;
          student_confirmed?: boolean;
          confirmed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["certificate_extractions"]["Row"]>;
        Relationships: [];
      };
      credential_verifications: {
        Row: {
          id: string;
          certificate_id: string;
          method: string;
          status: VerificationStatus;
          evidence: Json;
          source: string | null;
          checked_at: string;
          reviewer_id: string | null;
          reviewer_notes: string | null;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          certificate_id: string;
          method: string;
          status: VerificationStatus;
          evidence?: Json;
          source?: string | null;
          reviewer_id?: string | null;
          reviewer_notes?: string | null;
          is_current?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["credential_verifications"]["Row"]>;
        Relationships: [];
      };
      verification_events: {
        Row: {
          id: string;
          certificate_id: string;
          verification_id: string | null;
          event_type: string;
          actor_id: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          certificate_id: string;
          event_type: string;
          verification_id?: string | null;
          actor_id?: string | null;
          payload?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["verification_events"]["Row"]>;
        Relationships: [];
      };
      student_skills: {
        Row: {
          id: string;
          student_profile_id: string;
          skill_id: string;
          strongest_evidence: EvidenceSource;
          evidence_count: number;
          last_evidenced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          student_profile_id: string;
          skill_id: string;
          strongest_evidence?: EvidenceSource;
          evidence_count?: number;
          last_evidenced_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["student_skills"]["Row"]>;
        Relationships: [];
      };
      skill_evidence: {
        Row: {
          id: string;
          student_skill_id: string;
          source_type: EvidenceSource;
          certificate_id: string | null;
          project_id: string | null;
          assessment_result_id: string | null;
          status: VerificationStatus | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          student_skill_id: string;
          source_type: EvidenceSource;
          certificate_id?: string | null;
          project_id?: string | null;
          assessment_result_id?: string | null;
          status?: VerificationStatus | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["skill_evidence"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          student_profile_id: string;
          organization_id: string;
          title: string;
          description: string | null;
          url: string | null;
          started_on: string | null;
          completed_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          student_profile_id: string;
          organization_id: string;
          title: string;
          description?: string | null;
          url?: string | null;
          started_on?: string | null;
          completed_on?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      project_skills: {
        Row: { project_id: string; skill_id: string };
        Insert: { project_id: string; skill_id: string };
        Update: Partial<Database["public"]["Tables"]["project_skills"]["Row"]>;
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          skill_id: string | null;
          scoring_methodology: string;
          max_score: number;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          title: string;
          skill_id?: string | null;
          scoring_methodology?: string;
          max_score?: number;
        };
        Update: Partial<Database["public"]["Tables"]["assessments"]["Row"]>;
        Relationships: [];
      };
      assessment_results: {
        Row: {
          id: string;
          assessment_id: string;
          student_profile_id: string;
          score: number;
          completed_at: string;
          metadata: Json;
        };
        Insert: {
          assessment_id: string;
          student_profile_id: string;
          score: number;
          completed_at?: string;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["assessment_results"]["Row"]>;
        Relationships: [];
      };
      job_roles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          version: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          description?: string | null;
          version?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["job_roles"]["Row"]>;
        Relationships: [];
      };
      job_role_requirements: {
        Row: {
          id: string;
          job_role_id: string;
          skill_id: string;
          weight: number;
          is_required: boolean;
        };
        Insert: {
          job_role_id: string;
          skill_id: string;
          weight?: number;
          is_required?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["job_role_requirements"]["Row"]>;
        Relationships: [];
      };
      passport_shares: {
        Row: {
          id: string;
          student_profile_id: string;
          token_hash: string;
          label: string | null;
          is_active: boolean;
          expires_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          student_profile_id: string;
          token_hash: string;
          label?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["passport_shares"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          body: string;
          link?: string | null;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          action: string;
          entity_type: string;
          organization_id?: string | null;
          actor_id?: string | null;
          entity_id?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
      processing_jobs: {
        Row: {
          id: string;
          organization_id: string;
          certificate_id: string | null;
          job_type: string;
          status: JobStatus;
          idempotency_key: string;
          attempts: number;
          max_attempts: number;
          locked_at: string | null;
          locked_by: string | null;
          run_after: string;
          last_error: string | null;
          payload: Json;
          result: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          job_type: string;
          idempotency_key: string;
          certificate_id?: string | null;
          status?: JobStatus;
          attempts?: number;
          max_attempts?: number;
          locked_at?: string | null;
          locked_by?: string | null;
          run_after?: string;
          last_error?: string | null;
          payload?: Json;
          result?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["processing_jobs"]["Row"]>;
        Relationships: [];
      };
      recruiter_shortlists: {
        Row: {
          id: string;
          recruiter_user_id: string;
          organization_id: string;
          student_profile_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          recruiter_user_id: string;
          organization_id: string;
          student_profile_id: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["recruiter_shortlists"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_member_of: { Args: { org_id: string }; Returns: boolean };
      has_role: { Args: { org_id: string; wanted: AppRole }; Returns: boolean };
      current_student_profile_id: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      app_role: AppRole;
      verification_status: VerificationStatus;
      evidence_source: EvidenceSource;
      job_status: JobStatus;
      certificate_pipeline_status: CertificatePipelineStatus;
      achievement_status: AchievementStatus;
      physical_stamp_status: PhysicalStampStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
