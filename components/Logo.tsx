import Image from "next/image";

export function Logo({ size = 32, withText = false }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: '4px' }}>
      <Image
        src="/VERSERTILE/LOGO WHITE PNG.PNG"
        alt="VERSERTILE"
        width={size}
        height={size}
        priority
      />
      {withText && (
        <span
          className="text-[0.8rem] text-[var(--color-text-primary)] tracking-[0.2em] uppercase"
          style={{ fontWeight: 300 }}
        >
          VERSERTILE
        </span>
      )}
    </div>
  );
}
