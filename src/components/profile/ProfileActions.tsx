'use client';

import React, { useState } from 'react';
import { Heart, Bookmark, BookmarkCheck, Flag, Ban, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, Textarea, Select } from '@/components/ui/form';
import { useToast } from '@/components/providers/ToastProvider';
import { useSendInterest } from '@/features/interests/hooks';
import { useIsShortlisted, useAddShortlist, useRemoveShortlist } from '@/features/shortlist/hooks';
import { useReportProfile, useBlockUser } from '@/features/safety/hooks';
import { REPORT_REASON_LABELS } from '@/lib/format';
import { errorMessage } from '@/lib/errors';
import type { ReportReason } from '@/types/enums';
import { useI18n } from '@/lib/i18n';

export function ProfileActions({
  publicId,
  name,
  onBlocked,
}: {
  publicId: string;
  name: string;
  onBlocked?: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();

  const sendInterest = useSendInterest();
  const [interestOpen, setInterestOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [interestSent, setInterestSent] = useState(false);

  const shortlisted = useIsShortlisted(publicId);
  const addShortlist = useAddShortlist();
  const removeShortlist = useRemoveShortlist();

  const report = useReportProfile();
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('fake_profile');
  const [details, setDetails] = useState('');

  const block = useBlockUser();
  const [blockOpen, setBlockOpen] = useState(false);

  const doSendInterest = () => {
    sendInterest.mutate(
      { profile_id: publicId, message: message || undefined },
      {
        onSuccess: () => {
          setInterestOpen(false);
          setInterestSent(true);
          toast(t('btn_interest_sent', 'Interest sent'), 'success');
        },
        onError: (e) => toast(errorMessage(e), 'error'),
      },
    );
  };

  const toggleShortlist = () => {
    if (shortlisted) {
      removeShortlist.mutate(publicId, { onError: (e) => toast(errorMessage(e), 'error') });
    } else {
      addShortlist.mutate(
        { profile_id: publicId },
        {
          onSuccess: () => toast(t('btn_shortlisted', 'Shortlisted'), 'success'),
          onError: (e) => toast(errorMessage(e), 'error'),
        },
      );
    }
  };

  const doReport = () => {
    report.mutate(
      { profile_id: publicId, reason, details: details || undefined },
      {
        onSuccess: (r) => {
          setReportOpen(false);
          setDetails('');
          toast(r.message ?? 'Report submitted.', 'success');
        },
        onError: (e) => toast(errorMessage(e), 'error'),
      },
    );
  };

  const doBlock = () => {
    block.mutate(publicId, {
      onSuccess: (r) => {
        setBlockOpen(false);
        toast(r.message ?? 'User blocked.', 'success');
        onBlocked?.();
      },
      onError: (e) => toast(errorMessage(e), 'error'),
    });
  };

  return (
    <>
      <div className="row gap-2 wrap">
        <Button
          variant="rose"
          onClick={() => setInterestOpen(true)}
          disabled={interestSent}
        >
          {interestSent ? <><Check size={16} /> {t('btn_interest_sent', 'Interest sent')}</> : <><Heart size={16} /> {t('btn_send_interest', 'Send interest')}</>}
        </Button>

        <Button variant="ghost" onClick={toggleShortlist} loading={addShortlist.isPending || removeShortlist.isPending}>
          {shortlisted ? <><BookmarkCheck size={16} /> {t('btn_shortlisted', 'Shortlisted')}</> : <><Bookmark size={16} /> {t('btn_shortlist', 'Shortlist')}</>}
        </Button>

        <Button variant="subtle" onClick={() => setReportOpen(true)} title={t('act_report')}>
          <Flag size={16} /> {t('act_report')}
        </Button>
        <Button variant="subtle" onClick={() => setBlockOpen(true)} title={t('act_block')}>
          <Ban size={16} /> {t('act_block')}
        </Button>
      </div>

      {/* Send interest */}
      <Modal
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
        title={`${t('btn_send_interest', 'Send interest')} — ${name}`}
        footer={
          <>
            <Button variant="subtle" onClick={() => setInterestOpen(false)}>{t('cancel')}</Button>
            <Button variant="rose" onClick={doSendInterest} loading={sendInterest.isPending}>
              {t('send')}
            </Button>
          </>
        }
      >
        <Field label="Add a short message" hint={`${message.length}/500 · ${t('optional')}`}>
          <Textarea
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Assalamu alaikum / Namaskar — a respectful first note goes a long way."
          />
        </Field>
      </Modal>

      {/* Report */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={`${t('act_report')} — ${name}`}
        footer={
          <>
            <Button variant="subtle" onClick={() => setReportOpen(false)}>{t('cancel')}</Button>
            <Button variant="danger" onClick={doReport} loading={report.isPending}>{t('act_report')}</Button>
          </>
        }
      >
        <Field label="Reason">
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            options={Object.entries(REPORT_REASON_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Field>
        <Field label="Details" hint={t('optional')}>
          <Textarea value={details} maxLength={2000} onChange={(e) => setDetails(e.target.value)} />
        </Field>
      </Modal>

      <ConfirmDialog
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        onConfirm={doBlock}
        title={`${t('act_block')} ${name}?`}
        message="They won't be able to see your profile or contact you, and they'll disappear from your discovery."
        confirmLabel={t('act_block')}
        danger
        loading={block.isPending}
      />
    </>
  );
}
