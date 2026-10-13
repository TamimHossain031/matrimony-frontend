'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Heart,
  Send,
  Wand2,
  CheckCircle,
  Eye,
  Edit3,
  Layers,
  Music,
} from 'lucide-react';
import { useGreetingTemplates, useCreateGreetingCard } from '@/features/greetings/hooks';
import { getTemplateImageUrl } from '@/features/greetings/utils';
import { CardThemeRenderer } from './CardThemeRenderer';
import { EnvelopeExperience } from './EnvelopeExperience';
import { SharePanel } from './SharePanel';
import { MuiSelect, MenuItem, ListSubheader } from '@/components/ui/MuiSelect';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type {
  GreetingTemplate,
  OccasionKey,
  ThemeSettings,
  CreateGreetingCardResponse,
  GreetingFontFamily,
} from '@/types/greetings';

export interface FontStyleOption {
  id: GreetingFontFamily;
  name: string;
  vibe: string;
  category: 'Serif & Luxury' | 'Royal & Classical' | 'Script & Calligraphy' | 'Handwritten' | 'Modern & Clean' | 'Heritage';
  fontClass: string;
  previewText: string;
}

export const FONT_STYLE_OPTIONS: FontStyleOption[] = [
  {
    id: 'serif',
    name: 'Playfair Luxe',
    vibe: 'Editorial Serif',
    category: 'Serif & Luxury',
    fontClass: 'font-greeting-serif',
    previewText: 'Eternal Vows',
  },
  {
    id: 'cinzel',
    name: 'Cinzel Imperial',
    vibe: 'Regal Roman',
    category: 'Royal & Classical',
    fontClass: 'font-greeting-cinzel',
    previewText: 'ETERNAL VOWS',
  },
  {
    id: 'cinzel-dec',
    name: 'Cinzel Decorative',
    vibe: 'Grand Ornate',
    category: 'Royal & Classical',
    fontClass: 'font-greeting-cinzel-dec',
    previewText: 'ETERNAL VOWS',
  },
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    vibe: 'Poetic Vintage',
    category: 'Serif & Luxury',
    fontClass: 'font-greeting-cormorant',
    previewText: 'Eternal Vows',
  },
  {
    id: 'calligraphy',
    name: 'Great Vibes',
    vibe: 'Flourished Calligraphy',
    category: 'Script & Calligraphy',
    fontClass: 'font-greeting-calligraphy',
    previewText: 'Eternal Vows',
  },
  {
    id: 'script',
    name: 'Dancing Script',
    vibe: 'Romantic Cursive',
    category: 'Script & Calligraphy',
    fontClass: 'font-greeting-script',
    previewText: 'Eternal Vows',
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush',
    vibe: 'Graceful Signature',
    category: 'Script & Calligraphy',
    fontClass: 'font-greeting-alex',
    previewText: 'Eternal Vows',
  },
  {
    id: 'handwriting',
    name: 'Caveat Note',
    vibe: 'Heartfelt Love Note',
    category: 'Handwritten',
    fontClass: 'font-greeting-handwriting',
    previewText: 'Eternal Vows',
  },
  {
    id: 'montserrat',
    name: 'Montserrat Geometric',
    vibe: 'Sleek Chic Sans',
    category: 'Modern & Clean',
    fontClass: 'font-greeting-montserrat',
    previewText: 'ETERNAL VOWS',
  },
  {
    id: 'sans',
    name: 'Inter Modern',
    vibe: 'Clean Minimalist',
    category: 'Modern & Clean',
    fontClass: 'font-greeting-sans',
    previewText: 'Eternal Vows',
  },
  {
    id: 'traditional',
    name: 'Tiro Bangla',
    vibe: 'Heritage Royal বাংলা',
    category: 'Heritage',
    fontClass: 'font-greeting-traditional',
    previewText: 'চিরন্তন বন্ধন',
  },
];

const OCCASIONS: { key: OccasionKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All Designs', icon: '✨' },
  { key: 'wedding', label: 'Wedding & Nikkah', icon: '💍' },
  { key: 'anniversary', label: 'Anniversary', icon: '🥂' },
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'eid', label: 'Eid & Festive', icon: '🌙' },
  { key: 'congratulations', label: 'Congratulations', icon: '🏆' },
  { key: 'thankyou', label: 'Thank You', icon: '🌿' },
  { key: 'love', label: 'Love & Romance', icon: '💖' },
];

