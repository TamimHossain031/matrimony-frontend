// Enum contracts mirrored from the Laravel backend (app/Enums/*).
// These are the single source of truth for every string/int the API accepts
// or returns. Keep them in lockstep with the backend enums.

export type Gender = 'male' | 'female';

export type MaritalStatus =
  | 'never_married'
  | 'divorced'
  | 'widowed'
  | 'separated';

export type AccountStatus = 'active' | 'hidden' | 'deactivated' | 'deleted';

// VerificationLevel is an integer on the backend (0..4).
export type VerificationLevel = 0 | 1 | 2 | 3 | 4;

export type Visibility =
  | 'public'
  | 'members_only'
  | 'accepted_connection'
  | 'private';

export type UserRole = 'user' | 'guardian' | 'moderator' | 'admin';

export type ProfileCreatedBy =
  | 'self'
  | 'parent'
  | 'sibling'
  | 'relative'
  | 'guardian';

export type Importance = 'deal_breaker' | 'nice_to_have';

export type ReportReason =
  | 'fake_profile'
  | 'harassment'
  | 'scam'
  | 'inappropriate_content'
  | 'misleading_information'
  | 'other';

export type PhotoModerationStatus = 'pending' | 'approved' | 'rejected';

export type ManagerRelationship = 'self' | 'parent' | 'sibling' | 'relative';

export type InterestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'expired'
  | 'disconnected';

export type PhotoRequestStatus = 'pending' | 'approved' | 'denied';

export type InterestAction = 'accept' | 'reject' | 'withdraw' | 'disconnect';

export type PhotoRequestAction = 'approve' | 'deny';

// Lifestyle blob values (validated on the backend).
export type LifestyleYesNo = 'no' | 'occasionally' | 'yes';
export type DietHabit = 'halal' | 'vegetarian' | 'vegan' | 'no_restriction';
export type FamilyType = 'nuclear' | 'joint';

// Partner-preference weight keys (D3 deal-breakers).
export type PreferenceKey =
  | 'age_range'
  | 'height_range'
  | 'religion'
  | 'education'
  | 'profession'
  | 'income'
  | 'district'
  | 'marital_status';

// Discovery sort options.
export type DiscoverySort = 'recent' | 'newest' | 'verification' | 'relevant';

// Notification types are open-ended on the backend; keep the known ones for
// mapping to icons/copy, but accept any string.
export type NotificationType =
  | 'interest_received'
  | 'interest_accepted'
  | 'interest_rejected'
  | 'photo_request'
  | 'photo_access_granted'
  | 'verification_approved'
  | 'message_received'
  | 'profile_shortlisted'
  | (string & {});
