import { Shield, Award, Users, MapPin, Phone, Mail } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gold-gradient mb-6">
            About Lotique
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            A bespoke digital auction house for discerning collectors of fine timepieces 
            and exceptional jewelry.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
              Our Story
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              Lotique was founded with a singular vision: to create the most trusted and elegant 
              auction experience for luxury collectors. In a market saturated with impersonal 
              marketplaces and questionable authenticity, we saw an opportunity to build something different.
            </p>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6">
              Every piece we present has been meticulously vetted, authenticated, and documented. 
              We believe that acquiring a fine watch or piece of jewelry should be an experience 
              worthy of the object itself — one marked by trust, transparency, and the thrill of discovery.
            </p>
            <p className="text-lg text-[var(--color-text-secondary)]">
              Our platform combines the gravitas of traditional auction houses with the accessibility 
              and convenience of modern technology. Whether you're a seasoned collector or acquiring 
              your first significant piece, Lotique provides the environment you deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-12">
            Our Commitment
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Authenticity Guaranteed',
                description: 'Every item undergoes rigorous authentication by certified experts. We stand behind every piece we sell.',
              },
              {
                icon: Award,
                title: 'Curated Excellence',
                description: 'We don\'t list everything. Only pieces that meet our exacting standards make it to auction.',
              },
              {
                icon: Users,
                title: 'Collector Privacy',
                description: 'Your identity is protected. Bid anonymously as a numbered collector, maintaining your privacy.',
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  {value.title}
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-12">
            Contact Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <MapPin className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Location</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Private Showroom<br />
                By Appointment Only
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <Phone className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Phone</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                +1 (555) 123-4567<br />
                Mon-Fri, 9am-6pm EST
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <Mail className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Email</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                hello@lotique.com<br />
                We respond within 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary)]/10 border-y border-[var(--color-primary)]/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-primary)] font-semibold">Verified Business</span>
            {' '}&bull;{' '}Licensed & Insured{' '}&bull;{' '}Member of Leading Industry Associations
          </p>
        </div>
      </section>
    </div>
  );
}
