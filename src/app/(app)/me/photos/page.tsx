'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Star, Trash2, Clock, CheckCircle2, XCircle, Check, Camera } from 'lucide-react';
import {
  usePhotos,
  useUploadPhoto,
  useUpdatePhoto,
  useSetPrimaryPhoto,
  useDeletePhoto,
} from '@/features/photos/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/form';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { QueryBoundary, EmptyState } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { errorMessage } from '@/lib/errors';
import type { Visibility } from '@/types/enums';
import type { ProfilePhoto } from '@/types/models';
import { useI18n } from '@/lib/i18n';

const VISIBILITY_OPTIONS = [
  { value: 'members_only', label: 'Members only' },
  { value: 'accepted_connection', label: 'Accepted connections only' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private (only me)' },
];

export default function PhotosPage() {
  const { t } = useI18n();
  const query = usePhotos();
  const upload = useUploadPhoto();
  const updatePhoto = useUpdatePhoto();
  const setPrimary = useSetPrimaryPhoto();
  const del = useDeletePhoto();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState<Visibility>('members_only');
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [updatingPhotoId, setUpdatingPhotoId] = useState<number | null>(null);

  const onPick = (file: File | undefined) => {
    if (!file) return;
    upload.mutate(
      { file, visibility },
      {
        onSuccess: () => toast('Photo uploaded — pending review.', 'success'),
        onError: (e) => toast(errorMessage(e), 'error'),
      },
    );
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleUpdateVisibility = (photoId: number, nextVisibility: Visibility) => {
    setUpdatingPhotoId(photoId);
    updatePhoto.mutate(
      { id: photoId, visibility: nextVisibility },
      {
        onSuccess: () => toast('Photo visibility status updated.', 'success'),
        onError: (e) => toast(errorMessage(e), 'error'),
        onSettled: () => setUpdatingPhotoId(null),
      },
    );
  };

  const photos = query.data ?? [];
  const primaryPhoto = photos.find((p) => p.is_primary) ?? photos[0];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="row gap-2 mb-2">
        <Link href="/me" className="btn btn-icon btn-subtle" aria-label="Back"><ArrowLeft size={18} /></Link>
      </div>
      <PageHeader
        title={t('my_photos')}
        subtitle="Manage who can see your photos and set your primary profile picture."
      />

      {/* Featured Primary Profile Photo Banner */}
      {primaryPhoto && (
        <div className="card card-pad mb-4" style={{ border: '1px solid var(--rule-soft)' }}>
          <div className="row between gap-3 wrap" style={{ alignItems: 'center' }}>
            <div className="row gap-3 wrap" style={{ alignItems: 'center' }}>
              <div
                className={`photo-frame ${primaryPhoto.blurred || !primaryPhoto.url ? 'blurred' : ''}`}
                style={{ width: 80, height: 80, borderRadius: 'var(--radius)', overflow: 'hidden' }}
              >
                {primaryPhoto.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primaryPhoto.url} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--leaf-soft)' }} />
                )}
              </div>
              <div>
                <div className="row gap-2 wrap" style={{ alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Profile Photo</h3>
                  <Badge tone="verify" icon={<Star size={12} />}>Primary</Badge>
                  {primaryPhoto.moderation_status === 'approved' && <Badge tone="leaf" icon={<CheckCircle2 size={12} />}>Approved</Badge>}
                  {primaryPhoto.moderation_status === 'pending' && <Badge tone="muted" icon={<Clock size={12} />}>In review</Badge>}
                </div>
                <p className="tiny muted mt-1" style={{ margin: '4px 0 0' }}>
                  This photo is shown on your biodata, header avatar, and dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Photo Section */}
      <div className="card card-pad mb-4">
        <div className="section-title" style={{ marginBottom: 10 }}>Upload New Photo</div>
        <div className="row gap-3 wrap" style={{ alignItems: 'flex-end' }}>
          <div style={{ minWidth: 220 }} className="grow">
            <label className="label">Who can see this photo</label>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              options={VISIBILITY_OPTIONS}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <Button variant="primary" onClick={() => fileRef.current?.click()} loading={upload.isPending}>
            <Upload size={16} /> Upload photo
          </Button>
        </div>
        <p className="tiny faint mt-2" style={{ marginBottom: 0 }}>JPG, PNG or WebP · up to 5MB · min 200×200px.</p>
      </div>

      <div className="row between gap-2 mb-3" style={{ alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Your Photos</h3>
        {photos.length > 0 && <span className="small faint">{photos.length} total</span>}
      </div>

      <QueryBoundary
        query={query}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon={<Camera size={24} />} title="No photos yet" message="Add a clear, recent photo to build trust." />}
      >
        {(items) => (
          <div className="grid-cards">
            {items.map((p) => (
              <PhotoCard
                key={p.id}
                photo={p}
                onPrimary={() => setPrimary.mutate(p.id, {
                  onSuccess: () => toast('Primary profile photo updated.', 'success'),
                  onError: (e) => toast(errorMessage(e), 'error'),
                })}
                onDelete={() => setToDelete(p.id)}
                onUpdateVisibility={(nextVis) => handleUpdateVisibility(p.id, nextVis)}
                busy={setPrimary.isPending}
                updating={updatingPhotoId === p.id}
              />
            ))}
          </div>
        )}
      </QueryBoundary>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete !== null &&
          del.mutate(toDelete, {
            onSuccess: () => { setToDelete(null); toast('Photo deleted.', 'success'); },
            onError: (e) => toast(errorMessage(e), 'error'),
          })
        }
        title="Delete this photo?"
        message="This can't be undone."
        confirmLabel={t('remove')}
        danger
        loading={del.isPending}
      />
    </div>
  );
}

function PhotoCard({
  photo,
  onPrimary,
  onDelete,
  onUpdateVisibility,
  busy,
  updating,
}: {
  photo: ProfilePhoto;
  onPrimary: () => void;
  onDelete: () => void;
  onUpdateVisibility: (visibility: Visibility) => void;
  busy: boolean;
  updating: boolean;
}) {
  const [selectedVisibility, setSelectedVisibility] = useState<Visibility>(
    photo.visibility || 'members_only',
  );
  const status = photo.moderation_status;
  const isChanged = selectedVisibility !== (photo.visibility || 'members_only');

  useEffect(() => {
    if (photo.visibility) {
      setSelectedVisibility(photo.visibility);
    }
  }, [photo.visibility]);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className={`photo-frame ${photo.blurred || !photo.url ? 'blurred' : ''}`} style={{ aspectRatio: '1' }}>
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--leaf-soft)' }} />
        )}
      </div>
      <div className="card-pad stack gap-2" style={{ padding: 14 }}>
        <div className="row between gap-2 wrap" style={{ alignItems: 'center' }}>
          <div className="row gap-1 wrap">
            {status === 'approved' && <Badge tone="leaf" icon={<CheckCircle2 size={12} />}>Approved</Badge>}
            {status === 'pending' && <Badge tone="muted" icon={<Clock size={12} />}>In review</Badge>}
            {status === 'rejected' && <Badge tone="rose" icon={<XCircle size={12} />}>Rejected</Badge>}
          </div>
          {photo.is_primary && <Badge tone="verify" icon={<Star size={12} />}>Profile Photo</Badge>}
        </div>

        {/* Who can see this photo setting + Status Update Button */}
        <div className="stack gap-1 mt-1">
          <label className="tiny strong muted" style={{ margin: 0 }}>Who can see this photo</label>
          <div className="row gap-2" style={{ alignItems: 'center' }}>
            <div className="grow">
              <Select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value as Visibility)}
                options={VISIBILITY_OPTIONS}
              />
            </div>
            <Button
              size="sm"
              variant={isChanged ? 'primary' : 'ghost'}
              onClick={() => onUpdateVisibility(selectedVisibility)}
              loading={updating}
              title="Update photo visibility status"
            >
              <Check size={14} /> Update Status
            </Button>
          </div>
        </div>

        <div className="row between gap-2 mt-2" style={{ borderTop: '1px solid var(--rule-soft)', paddingTop: 10 }}>
          {!photo.is_primary ? (
            <Button size="sm" variant="ghost" onClick={onPrimary} disabled={busy}>
              <Star size={14} /> Set as profile photo
            </Button>
          ) : (
            <span className="tiny leaf strong row gap-1" style={{ alignItems: 'center' }}>
              <Star size={12} /> Current profile photo
            </span>
          )}
          <Button size="sm" variant="subtle" onClick={onDelete} title="Delete photo">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