const INSPIRATIONS: Record<string, string[]> = {
  wedding: [
    'Wishing you a lifetime of love, joy, and blessed companionship! May this new chapter bring endless smiles, harmony, and peace.',
    'Congratulations on your Nikkah! May Allah bless your union, deepen your affection, and grant you a blissful journey together.',
    'Two hearts, one beautiful destiny. Wishing you the warmest congratulations on your wedding day!',
  ],
  anniversary: [
    'Happy Anniversary! Watching your love, patience, and companionship grow year after year is a true inspiration to us all.',
    'May the love you share continue to grow deeper, stronger, and more luminous with every passing season. Cheers to you both!',
  ],
  birthday: [
    'Wishing you a very happy birthday filled with radiant laughter, good health, and dreams fulfilled! Have a blessed year ahead.',
    'Cheers to another wonderful year around the sun! May this year bring unexpected wonders, great joy, and prosperity.',
  ],
  eid: [
    'Eid Mubarak! May divine blessings illuminate your life with peace, contentment, good health, and joyful moments with family.',
    'Warmest Eid greetings to you and your loved ones! Wishing you peace, prosperity, and unending celebration.',
  ],
  congratulations: [
    'Heartfelt congratulations on this remarkable milestone! Your hard work and dedication truly shine. Wishing you continued success.',
    'So proud of your incredible achievement! May this victory be the beginning of even greater triumphs.',
  ],
  thankyou: [
    'Thank you from the bottom of my heart for your kindness, encouragement, and generosity. You have made a world of difference.',
    'Deepest gratitude for being there with such warmth and grace. Thank you for everything you do!',
  ],
  love: [
    'Every single day with you is a treasure. Thank you for your kindness, your laughter, and the warmth you bring into my world.',
    'No matter where life leads, my heart is always home with you. Forever grateful for your love and presence.',
  ],
};

