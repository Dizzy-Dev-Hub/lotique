import { Shield, Clock, CreditCard, Truck, Award, HelpCircle } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Shield,
      title: 'Register & Verify',
      description: 'Create your account and complete verification to start bidding. Your identity remains private - you\'ll bid as an anonymous collector number.',
    },
    {
      icon: Clock,
      title: 'Browse & Watch',
      description: 'Explore our curated selection of luxury watches and jewelry. Add items to your watchlist to receive notifications when bidding activity heats up.',
    },
    {
      icon: Award,
      title: 'Place Your Bid',
      description: 'When you find your piece, place your bid. Our anti-snipe protection extends the auction if bids come in the final 2 minutes.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'If you win, you\'ll receive an invoice with secure payment options. An 18% buyer\'s premium is added to your winning bid.',
    },
    {
      icon: Truck,
      title: 'Insured Shipping',
      description: 'Your item is carefully packaged and shipped with full insurance. Track your delivery every step of the way.',
    },
  ];

  const faqs = [
    {
      question: 'What is the buyer\'s premium?',
      answer: 'An 18% buyer\'s premium is added to the hammer price (your winning bid). This covers authentication, handling, and platform fees.',
    },
    {
      question: 'What is anti-snipe protection?',
      answer: 'If a bid is placed in the final 2 minutes of an auction, the timer extends by 2 minutes. This ensures the highest bidder wins, not the fastest clicker.',
    },
    {
      question: 'What is a reserve price?',
      answer: 'Some items have a hidden reserve price set by the seller. If bidding doesn\'t reach the reserve, the item may not sell. You\'ll see "Reserve Not Met" if this is the case.',
    },
    {
      question: 'How does Buy Now work?',
      answer: 'Some auctions offer a Buy Now option. Click it to purchase immediately at the listed price, ending the auction instantly.',
    },
    {
      question: 'Are items authenticated?',
      answer: 'Every item undergoes rigorous authentication and comes with a detailed condition report. We guarantee authenticity.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards, wire transfers, and select cryptocurrencies for high-value purchases.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gold-gradient mb-6">
            How Lotique Works
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            A seamless auction experience designed for discerning collectors. 
            From discovery to delivery, we handle every detail.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center">
                    <step.icon className="h-12 w-12 text-[var(--color-primary)]" />
                  </div>
                </div>
                <div className={`flex-1 text-center md:text-left ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                  <div className="text-sm text-[var(--color-primary)] font-medium mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] max-w-md">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-12 w-12 text-[var(--color-primary)] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div 
                key={faq.question}
                className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
              >
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {faq.question}
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
