import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCardViewer } from '@/components/greetings/PublicCardViewer';
import type { GreetingCard } from '@/types/greetings';

interface Props {
  params: Promise<{ publicId: string }>;
}

const RESERVED_ROUTES = new Set([
  'dashboard',
  'discover',
  'messages',
  'notifications',
  'shortlist',
  'interests',
  'me',
  'profiles',
  'settings',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'greetings',
  'api',
  '_next',
  'favicon.ico',
]);

async function getCard(publicId: string): Promise<GreetingCard | null> {
  if (RESERVED_ROUTES.has(publicId)) {
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/public/greeting-cards/${publicId}`, {
      next: { revalidate: 30 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data as GreetingCard;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  if (RESERVED_ROUTES.has(publicId)) {
    return { title: 'Not Found' };
  }

  const card = await getCard(publicId);

  if (!card) {
    return {
      title: 'Greeting Card | Shondhan',
      description: 'Create and view personalized greeting cards worldwide.',
    };
  }

  const recipient = card.recipient_name;
  const occasion = card.template?.occasion || 'celebration';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamim.com';
  const title = `A Special Greeting for ${recipient} 💌`;
  const description = card.sender_name
    ? `A personalized greeting card for ${recipient} from ${card.sender_name}. Open link to view your card.`
    : `A personalized greeting card for ${recipient}. Open link to view your card.`;

  const ogImageUrl = `${siteUrl}/api/og/card?id=${publicId}&recipient=${encodeURIComponent(recipient)}&occasion=${encodeURIComponent(occasion)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${publicId}`,
      siteName: 'Shondhan Celebrations',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Special greeting card for ${recipient}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicCardPage({ params }: Props) {
  const { publicId } = await params;

  if (RESERVED_ROUTES.has(publicId)) {
    notFound();
  }

  const initialCard = await getCard(publicId);

  return <PublicCardViewer publicId={publicId} initialCard={initialCard} />;
}
