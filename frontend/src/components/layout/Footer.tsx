import Link from 'next/link';
import { Gavel } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-xl font-bold text-gold-gradient">LOTIQUE</span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)]">
              The premier destination for luxury watches and fine jewelry auctions.
            </p>
          </div>

          {/* Auctions */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Auctions</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auctions" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link href="/auctions?category=watches" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Watches
                </Link>
              </li>
              <li>
                <Link href="/auctions?category=jewelry" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Jewelry
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/buyer-terms" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                  Buyer Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-muted)]">
                🔒 Secure Payments
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-muted)]">
                ✓ Verified Business
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-muted)]">
                🛡️ Buyer Protection
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} Lotique. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
