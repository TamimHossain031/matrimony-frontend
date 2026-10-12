import type { Metadata } from 'next';
import PublicCardPage, { generateMetadata as generateRootMetadata } from '../[publicId]/page';

interface Props {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return generateRootMetadata(props);
}

export default async function PrefixedPublicCardPage(props: Props) {
  return PublicCardPage(props);
}
