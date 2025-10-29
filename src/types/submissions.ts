// TypeScript types for the user submission system

export type SubmissionType = 'new_legislation' | 'update_existing';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes';

export type LegislationType = 'ban' | 'restriction' | 'repealed' | 'unverified';

export interface SubmissionData {
  municipality: string;
  state: string;
  municipality_type: 'City' | 'County';
  banned_breeds: string[];
  ordinance: string;
  legislation_type: LegislationType;
  population?: number;
  lat?: number;
  lng?: number;
  verification_date?: string;
  ordinance_url?: string;
}

export interface Submission {
  id: string;
  user_id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  original_record_id?: string;
  submitted_data: SubmissionData;
  admin_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionDocument {
  id: string;
  submission_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface UserContributions {
  id: string;
  user_id: string;
  submission_count: number;
  approved_count: number;
  rejected_count: number;
  reputation_score: number;
  last_contribution?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionWithDetails extends Submission {
  documents?: SubmissionDocument[];
  user_profile?: {
    full_name?: string;
    email: string;
  };
  reviewer_profile?: {
    full_name?: string;
    email: string;
  };
  original_legislation?: {
    id: string;
    municipality: string;
    state: string;
    type: string;
  };
}

export interface SubmissionStats {
  total_submissions: number;
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  needs_changes_submissions: number;
  avg_review_time_hours?: number;
}

export interface SubmissionFormData {
  // Step 1: Type selection
  type: SubmissionType;
  original_record_id?: string;

  // Step 2: Location
  state: string;
  municipality: string;
  municipality_type: 'City' | 'County';

  // Step 3: Legislation details
  ordinance: string;
  banned_breeds: string[];
  legislation_type: LegislationType;
  population?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Step 4: Sources and documents
  ordinance_url?: string;
  additional_sources?: string[];
  documents?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  verification_date?: string;

  // Step 5: Review
  terms_accepted?: boolean;
  
  // Internal validation state
  _reviewStepValid?: boolean;
}

export interface DuplicateCheckResult {
  is_duplicate: boolean;
  similar_records: Array<{
    id: string;
    municipality: string;
    state: string;
    similarity_score: number;
    banned_breeds: string[];
  }>;
}

export interface SubmissionValidationError {
  field: string;
  message: string;
}

export interface SubmissionValidationResult {
  is_valid: boolean;
  errors: SubmissionValidationError[];
  warnings?: string[];
}