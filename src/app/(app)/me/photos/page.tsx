'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Star, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { usePhotos, useUploadPhoto, useSetPrimaryPhoto, useDeletePhoto } from '@/features/photos/hooks';
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

export default function PhotosPage() {
  const { t } = useI18n();
  const query = usePhotos();
  const upload = useUploadPhoto();
  const setPrimary = useSetPrimaryPhoto();
  const del = useDeletePhoto();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState<Visibility>('members_only');
  const [toDelete, setToDelete] = useState<number | null>(null);

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

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="row gap-2 mb-2">
        <Link href="/me" className="btn btn-icon btn-subtle" aria-label="Back"><ArrowLeft size={18} /></Link>
      </div>
      <PageHeader title={t('my_photos')} subtitle="Photos are reviewed before they go live. They stay private until you choose to share." />

      <div className="card card-pad mb-4">
        <div className="row gap-3 wrap" style={{ alignItems: 'flex-end' }}>
          <div style={{ minWidth: 200 }} className="grow">
            <label className="label">Who can see this photo</label>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              options={[
                { value: 'members_only', label: 'Members only' },
                { value: 'accepted_connection', label: 'Accepted connections only' },
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private (only me)' },
              ]}
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

      <QueryBoundary
        query={query}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon={<Upload size={24} />} title="No photos yet" message="Add a clear, recent photo to build trust." />}
      >
        {(photos) => (
          <div className="grid-cards">
            {photos.map((p) => (
              <PhotoCard
                key={p.id}
                photo={p}
                onPrimary={() => setPrimary.mutate(p.id, { onSuccess: () => toast('Primary photo set.', 'success'), onError: (e) => toast(errorMessage(e), 'error') })}
                onDelete={() => setToDelete(p.id)}
                busy={setPrimary.isPending}
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
  busy,
}: {
  photo: ProfilePhoto;
  onPrimary: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const status = photo.moderation_status;
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className={`photo-frame ${photo.blurred || !photo.url ? 'blurred' : ''}`} style={{ aspectRatio: '1' }}>
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--leaf-soft)' }} />
        )}
      </div>
      <div className="card-pad" style={{ padding: 12 }}>
        <div className="row between gap-2">
          {status === 'approved' && <Badge tone="leaf" icon={<CheckCircle2 size={12} />}>Approved</Badge>}
          {status === 'pending' && <Badge tone="muted" icon={<Clock size={12} />}>In review</Badge>}
          {status === 'rejected' && <Badge tone="rose" icon={<XCircle size={12} />}>Rejected</Badge>}
          {photo.is_primary && <Badge tone="verify" icon={<Star size={12} />}>Primary</Badge>}
        </div>
        <div className="row gap-2 mt-2">
          {!photo.is_primary && (
            <Button size="sm" variant="ghost" onClick={onPrimary} disabled={busy}><Star size={14} /> Make primary</Button>
          )}
          <Button size="sm" variant="subtle" onClick={onDelete}><Trash2 size={14} /></Button>
        </div>
      </div>
    </div>
  );
}
