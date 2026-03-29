'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Shield, Star, Award, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { usersApi } from '@/services/api';
import { Button, Card, Badge, Input } from '@/components/ui';

export default function AccountPage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account');
      return;
    }

    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
    }
  }, [isAuthenticated, user, router]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await usersApi.updateMe(formData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            My Account
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Manage your profile and view your bidding statistics
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Profile Information
                </h2>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--color-text-muted)] mb-1">
                        First Name
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-text-muted)] mb-1">
                        Last Name
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-text-muted)] mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} isLoading={isLoading}>
                      Save Changes
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                      <User className="h-8 w-8 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-[var(--color-primary)]">{user.displayName}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                    <div className="flex items-center text-[var(--color-text-secondary)]">
                      <Mail className="h-4 w-4 mr-3" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-[var(--color-text-secondary)]">
                        <Phone className="h-4 w-4 mr-3" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center text-[var(--color-text-secondary)]">
                      <Shield className="h-4 w-4 mr-3" />
                      Account Status:{' '}
                      <Badge variant={user.status === 'active' ? 'success' : 'warning'} className="ml-2">
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-[var(--color-primary)]" />
                Reputation
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                  {user.reputationScore?.toFixed(1) || '5.0'}
                </div>
                <div className="flex justify-center text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(user.reputationScore || 5) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Based on {user.totalWins || 0} completed transactions
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--color-primary)]" />
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Auctions Won</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {user.totalWins || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Payments Completed</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {user.paymentsCompleted || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Avg Payment Time</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {user.avgPaymentTimeMinutes ? `${user.avgPaymentTimeMinutes} min` : '-'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
