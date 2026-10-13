export type OccasionKey =
  | 'all'
  | 'wedding'
  | 'anniversary'
  | 'birthday'
  | 'eid'
  | 'congratulations'
  | 'thankyou'
  | 'love';

export type GreetingFontFamily =
  | 'serif'
  | 'cinzel'
  | 'cinzel-dec'
  | 'cormorant'
  | 'calligraphy'
  | 'script'
  | 'alex-brush'
  | 'handwriting'
  | 'montserrat'
  | 'sans'
  | 'traditional';

export interface TemplateDesignConfig {
  themeId: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  borderStyle: 'double' | 'ornate' | 'floral' | 'arabesque' | 'solid';
  borderColor: string;
  fontFamily: GreetingFontFamily | string;
  particleType: 'golden_stars' | 'rose_petals' | 'sparkles' | 'confetti' | 'floating_hearts';
  sealColor: string;
  badge: string;
  icon?: string;
}

export interface GreetingTemplate {
  id: number;
  name: string;
  slug: string;
  occasion: string;
  description: string | null;
  thumbnail_path: string | null;
  thumbnail_url?: string | null;
  design_config: TemplateDesignConfig;
  sort_order: number;
}

export interface ThemeSettings {
  fontFamily?: GreetingFontFamily | string;
  particleType?: 'golden_stars' | 'rose_petals' | 'sparkles' | 'confetti' | 'floating_hearts' | 'none';
  soundTheme?: 'celebration' | 'romantic_harp' | 'festive_bells' | 'gentle_piano' | 'none';
  customAccentColor?: string;
}

export interface GreetingCard {
  public_id: string;
  occasion: string;
  recipient_name: string;
  sender_name: string | null;
  title: string | null;
  message: string;
  theme_settings: ThemeSettings | null;
  status: 'published' | 'disabled' | 'deleted' | 'draft';
  views_count: number;
  shares_count: number;
  reactions_count: number;
  published_at: string | null;
  template: GreetingTemplate;
}

export interface CreateGreetingCardPayload {
  template_id: number;
  recipient_name: string;
  sender_name?: string | null;
  title?: string | null;
  message: string;
  theme_settings?: ThemeSettings | null;
  privacy?: 'public_link' | 'protected';
}

export interface CreateGreetingCardResponse {
  message: string;
  data: GreetingCard;
  edit_token: string;
  public_id: string;
  share_url: string;
}

export interface EngagementResponse {
  success: boolean;
  shares_count: number;
  reactions_count: number;
  views_count: number;
}
