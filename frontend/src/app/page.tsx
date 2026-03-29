import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { Gavel, Shield, Clock, Award, ArrowRight, Play } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge variant="gold" className="mb-6">
              Now Accepting Consignments
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-[var(--color-text-primary)]">The Premier Destination for</span>
              <br />
              <span className="text-gold-gradient">Luxury Timepieces</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-[var(--color-text-secondary)] mb-8">
              Authenticated watches and fine jewelry. Transparent bidding. 
              Worldwide shipping. Join collectors who trust Lotique for their most prized acquisitions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auctions">
                <Button size="lg" className="min-w-[200px]">
                  Browse Live Auctions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  <Play className="mr-2 h-5 w-5" />
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$12M+', label: 'Total Sales' },
              { value: '2,500+', label: 'Items Sold' },
              { value: '100%', label: 'Authenticity Guaranteed' },
              { value: '4.9★', label: 'Buyer Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl lg:text-3xl font-bold text-[var(--color-primary)]">{stat.value}</div>
                <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Why Collectors Choose Lotique
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              We combine the expertise of traditional auction houses with modern technology 
              to deliver an unparalleled collecting experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Authenticated Items',
                description: 'Every piece verified by certified experts with detailed condition reports.',
              },
              {
                icon: Clock,
                title: 'Fair Bidding',
                description: 'Anti-snipe technology ensures the highest bidder wins, not the fastest.',
              },
              {
                icon: Award,
                title: 'Buyer Protection',
                description: 'Full refund if item doesn\'t match description. Your trust is paramount.',
              },
              {
                icon: Gavel,
                title: 'Transparent Process',
                description: 'Real-time bidding, full bid history, and no hidden fees.',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] card-hover">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 mb-4">
                  <feature.icon className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-bg-secondary)] to-[var(--color-primary)]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            Ready to Start Collecting?
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
            Create your free account today and get access to exclusive auctions, 
            personalized recommendations, and insider notifications.
          </p>
          <Link href="/register">
            <Button size="lg">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
