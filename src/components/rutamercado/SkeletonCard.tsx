interface Props {
  fixedWidth?: boolean;
}

export function SkeletonCard({ fixedWidth }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white rm-shadow-warm ${
        fixedWidth ? "w-[280px] shrink-0 sm:w-[320px]" : "w-full"
      }`}
    >
      <div className="aspect-video w-full rm-skeleton" />
      <div className="space-y-2.5 p-5">
        <div className="h-5 w-3/4 rounded rm-skeleton" />
        <div className="h-[2px] w-10 bg-[#f8b625]/50" />
        <div className="h-4 w-1/2 rounded rm-skeleton" />
        <div className="h-4 w-2/3 rounded rm-skeleton" />
        <div className="h-4 w-1/3 rounded rm-skeleton" />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 h-7 w-48 rounded rm-skeleton" />
      <div className="-mx-4 flex gap-5 overflow-hidden px-4 sm:mx-0 sm:px-0">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rm-animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <SkeletonCard fixedWidth />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rm-animate-fade-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}
