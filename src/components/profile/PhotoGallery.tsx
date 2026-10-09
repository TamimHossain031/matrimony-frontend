'use client';

import React, { useState } from 'react';
import { Lock, ImageOff } from 'lucide-react';
import type { ProfilePhoto } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { useRequestPhotos } from '@/features/photos/hooks';
import { useToast } from '@/components/providers/ToastProvider';
import { errorMessage } from '@/lib/errors';

// BlurredPhoto deserves care — it's the feature women judge the product by
// (§9). Blur by default, a clear lock, and a request button that explains
// what happens.
export function PhotoGallery({
  photos,
  publicId,
  isOwner,
}: {
  photos: ProfilePhoto[];
  publicId: string;
  isOwner: boolean;
}) {
  const [active, setActive] = useState(0);
  const request = useRequestPhotos();
  const { toast } = useToast();
  const [requested, setRequested] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="card photo-frame" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }}>
        <div className="photo-lock" style={{ position: 'static', background: 'none' }}>
          <ImageOff size={28} />
          <span className="small faint">No photos added yet</span>
        </div>
      </div>
    );
  }

  const current = photos[active];
  const locked = current.blurred || !current.url;

  const onRequest = () => {
    request.mutate(publicId, {
      onSuccess: (r) => {
        setRequested(true);
        toast(r.message ?? 'Photo request sent.', 'success');
      },
      onError: (e) => toast(errorMessage(e), 'error'),
    });
  };

  return (
    <div className="stack gap-2">
      <div
        className={`photo-frame ${locked ? 'blurred' : ''}`}
        style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)', border: '1px solid var(--rule-soft)' }}
      >
        {current.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt="Profile photo" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--leaf-soft)' }} />
        )}
        {locked && (
          <div className="photo-lock">
            <Lock size={26} />
            <span className="small strong">Photos are private</span>
            {!isOwner && (
              <>
                <span className="tiny" style={{ maxWidth: '28ch' }}>
                  Request access — the member will be notified and can approve or decline.
                </span>
                <Button
                  size="sm"
                  variant="rose"
                  className="mt-2"
                  loading={request.isPending}
                  disabled={requested}
                  onClick={onRequest}
                >
                  {requested ? 'Request sent' : 'Request to view'}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="row gap-2 wrap">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`photo-frame ${p.blurred || !p.url ? 'blurred' : ''}`}
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius)',
                border: i === active ? '2px solid var(--leaf)' : '1px solid var(--rule)',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Photo ${i + 1}`}
            >
              {p.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.url} alt="" />
              ) : (
                <Lock size={14} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
