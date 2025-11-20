import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              ManhwaIndo
            </h3>
            <p className="text-sm text-muted-foreground">
              Situs baca komik manhwa online terlengkap dengan update harian. Nikmati ratusan judul manhwa secara gratis.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/series" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Series
                </Link>
              </li>
              <li>
                <Link href="/bookmark" className="text-muted-foreground hover:text-primary transition-colors">
                  My Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-muted-foreground hover:text-primary transition-colors">
                  Reading History
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <p className="text-sm text-muted-foreground mb-2">
              All content belongs to their respective owners.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 ManhwaIndo. Built with Next.js.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by Ramadhanu
          </p>
        </div>
      </div>
    </footer>
  );
}
