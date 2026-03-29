'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { auctionsApi } from '@/services/api';
import { Button, Card, Input } from '@/components/ui';

interface AuctionForm {
  title: string;
  description: string;
  category: string;
  startingBid: number;
  reservePrice: number;
  buyNowPrice: number;
  scheduledStart: string;
  scheduledEnd: string;
  images: string[];
  condition: string;
  provenance: string;
  dimensions: string;
  weight: string;
  materials: string;
  yearCreated: string;
  artist: string;
  isPrivate: boolean;
  requiresDeposit: boolean;
  depositAmount: number;
}

const CATEGORIES = [
  'Jewelry',
  'Watches',
  'Fine Art',
  'Antiques',
  'Collectibles',
  'Wine & Spirits',
  'Automobiles',
  'Real Estate',
  'Other'
];

const CONDITIONS = [
  'Mint',
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'As-Is'
];

export default function NewAuctionPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [form, setForm] = useState<AuctionForm>({
    title: '',
    description: '',
    category: 'Jewelry',
    startingBid: 1000,
    reservePrice: 0,
    buyNowPrice: 0,
    scheduledStart: '',
    scheduledEnd: '',
    images: [],
    condition: 'Excellent',
    provenance: '',
    dimensions: '',
    weight: '',
    materials: '',
    yearCreated: '',
    artist: '',
    isPrivate: false,
    requiresDeposit: false,
    depositAmount: 1000,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin');
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthorized) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!form.title.trim()) throw new Error('Title is required');
      if (!form.description.trim()) throw new Error('Description is required');
      if (form.startingBid < 1) throw new Error('Starting bid must be at least $1');
      if (form.images.length === 0) throw new Error('At least one image is required');
      if (!form.scheduledStart || !form.scheduledEnd) throw new Error('Schedule dates are required');

      const startDate = new Date(form.scheduledStart);
      const endDate = new Date(form.scheduledEnd);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      await auctionsApi.create({
        title: form.title,
        description: form.description,
        category: form.category,
        startingBid: form.startingBid,
        reservePrice: form.reservePrice || undefined,
        buyNowPrice: form.buyNowPrice || undefined,
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        images: form.images,
        conditionReport: {
          summary: form.condition,
          detailedDescription: form.provenance,
        },
        specifications: {
          dimensions: form.dimensions,
          weight: form.weight,
          materials: form.materials,
          yearCreated: form.yearCreated,
          artist: form.artist,
        },
        visibility: form.isPrivate ? 'private' : 'public',
        depositRequired: form.requiresDeposit ? form.depositAmount : undefined,
      });

      router.push('/admin?tab=auctions');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Create New Auction
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            List a new item for auction on Lotique
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <Tag className="h-5 w-5 text-[var(--color-primary)]" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Title *
                </label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Cartier Diamond Tennis Bracelet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Detailed description of the item..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--color-primary)]" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Starting Bid *
                </label>
                <Input
                  type="number"
                  name="startingBid"
                  value={form.startingBid}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Reserve Price
                </label>
                <Input
                  type="number"
                  name="reservePrice"
                  value={form.reservePrice}
                  onChange={handleChange}
                  min={0}
                  placeholder="Optional"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Minimum price to sell
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Buy Now Price
                </label>
                <Input
                  type="number"
                  name="buyNowPrice"
                  value={form.buyNowPrice}
                  onChange={handleChange}
                  min={0}
                  placeholder="Optional"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Instant purchase price
                </p>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
              Schedule
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Start Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  name="scheduledStart"
                  value={form.scheduledStart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  End Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  name="scheduledEnd"
                  value={form.scheduledEnd}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[var(--color-primary)]" />
              Images
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1"
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {form.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-[var(--color-border)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 text-xs bg-[var(--color-primary)] text-black px-2 py-0.5 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-[var(--color-text-muted)]">
                First image will be used as the main thumbnail. Add high-quality images for best results.
              </p>
            </div>
          </Card>

          {/* Item Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--color-primary)]" />
              Item Details
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Artist / Maker
                </label>
                <Input
                  name="artist"
                  value={form.artist}
                  onChange={handleChange}
                  placeholder="e.g., Cartier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Year Created
                </label>
                <Input
                  name="yearCreated"
                  value={form.yearCreated}
                  onChange={handleChange}
                  placeholder="e.g., 1985"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Materials
                </label>
                <Input
                  name="materials"
                  value={form.materials}
                  onChange={handleChange}
                  placeholder="e.g., 18K Gold, Diamonds"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Dimensions
                </label>
                <Input
                  name="dimensions"
                  value={form.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 7 inches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Weight
                </label>
                <Input
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="e.g., 45 grams"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Provenance
                </label>
                <textarea
                  name="provenance"
                  value={form.provenance}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="History of ownership, certificates, etc."
                />
              </div>
            </div>
          </Card>

          {/* Access Control */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
              Access Control
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={form.isPrivate}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]"
                />
                <div>
                  <p className="text-[var(--color-text-primary)]">Private Auction</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Requires password or invitation to access
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresDeposit"
                  checked={form.requiresDeposit}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]"
                />
                <div>
                  <p className="text-[var(--color-text-primary)]">Require Deposit</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Bidders must place a deposit before participating
                  </p>
                </div>
              </label>

              {form.requiresDeposit && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Deposit Amount
                  </label>
                  <Input
                    type="number"
                    name="depositAmount"
                    value={form.depositAmount}
                    onChange={handleChange}
                    min={100}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Auction'}
            </Button>
            <Link href="/admin">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
