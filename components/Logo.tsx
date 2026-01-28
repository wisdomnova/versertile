import Image from "next/image";

export function Logo({ size = 32, withText = false }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: '2px' }}>
      <Image
        src="/VERSERTILE/LOGO BLACK PNG.PNG"
        alt="VERSERTILE"
        width={size}
        height={size}
        priority
      />
      {withText && (
        <span className="text-base" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          VERSERTILE
        </span>
      )}
    </div>
  );
}
