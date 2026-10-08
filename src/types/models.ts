// Domain models mirrored from the Laravel API Resources (app/Http/Resources/*).
// Field names and nesting match the JSON the backend actually emits.

import {
  Gender,
  MaritalStatus,
  VerificationLevel,
  UserRole,
  AccountStatus,
  ProfileCreatedBy,
  InterestStatus,
  PhotoModerationStatus,
  ManagerRelationship,
  Importance,
  PreferenceKey,
  DietHabit,
  LifestyleYesNo,
  FamilyType,
  DiscoverySort,
  NotificationType,
} from './enums';

// ---- Lookups (LookupController) -------------------------------------------

export interface LookupItem {
  id: number;
  key?: string;
  name_en: string;
  name_bn: string | null;
  parent_id?: number | null;
  rank?: number;
}

// ---- User (UserResource) --------------------------------------------------

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  gender: Gender;
  date_of_birth: string | null;
  age: number | null;
  profile_created_by: ProfileCreatedBy;
  email_verified: boolean;
  phone_verified: boolean;
  has_profile?: boolean | null;
}

// ---- Photos (ProfilePhotoResource) ----------------------------------------

export interface ProfilePhoto {
  id: number;
  is_primary: boolean;
  position: number;
  moderation_status: PhotoModerationStatus | null;
  blurred: boolean;
  url: string | null;
}

// ---- Match breakdown (MatchingService::evaluate) --------------------------

export interface MatchCriterion {
  key: PreferenceKey;
  label: string;
  importance: Importance;
  preferred: string | null;
  candidate_value: string | null;
}

export interface MatchBreakdown {
  score: number;
  must_haves_total: number;
  must_haves_met: number;
  met: MatchCriterion[];
  missed: MatchCriterion[];
}

// ---- Profile card (ProfileCardResource) -----------------------------------

export interface ProfileCardPhoto {
  id: number;
  visibility: string;
  moderation_status: string;
}

export interface ProfileCard {
  public_id: string;
  name: string; // initials until there's a connection
  age: number | null;
  gender: Gender | null;
  district?: string | null;
  profession?: string | null;
  education?: string | null;
  headline: string | null;
  verification_level: VerificationLevel;
  has_photo: boolean;
  primary_photo?: ProfileCardPhoto | null;
  match?: MatchBreakdown;
}

// ---- Full profile (ProfileResource) ---------------------------------------

export interface ProfileEducationHistory {
  id?: number;
  institution?: string | null;
  degree?: string | null;
  subject?: string | null;
  graduation_year?: number | null;
}

export interface ProfileLifestyle {
  smoking?: LifestyleYesNo;
  drinking?: LifestyleYesNo;
  diet?: DietHabit;
  hobbies?: string[];
  languages?: string[];
}

export interface ProfileManager {
  relationship: ManagerRelationship | null;
}

export interface Profile {
  public_id: string;
  is_owner: boolean;
  full_name_en: string;
  full_name_bn: string | null;
  gender: Gender | null;
  age: number | null;
  height_cm: number | null;
  marital_status: MaritalStatus | null;
  nationality: string | null;
  headline: string | null;
  about: string | null;
  completion_percent: number;
  verification_level: VerificationLevel;

  district?: LookupItem | null;
  upazila?: LookupItem | null;
  religion?: LookupItem | null;
  profession?: LookupItem | null;
  education_level?: LookupItem | null;

  education: {
    institution: string | null;
    subject: string | null;
    graduation_year: number | null;
    history?: ProfileEducationHistory[];
  };

  career: {
    job_title: string | null;
    organization: string | null;
    income_range: [number | null, number | null];
    work_location: string | null;
  };

  family: {
    father_occupation: string | null;
    mother_occupation: string | null;
    siblings_count: number | null;
    family_type: FamilyType | null;
    family_location: string | null;
    description: string | null;
  };

  lifestyle: ProfileLifestyle | null;
  religion_attributes?: Record<string, string>;
  managers?: ProfileManager[];
  contact?: { phone?: string; email?: string };
  photos?: ProfilePhoto[];
}

// ---- Partner preferences (PreferenceController::present) -------------------

export interface PreferenceWeight {
  preference_key: PreferenceKey;
  importance: Importance;
}

export interface PartnerPreference {
  age_range: [number | null, number | null];
  height_range_cm: [number | null, number | null];
  marital_statuses: MaritalStatus[] | null;
  religion_id: number | null;
  min_education_level_id: number | null;
  profession_ids: number[] | null;
  income_min: number | null;
  district_ids: number[] | null;
  other_expectations: string | null;
  weights: PreferenceWeight[];
}

// ---- Interests (InterestResource) -----------------------------------------

export interface Interest {
  id: number;
  status: InterestStatus;
  message: string | null;
  direction: 'sent' | 'received';
  counterpart: ProfileCard | null;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string | null;
}

// ---- Shortlist (ShortlistController) --------------------------------------

export interface ShortlistItem {
  note: string | null;
  profile: ProfileCard;
}

// ---- Messaging (ConversationController) ------------------------------------

export interface Conversation {
  id: number;
  other_user_id: number | null;
  is_closed: boolean;
  last_message_at: string | null;
}

export interface Message {
  id: number;
  sender_id: number;
  body: string;
  was_masked: boolean;
  read?: boolean;
  created_at: string | null;
}

// ---- Notifications (NotificationResource) ----------------------------------

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string | null;
}

// ---- Dashboard (DashboardController) ---------------------------------------

export interface DashboardSummary {
  profile_completion: number;
  missing_sections: string[];
  verification_level: VerificationLevel;
  new_interests: number;
  accepted_connections: number;
  shortlist_count: number;
  unread_notifications: number;
  recent_viewers: number;
}

// ---- Safety ----------------------------------------------------------------

export interface Block {
  user_id: number;
  name: string | null;
}

export interface ContactBlock {
  id: number;
  label: string | null;
  created_at: string | null;
}

// ---- Discovery filters (client-side shape; serialised to query params) -----

export interface DiscoveryFilters {
  gender?: Gender;
  age_min?: number;
  age_max?: number;
  district_id?: number;
  religion_id?: number;
  profession_id?: number;
  education_level_id?: number;
  marital_status?: MaritalStatus;
  height_min?: number;
  height_max?: number;
  income_min?: number;
  min_verification_level?: number;
  has_photo?: boolean;
  active_within_days?: number;
  sort?: DiscoverySort;
}
