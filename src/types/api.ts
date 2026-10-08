// Request/response envelopes mirrored from the Laravel API.

import {
  User,
  Profile,
  MatchBreakdown,
  DiscoveryFilters,
} from './models';
import {
  Gender,
  ProfileCreatedBy,
  MaritalStatus,
  FamilyType,
  LifestyleYesNo,
  DietHabit,
  Importance,
  PreferenceKey,
  Visibility,
  ReportReason,
} from './enums';

// Single resource. Discovery `show` adds a sibling `match` key.
export interface ApiResource<T> {
  data: T;
}

// Cursor-paginated collection. Some endpoints add extra sibling keys
// (e.g. notifications add `unread_count`).
export interface ApiCollection<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

// Laravel validation error body.
export interface ApiErrorShape {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// ---- Auth ------------------------------------------------------------------

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
  gender: Gender;
  profile_created_by: ProfileCreatedBy;
  terms_accepted: boolean;
  device_name?: string;
}

export interface LoginRequest {
  login: string; // email or phone
  password: string;
  device_name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// ---- Profile ---------------------------------------------------------------

export interface ProfileInput {
  full_name_en?: string;
  full_name_bn?: string | null;
  height_cm?: number | null;
  marital_status?: MaritalStatus | null;
  district_id?: number | null;
  upazila_id?: number | null;
  nationality?: string | null;
  headline?: string | null;
  about?: string | null;
  religion_id?: number | null;
  education_level_id?: number | null;
  institution?: string | null;
  subject?: string | null;
  graduation_year?: number | null;
  profession_id?: number | null;
  job_title?: string | null;
  organization?: string | null;
  income_min?: number | null;
  income_max?: number | null;
  work_location?: string | null;
  father_occupation?: string | null;
  mother_occupation?: string | null;
  siblings_count?: number | null;
  family_type?: FamilyType | null;
  family_location?: string | null;
  family_description?: string | null;
  lifestyle?: {
    smoking?: LifestyleYesNo;
    drinking?: LifestyleYesNo;
    diet?: DietHabit;
    hobbies?: string[];
    languages?: string[];
  } | null;
  religion_attributes?: Record<string, string>;
}

// ---- Preferences -----------------------------------------------------------

export interface PreferenceInput {
  age_min?: number | null;
  age_max?: number | null;
  height_min_cm?: number | null;
  height_max_cm?: number | null;
  marital_statuses?: MaritalStatus[] | null;
  religion_id?: number | null;
  min_education_level_id?: number | null;
  profession_ids?: number[] | null;
  income_min?: number | null;
  district_ids?: number[] | null;
  other_expectations?: string | null;
  weights?: { preference_key: PreferenceKey; importance: Importance }[];
}

// ---- Interests -------------------------------------------------------------

export interface SendInterestRequest {
  profile_id: string; // public_id
  message?: string;
}

// ---- Shortlist / safety ----------------------------------------------------

export interface ShortlistRequest {
  profile_id: string;
  note?: string;
}

export interface ReportRequest {
  profile_id: string;
  reason: ReportReason;
  details?: string;
}

export interface ContactBlockRequest {
  phones: string[];
  label?: string;
}

export interface PhotoUploadMeta {
  visibility?: Visibility;
}

// Re-exports so feature code can import request + filter shapes from one place.
export type { DiscoveryFilters, Profile, MatchBreakdown };
