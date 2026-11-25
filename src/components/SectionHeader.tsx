/**
 * Encabezado de sección sobrio: rótulo chico, título y bajada opcional.
 * Sin números de paso ni filetes.
 */
export function SectionHeader({
  label,
  title,
  description,
  id,
}: {
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  id: string;
}) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
      <div>
        <p className="text-[12px] font-semibold tracking-[0.18em] text-muted uppercase">{label}</p>
        <h2 id={id} className="section-title mt-3">
          {title}
        </h2>
      </div>
      {description && <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted md:text-right">{description}</p>}
    </header>
  );
}
