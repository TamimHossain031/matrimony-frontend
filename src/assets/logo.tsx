import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export function Logo({ size = 40, className, alt = 'Shondhan' }: LogoProps) {
  return (
    <Image
      src="/logo/logo.svg"
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      priority
    />
  );
}

export default Logo;
