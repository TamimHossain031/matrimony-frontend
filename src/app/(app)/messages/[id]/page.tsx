'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import { useMessages, useSendMessage } from '@/features/messages/hooks';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, ErrorState } from '@/components/ui/feedback';
import { useToast } from '@/components/providers/ToastProvider';
import { clockTime } from '@/lib/format';
import { errorMessage } from '@/lib/errors';
import type { Message } from '@/types/models';

export default function ThreadPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <ThreadInner />
    </Suspense>
  );
}

function ThreadInner() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const query = useMessages(id);
  const send = useSendMessage(id);
  const { toast } = useToast();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Messages come newest-first and paginated; show oldest → newest.
  const messages: Message[] = (query.data?.pages.flatMap((p) => p.data) ?? []).slice().reverse();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    send.mutate(body, {
      onSuccess: () => setText(''),
      onError: (err) => toast(errorMessage(err), 'error'),
    });
  };

  return (
    <div>
      <div className="row gap-2 mb-2">
        <Link href="/messages" className="btn btn-icon btn-subtle" aria-label="Back"><ArrowLeft size={18} /></Link>
        <h2 style={{ margin: 0 }}>Private conversation</h2>
      </div>

      <div className="chat-window card" style={{ padding: 0 }}>
        {query.isLoading ? (
          <CenterSpinner />
        ) : query.isError ? (
          <div className="card-pad"><ErrorState error={query.error} onRetry={query.refetch} /></div>
        ) : (
          <>
            <div className="chat-scroll" ref={scrollRef}>
              {query.hasNextPage && (
                <div className="row center mb-2">
                  <Button variant="subtle" size="sm" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                    Load earlier messages
                  </Button>
                </div>
              )}
              {messages.length === 0 && (
                <p className="small faint text-center" style={{ margin: 'auto' }}>
                  No messages yet — say salaam.
                </p>
              )}
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`bubble ${mine ? 'mine' : 'theirs'}`}>
                    <div>{m.body}</div>
                    <div className="row gap-1" style={{ justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: 3 }}>
                      {m.was_masked && (
                        <span className="tiny" title="Contact info was hidden for safety" style={{ opacity: 0.8, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <ShieldAlert size={11} /> masked
                        </span>
                      )}
                      <span className="tiny" style={{ opacity: 0.65 }}>{clockTime(m.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="chat-compose" onSubmit={submit}>
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                placeholder="Write a message…"
                aria-label="Message"
              />
              <Button type="submit" variant="primary" loading={send.isPending} disabled={!text.trim()}>
                <Send size={16} />
              </Button>
            </form>
          </>
        )}
      </div>
      <p className="tiny faint mt-2 text-center">
        For your safety, phone numbers and emails are automatically hidden in messages.
      </p>
    </div>
  );
}
