import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-4">Search by letter</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
              <Link
                key={letter}
                href={`/search?q=${letter}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 hover:scale-110"
              >
                {letter}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
