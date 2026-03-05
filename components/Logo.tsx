import Image from "next/image";
import Link from "next/link";

const LOGO_PATH = "/logo.png";

type LogoProps = {
  /** Size: "sm" (header/footer), "md" (login card), "lg" (hero) */
  size?: "sm" | "md" | "lg";
  /** If true, wrap in Link to / */
  link?: boolean;
  className?: string;
};

const sizeMap = {
  sm: { width: 52, height: 52, className: "h-[52px] w-[52px] sm:h-14 sm:w-14" },
  md: { width: 64, height: 64, className: "h-16 w-16" },
  lg: { width: 96, height: 96, className: "h-24 w-24 sm:h-28 sm:w-28" },
};

export function Logo({ size = "sm", link = true, className = "" }: LogoProps) {
  const { width, height, className: sizeClass } = sizeMap[size];
  const img = (
    <Image
      src={LOGO_PATH}
      alt="Cedar Training Center"
      width={width}
      height={height}
      className={`object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${sizeClass} ${className}`}
      priority
    />
  );

  if (link) {
    return (
      <Link href="/" className="inline-flex shrink-0 items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg">
        {img}
      </Link>
    );
  }
  return <span className="inline-flex shrink-0 items-center justify-center">{img}</span>;
}
