import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`storefront-logo ${className}`.trim()}
      aria-label={`${BRAND_NAME} home`}
    >
      <Image
        src="/assets/images/brand/steal-deals-mark.png"
        width={256}
        height={290}
        sizes="38px"
        className="storefront-logo__mark"
        alt=""
        aria-hidden="true"
      />
      <span className="storefront-logo__wordmark">{BRAND_NAME}</span>
    </Link>
  );
}
