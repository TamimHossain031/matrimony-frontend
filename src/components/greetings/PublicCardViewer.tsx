'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Share2,
  Copy,
  Check,
  Flag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { EnvelopeExperience } from './EnvelopeExperience';
import { SharePanel } from './SharePanel';
import {
  usePublicGreetingCard,
  useCardEngagement,
  useReportCard,
} from '@/features/greetings/hooks';
import { playReactionSound } from '@/lib/greetings/audio';
import { MuiSelect, MenuItem } from '@/components/ui/MuiSelect';
import { Logo } from '@/assets/logo';
import type { GreetingCard } from '@/types/greetings';

interface PublicCardViewerProps {
  publicId: string;
  initialCard?: GreetingCard | null;
}

export function PublicCardViewer({ publicId, initialCard }: PublicCardViewerProps) {
  const { data: card = initialCard, isLoading, isError, error } = usePublicGreetingCard(publicId);
  const engagementMutation = useCardEngagement();
  const reportMutation = useReportCard();

  const [hasCopied, setHasCopied] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate_content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reactionBurst, setReactionBurst] = useState(0);

  if (isLoading && !card) {
    return (
      <div className="viewer-state-screen">
        <div className="spinner" style={{ width: 44, height: 44 }} />
        <h3 className="mt-4">Opening your greeting card...</h3>
        <p className="muted small">Preparing your personalized celebration</p>
      </div>
    );
  }

  if (isError || !card) {
    const errorStatus =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status: number }).status
        : undefined;
    const isDeleted = errorStatus === 410 || errorStatus === 404;

    return (
      <div className="viewer-state-screen">
        <div className="card-error-box card card-pad text-center">
          <div className="state-icon" style={{ margin: '0 auto 16px', background: 'var(--rose-soft)', color: 'var(--rose)' }}>
            <Heart size={24} />
          </div>
          <h2>{isDeleted ? 'Greeting Card Unavailable' : 'Greeting Card Not Found'}</h2>
          <p className="muted small" style={{ maxWidth: '44ch', margin: '8px auto 24px' }}>
            {isDeleted
              ? 'This card has been removed or is no longer available. You can easily create a new one to celebrate someone special.'
              : 'The greeting link you followed could not be found. Check the URL or create a beautiful card of your own!'}
          </p>
          <Link href="/greetings/create" className="btn btn-primary btn-lg">
            <Sparkles size={18} /> Create a Greeting Card
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://tamim.com/${card.public_id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2200);
      engagementMutation.mutate({ publicId, eventType: 'copy_link' });
    } catch {
      // fallback
    }
  };

  const handleReaction = () => {
    setReactionBurst((prev) => prev + 1);
    playReactionSound();
    engagementMutation.mutate({ publicId, eventType: 'reaction_clicked' });
  };

  const handleOpenEnvelope = () => {
    // The card has been unsealed — reveal the inline share invitation.
    // (No engagement event here: opening is not a "create another" action.)
    setIsCardOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportMutation.mutateAsync({
        publicId,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSubmitted(true);
    } catch {
      // error handled in mutation
    }
  };

  return (
    <div className="public-card-viewer-layout">
      {/* Top Navbar */}
      <header className="viewer-top-navbar">
        <Link href="/" className="brand topbar-brand">
          <Logo size={100} />
         
        </Link>

        <div className="row gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-sm"
            title="Copy Card Link"
          >
            {hasCopied ? <Check size={14} className="txt-leaf" /> : <Copy size={14} />}
            <span className="hide-on-mobile">{hasCopied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="btn  btn-sm"
            title="Share Card"
          >
            <Share2 size={14} />
            <span className="hide-on-mobile">Share</span>
          </button>

          <Link href="/greetings/create" className="btn btn-primary btn-sm">
            <Sparkles size={14} />
            <span>Create a Card</span>
          </Link>
        </div>
      </header>

      {/* Main Experience Viewport */}
      <main className="viewer-main-content">
        <EnvelopeExperience
          template={card.template}
          recipientName={card.recipient_name}
          senderName={card.sender_name}
          title={card.title}
          message={card.message}
          themeSettings={card.theme_settings}
          initialOpen={false}
          onOpenCard={handleOpenEnvelope}
        />

        {/* Inline Share Invitation — the emotional payoff, appears once the card opens */}
        {isCardOpen && (
          <section className="share-invite animate-card-appear" aria-live="polite">
            <div className="share-invite-head">
              <h2 className="share-invite-title">
                Did this make you smile? <span>Send it to someone you love</span> 💌
              </h2>
              <p className="share-invite-sub">
                Free · no sign-up · takes 10 seconds
              </p>
            </div>
            <SharePanel
              variant="inline"
              shareUrl={shareUrl}
              recipientName={card.recipient_name}
              senderName={card.sender_name}
              onShareClick={(platform) =>
                engagementMutation.mutate({ publicId, eventType: 'share_clicked', referrerCategory: platform })
              }
              onCopyClick={() =>
                engagementMutation.mutate({ publicId, eventType: 'copy_link' })
              }
            />
          </section>
        )}
      </main>

      {/* Interactive Engagement Bar */}
      <section className="viewer-bottom-bar">
        <div className="container viewer-bottom-inner">
          {/* Reaction + quick share */}
          <div className="viewer-bottom-actions">
            <button
              type="button"
              onClick={handleReaction}
              className="btn btn-rose btn-reaction"
              aria-label="Send love reaction"
            >
              <Heart
                size={18}
                fill={card.reactions_count > 0 ? 'currentColor' : 'none'}
                className="heart-pop"
              />
              <span>Send Love ({card.reactions_count})</span>
              {reactionBurst > 0 && <span key={reactionBurst} className="reaction-floating-heart">💖</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="btn btn-share-quick"
            >
              <Share2 size={16} /> <span className="hide-on-mobile">Share Card</span>
            </button>
          </div>

          {/* High-Converting Viral CTA Loop */}
          <Link
            href="/greetings/create"
            onClick={() => engagementMutation.mutate({ publicId, eventType: 'create_another_clicked' })}
            className="btn btn-primary btn-viral-cta"
          >
            <Sparkles size={16} />
            <span>Make Someone Smile — Create Your Card</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer Branding & Safety */}
      <footer className="viewer-footer">
        <div className="container row between wrap gap-2">
          <div className="tiny muted">
            Delivered with care by <Link href="/" className="link">Shondhan Matrimony</Link> — No email required.
          </div>
          <div className="row gap-3">
            <Link href="/greetings" className="tiny link">Explore Designs</Link>
           
          </div>
        </div>
      </footer>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <strong>Send it to someone you love 💌</strong>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="btn btn-subtle btn-sm btn-icon"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <SharePanel
                variant="modal"
                shareUrl={shareUrl}
                recipientName={card.recipient_name}
                senderName={card.sender_name}
                onShareClick={(platform) =>
                  engagementMutation.mutate({ publicId, eventType: 'share_clicked', referrerCategory: platform })
                }
                onCopyClick={() =>
                  engagementMutation.mutate({ publicId, eventType: 'copy_link' })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Abuse Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <strong>Report Inappropriate Content</strong>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="btn btn-subtle btn-sm btn-icon"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {reportSubmitted ? (
                <div className="text-center py-4">
                  <div className="state-icon" style={{ margin: '0 auto 12px', background: 'var(--leaf-soft)', color: 'var(--leaf)' }}>
                    ✓
                  </div>
                  <h3>Thank you for reporting</h3>
                  <p className="muted small">
                    Our safety team will review this card promptly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportSubmitted(false);
                    }}
                    className="btn btn-primary mt-3"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit}>
                  <p className="muted small mb-3">
                    If this card contains harassment, spam, or unsafe material, let us know and
                    we will take action immediately.
                  </p>
                  <div className="field">
                    <label className="label">Reason</label>
                    <MuiSelect
                      value={reportReason}
                      onChange={(e) => setReportReason(String(e.target.value))}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="inappropriate_content">Inappropriate or offensive content</MenuItem>
                      <MenuItem value="harassment">Harassment or bullying</MenuItem>
                      <MenuItem value="spam">Spam or scam links</MenuItem>
                      <MenuItem value="privacy_violation">Privacy violation</MenuItem>
                    </MuiSelect>
                  </div>
                  <div className="field">
                    <label className="label">Additional details (optional)</label>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      className="textarea"
                      placeholder="Explain what is wrong with this card..."
                    />
                  </div>
                  <div className="row gap-2 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportMutation.isPending}
                      className="btn btn-danger"
                    >
                      {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
