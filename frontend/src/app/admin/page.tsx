'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
  Gavel, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { auctionsApi, usersApi } from '@/services/api';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Auction, User } from '@/types';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'auctions' | 'users'>('overview');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      const [auctionsData, usersData] = await Promise.all([
        auctionsApi.getAll(),
        usersApi.getAll(),
      ]);
      setAuctions(Array.isArray(auctionsData?.auctions) ? auctionsData.auctions : []);
      setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setAuctions([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const stats = {
    totalAuctions: auctions.length,
    liveAuctions: auctions.filter(a => a.status === 'live').length,
    totalUsers: users.length,
    totalBids: auctions.reduce((sum, a) => sum + (a.totalBids || 0), 0),
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-[var(--color-primary)]" />
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              Manage your auction platform
            </p>
          </div>
          <Button onClick={() => router.push('/admin/auctions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Auction
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[var(--color-border)]">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'auctions', label: 'Auctions', icon: Gavel },
            { id: 'users', label: 'Users', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Auctions', value: stats.totalAuctions, icon: Gavel },
                { label: 'Live Now', value: stats.liveAuctions, icon: TrendingUp },
                { label: 'Registered Users', value: stats.totalUsers, icon: Users },
                { label: 'Total Bids', value: stats.totalBids, icon: DollarSign },
              ].map((stat) => (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                      <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {stat.value}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Recent Auctions
              </h3>
              <div className="space-y-3">
                {auctions.slice(0, 5).map((auction) => (
                  <div 
                    key={auction._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {auction.title}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {auction.totalBids} bids • Current: {formatCurrency(auction.currentBid)}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        auction.status === 'live' ? 'success' : 
                        auction.status === 'sold' ? 'gold' : 
                        'outline'
                      }
                    >
                      {auction.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : activeTab === 'auctions' ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                All Auctions
              </h3>
              <Button size="sm" onClick={() => router.push('/admin/auctions/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Auction
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Title</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Status</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Current Bid</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Bids</th>
                    <th className="text-right py-3 px-4 text-sm text-[var(--color-text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map((auction) => (
                    <tr key={auction._id} className="border-b border-[var(--color-border)]">
                      <td className="py-3 px-4 text-[var(--color-text-primary)]">
                        {auction.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            auction.status === 'live' ? 'success' : 
                            auction.status === 'sold' ? 'gold' : 
                            'outline'
                          }
                        >
                          {auction.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                        {formatCurrency(auction.currentBid || auction.startingBid)}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                        {auction.totalBids}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg"
                            onClick={() => router.push(`/auctions/${auction._id}`)}
                          >
                            <Eye className="h-4 w-4 text-[var(--color-text-muted)]" />
                          </button>
                          <button 
                            className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg"
                            onClick={() => router.push(`/admin/auctions/${auction._id}/edit`)}
                          >
                            <Edit className="h-4 w-4 text-[var(--color-text-muted)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
              All Users
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">User</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Display Name</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Status</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Reputation</th>
                    <th className="text-left py-3 px-4 text-sm text-[var(--color-text-muted)]">Wins</th>
                    <th className="text-right py-3 px-4 text-sm text-[var(--color-text-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-border)]">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-[var(--color-text-primary)]">{u.firstName} {u.lastName}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-primary)]">
                        {u.displayName}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            u.status === 'active' ? 'success' : 
                            u.status === 'banned' ? 'error' : 
                            'warning'
                          }
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                        {u.reputationScore?.toFixed(1) || '5.0'} ★
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                        {u.totalWins || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.status === 'pending' && (
                            <button className="p-2 hover:bg-green-500/10 rounded-lg" title="Verify user">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </button>
                          )}
                          {u.status !== 'banned' && (
                            <button className="p-2 hover:bg-red-500/10 rounded-lg" title="Ban user">
                              <Ban className="h-4 w-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
