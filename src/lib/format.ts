import type {
  MaritalStatus,
  InterestStatus,
  PreferenceKey,
  ReportReason,
  DietHabit,
  LifestyleYesNo,
  FamilyType,
  Gender,
} from '@/types/enums';

export function cmToFeet(cm: number | null | undefined): string {
  if (!cm) return '—';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}′ ${inches}″`;
}

export function heightWithCm(cm: number | null | undefined): string {
  if (!cm) return '—';
  return `${cmToFeet(cm)} (${cm} cm)`;
}

export function formatIncomeRange(range: [number | null, number | null] | undefined): string {
  if (!range) return 'Not specified';
  const [min, max] = range;
  if (min == null && max == null) return 'Not specified';
  const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`;
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} / month`;
  if (min != null) return `${fmt(min)}+ / month`;
  return `up to ${fmt(max as number)} / month`;
}

export const MARITAL_LABELS: Record<MaritalStatus, string> = {
  never_married: 'Never married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  separated: 'Separated',
};

export const INTEREST_STATUS_LABELS: Record<InterestStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Declined',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
  disconnected: 'Disconnected',
};

export const PREFERENCE_KEY_LABELS: Record<PreferenceKey, string> = {
  age_range: 'Age',
  height_range: 'Height',
  religion: 'Religion',
  education: 'Education',
  profession: 'Profession',
  income: 'Income',
  district: 'Location',
  marital_status: 'Marital status',
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fake_profile: 'Fake profile',
  harassment: 'Harassment',
  scam: 'Scam or fraud',
  inappropriate_content: 'Inappropriate content',
  misleading_information: 'Misleading information',
  other: 'Other',
};

export const DIET_LABELS: Record<DietHabit, string> = {
  halal: 'Halal',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  no_restriction: 'No restriction',
};

export const YESNO_LABELS: Record<LifestyleYesNo, string> = {
  no: 'No',
  occasionally: 'Occasionally',
  yes: 'Yes',
};

export const FAMILY_TYPE_LABELS: Record<FamilyType, string> = {
  nuclear: 'Nuclear family',
  joint: 'Joint family',
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
};

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function clockTime(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