export function GreetingCreator() {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');

  const [selectedOccasion, setSelectedOccasion] = useState<OccasionKey>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [customFontFamily, setCustomFontFamily] = useState<GreetingFontFamily | null>(null);
  const [customParticleType, setCustomParticleType] = useState<ThemeSettings['particleType'] | null>(null);
  const [soundTheme, setSoundTheme] = useState<ThemeSettings['soundTheme']>('celebration');

  // Preview Mode: 'card' or 'envelope'
  const [previewMode, setPreviewMode] = useState<'card' | 'envelope'>('card');

  // Published Result State
  const [publishedResult, setPublishedResult] = useState<CreateGreetingCardResponse | null>(null);

  const { data: templates = [], isLoading: isLoadingTemplates } = useGreetingTemplates(
    selectedOccasion === 'all' ? undefined : selectedOccasion
  );

  const createMutation = useCreateGreetingCard();

  // If template query param is provided (e.g. ?template=eternal-vows), match by slug or id
  const queryMatchedTemplate = useMemo(() => {
    if (!templates.length || !templateParam) return undefined;
    const lower = templateParam.toLowerCase().trim();
    return templates.find(
      (t) => t.slug.toLowerCase() === lower || String(t.id) === lower
    );
  }, [templates, templateParam]);

  // Active selected template
  const activeTemplate: GreetingTemplate | undefined = useMemo(() => {
    if (!templates.length) return undefined;
    if (selectedTemplateId) {
      const found = templates.find((t) => t.id === selectedTemplateId);
      if (found) return found;
    }
    if (queryMatchedTemplate) {
      return queryMatchedTemplate;
    }
    return templates[0];
  }, [templates, selectedTemplateId, queryMatchedTemplate]);

  const fontFamily: GreetingFontFamily =
    (customFontFamily ?? (activeTemplate?.design_config.fontFamily as GreetingFontFamily) ?? 'serif');
  const particleType = customParticleType ?? activeTemplate?.design_config.particleType ?? 'golden_stars';

  const handleInspirationPick = (text: string) => {
    setMessage(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate || !recipientName.trim() || !message.trim()) return;

    try {
      const res = await createMutation.mutateAsync({
        template_id: activeTemplate.id,
        recipient_name: recipientName.trim(),
        sender_name: senderName.trim() || null,
        title: title.trim() || null,
        message: message.trim(),
        theme_settings: {
          fontFamily,
          particleType,
          soundTheme,
        },
      });

      // Save to local storage for creator management
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('shondhan_my_cards') || '[]');
        stored.unshift({
          public_id: res.public_id,
          edit_token: res.edit_token,
          share_url: res.share_url,
          recipient_name: recipientName.trim(),
          occasion: activeTemplate.occasion,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('shondhan_my_cards', JSON.stringify(stored.slice(0, 50)));
      }

      setPublishedResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Error handled by mutation state
    }
  };

  if (publishedResult) {
    return (
      <div className="creator-success-container">
        <SharePanel
          shareUrl={publishedResult.share_url}
          recipientName={recipientName}
          className="mb-6"
        />

        <div className="card card-pad mt-4">
          <div className="row between mb-4">
            <h3 style={{ margin: 0 }}>Card Preview</h3>
            <button
              type="button"
              onClick={() => {
                setPublishedResult(null);
                setRecipientName('');
                setMessage('');
                setTitle('');
              }}
              className="btn btn-ghost btn-sm"
            >
              <Edit3 size={15} /> Create Another Card
            </button>
          </div>

          {activeTemplate && (
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <EnvelopeExperience
                template={activeTemplate}
                recipientName={recipientName}
                senderName={senderName}
                title={title}
                message={message}
                themeSettings={{ fontFamily, particleType, soundTheme }}
                initialOpen={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentOccasionInspirations =
    activeTemplate && INSPIRATIONS[activeTemplate.occasion]
      ? INSPIRATIONS[activeTemplate.occasion]
      : INSPIRATIONS.wedding;

  return (
    <div className="creator-studio-layout">
      {/* LEFT: DESIGN & PERSONALIZATION CONTROLS */}
      <div className="creator-controls-column">
        {/* Step 1: Occasion Tabs */}
        <ScrollReveal animation="fade-up">
          <div className="creator-step-card card card-pad">
            <div className="section-title">Step 1 — Choose Occasion</div>
            <div className="occasion-pill-scroller" data-lenis-prevent>
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.key}
                  type="button"
                  onClick={() => setSelectedOccasion(occ.key)}
                  className={`occasion-pill ${selectedOccasion === occ.key ? 'selected' : ''}`}
                >
                  <span>{occ.icon}</span>
                  <span>{occ.label}</span>
                </button>
              ))}
            </div>

            {/* Template Gallery */}
            <div className="section-title mt-4">Select Card Design</div>
            {isLoadingTemplates ? (
              <div className="state">
                <div className="spinner" />
                <p className="small muted">Loading templates...</p>
              </div>
            ) : (
              <div className="template-thumbnails-grid">
                {templates.map((tpl) => {
                  const isSelected = activeTemplate?.id === tpl.id;
                  const cfg = tpl.design_config;
                  const thumbImg = getTemplateImageUrl(tpl);
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setCustomFontFamily(null);
                        setCustomParticleType(null);
                      }}
                      className={`template-thumb-card ${isSelected ? 'active' : ''}`}
                      style={{
                        borderColor: isSelected ? cfg.primaryColor : 'var(--rule)',
                        boxShadow: isSelected ? `0 0 0 2px ${cfg.primaryColor}` : undefined,
                      }}
                    >
                      <div
                        className="thumb-color-preview"
                        style={{ background: cfg.bgGradient }}
                      >
                        {thumbImg ? (
                          <img
                            src={thumbImg}
                            alt={tpl.name}
                            className="thumb-image"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="thumb-badge">{cfg.badge.split(' ')[0]}</span>
                        )}
                      </div>
                      <div className="thumb-meta">
                        <div className="thumb-name">{tpl.name}</div>
                        <div className="thumb-desc">{tpl.description}</div>
                      </div>
                      {isSelected && (
                        <div
                          className="thumb-check-icon"
                          style={{ backgroundColor: cfg.primaryColor }}
                        >
                          <CheckCircle size={14} color="#ffffff" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Step 2: Personalization Details */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="creator-step-card card card-pad mt-4">
          <div className="section-title">Step 2 — Personalize Your Greeting</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="recipient-name">
                Recipient Name <span className="req">*</span>
              </label>
              <input
                id="recipient-name"
                type="text"
                required
                maxLength={100}
                placeholder="e.g., Ayesha & Farhan, Mom, Sarah"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="input"
              />
              <span className="field-hint">Whom is this special greeting for?</span>
            </div>

            <div className="field">
              <label className="label" htmlFor="card-title">
                Greeting Headline <span className="faint">(Optional)</span>
              </label>
              <input
                id="card-title"
                type="text"
                maxLength={150}
                placeholder="e.g., Wishing You Endless Bliss!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
              />
            </div>

            <div className="field">
              <div className="row between">
                <label className="label" htmlFor="card-message">
                  Personal Message <span className="req">*</span>
                </label>
                <span className="tiny faint">{message.length}/2500</span>
              </div>
              <textarea
                id="card-message"
                required
                maxLength={2500}
                rows={4}
                placeholder="Write your heartfelt message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea"
                data-lenis-prevent
              />
            </div>

            {/* 1-Click Message Inspiration Suggestions */}
            <div className="inspiration-container mb-4">
              <div className="row gap-1 faint tiny mb-2">
                <Wand2 size={13} className="txt-marigold" />
                <span>1-Click Message Prompts:</span>
              </div>
              <div className="inspiration-chips" data-lenis-prevent>
                {currentOccasionInspirations.map((txt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInspirationPick(txt)}
                    className="inspiration-chip"
                  >
                    &ldquo;{txt.slice(0, 52)}...&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="sender-name">
                Your Name / Sender <span className="faint">(Optional)</span>
              </label>
              <input
                id="sender-name"
                type="text"
                maxLength={100}
                placeholder="e.g., Tamim & family, A secret admirer"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="input"
              />
            </div>

            {/* Custom Styling Controls */}
            <div className="section-title mt-4">Card Style &amp; Effects</div>

            {/* Enhanced Font Style Visual Selector */}
            <div className="font-selector-section mb-4">
              <div className="row between align-center mb-2">
                <label className="label" style={{ margin: 0 }}>
                  <Layers size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Typography &amp; Font Style ({FONT_STYLE_OPTIONS.length} Styles)
                </label>
                <span className="tiny faint">
                  Selected:{' '}
                  <strong style={{ color: activeTemplate?.design_config.primaryColor }}>
                    {FONT_STYLE_OPTIONS.find((f) => f.id === fontFamily)?.name || fontFamily}
                  </strong>
                </span>
              </div>

              {/* Visual Font Style Preview Cards */}
              <div className="font-style-pill-grid" data-lenis-prevent>
                {FONT_STYLE_OPTIONS.map((opt) => {
                  const isSelected = fontFamily === opt.id;
                  const primaryCol = activeTemplate?.design_config.primaryColor || 'var(--leaf)';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCustomFontFamily(opt.id)}
                      className={`font-style-pill ${isSelected ? 'active' : ''}`}
                      style={{
                        borderColor: isSelected ? primaryCol : undefined,
                        boxShadow: isSelected ? `0 0 0 2px ${primaryCol}44` : undefined,
                      }}
                      title={`${opt.name} (${opt.vibe})`}
                    >
                      <span className={`font-pill-sample ${opt.fontClass}`}>
                        {opt.previewText}
                      </span>
                      <span className="font-pill-meta">
                        <span className="font-pill-name">{opt.name}</span>
                        <span className="font-pill-vibe">{opt.vibe}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Select Dropdown for accessibility and fast pick */}
              <div className="mt-2">
                <MuiSelect
                  value={fontFamily}
                  onChange={(e) => setCustomFontFamily(e.target.value as GreetingFontFamily)}
                  size="small"
                  fullWidth
                  aria-label="Select typography style"
                >
                  <ListSubheader>Serif &amp; Luxury</ListSubheader>
                  <MenuItem value="serif">Playfair Luxe (Editorial Serif)</MenuItem>
                  <MenuItem value="cormorant">Cormorant Garamond (Poetic Vintage)</MenuItem>

                  <ListSubheader>Royal &amp; Classical</ListSubheader>
                  <MenuItem value="cinzel">Cinzel Imperial (Regal Roman)</MenuItem>
                  <MenuItem value="cinzel-dec">Cinzel Decorative (Grand Ornate)</MenuItem>

                  <ListSubheader>Script &amp; Calligraphy</ListSubheader>
                  <MenuItem value="calligraphy">Great Vibes (Flourished Calligraphy)</MenuItem>
                  <MenuItem value="script">Dancing Script (Romantic Cursive)</MenuItem>
                  <MenuItem value="alex-brush">Alex Brush (Graceful Signature)</MenuItem>

                  <ListSubheader>Handwritten</ListSubheader>
                  <MenuItem value="handwriting">Caveat Note (Personal Love Note)</MenuItem>

                  <ListSubheader>Modern &amp; Minimalist</ListSubheader>
                  <MenuItem value="montserrat">Montserrat (Sleek Geometric)</MenuItem>
                  <MenuItem value="sans">Inter Modern (Clean Minimalist)</MenuItem>

                  <ListSubheader>Heritage</ListSubheader>
                  <MenuItem value="traditional">Tiro Bangla (Heritage Royal বাংলা)</MenuItem>
                </MuiSelect>
              </div>
            </div>

            <div className="row wrap gap-3 mb-4">
              <div className="grow" style={{ minWidth: 160 }}>
                <label className="label">
                  <Sparkles size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Magic Effects
                </label>
                <MuiSelect
                  value={particleType}
                  onChange={(e) => setCustomParticleType(e.target.value as ThemeSettings['particleType'])}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="golden_stars">✨ Golden Stars</MenuItem>
                  <MenuItem value="rose_petals">🌹 Rose Petals</MenuItem>
                  <MenuItem value="confetti">🎉 Party Confetti</MenuItem>
                  <MenuItem value="floating_hearts">💖 Floating Hearts</MenuItem>
                  <MenuItem value="sparkles">🌟 Shimmering Dust</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </MuiSelect>
              </div>

              <div className="grow" style={{ minWidth: 160 }}>
                <label className="label">
                  <Music size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Celebration Melody
                </label>
                <MuiSelect
                  value={soundTheme}
                  onChange={(e) => setSoundTheme(e.target.value as ThemeSettings['soundTheme'])}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="celebration">🎺 Celebration Fanfare</MenuItem>
                  <MenuItem value="romantic_harp">🎻 Romantic Harp</MenuItem>
                  <MenuItem value="festive_bells">🔔 Festive Bells</MenuItem>
                  <MenuItem value="gentle_piano">🎹 Gentle Piano</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </MuiSelect>
              </div>
            </div>

            {createMutation.isError && (
              <div className="field-error mb-4">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Failed to publish card. Please try again.'}
              </div>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending || !recipientName.trim() || !message.trim()}
              className="btn btn-primary btn-lg btn-block"
            >
              {createMutation.isPending ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                  <span>Generating Unique Share Link...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Publish & Get Share Link</span>
                </>
              )}
            </button>
            <p className="tiny muted text-center mt-2" style={{ margin: '8px 0 0' }}>
              No email required. You will receive an instant link to copy and share worldwide.
            </p>
          </form>
        </div>
      </ScrollReveal>
    </div>

      {/* RIGHT: LIVE INTERACTIVE PREVIEW */}
      <div className="creator-preview-column">
        <div className="preview-sticky-box">
          <div className="row between mb-2">
            <span className="section-title" style={{ margin: 0 }}>
              Live Real-Time Preview
            </span>
            <div className="row gap-1">
              <button
                type="button"
                onClick={() => setPreviewMode('card')}
                className={`btn btn-sm ${previewMode === 'card' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Eye size={14} /> Open Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('envelope')}
                className={`btn btn-sm ${previewMode === 'envelope' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Heart size={14} /> Envelope View
              </button>
            </div>
          </div>

          {activeTemplate ? (
            <div className="preview-viewport-card">
              {previewMode === 'card' ? (
                <div
                  className="preview-card-wrap"
                  style={{ background: activeTemplate.design_config.bgGradient }}
                >
                  <CardThemeRenderer
                    template={activeTemplate}
                    recipientName={recipientName}
                    senderName={senderName}
                    title={title}
                    message={message}
                    themeSettings={{ fontFamily, particleType, soundTheme }}
                    isInteractivePreview={true}
                  />
                </div>
              ) : (
                <div style={{ minHeight: 460 }}>
                  <EnvelopeExperience
                    template={activeTemplate}
                    recipientName={recipientName}
                    senderName={senderName}
                    title={title}
                    message={message}
                    themeSettings={{ fontFamily, particleType, soundTheme }}
                    initialOpen={false}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
