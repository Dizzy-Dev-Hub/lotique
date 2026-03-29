'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  CreditCard, 
  Plus, 
  History, 
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { usersApi } from '@/services/api';
import { Button, Card, Input, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

const DEPOSIT_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function WalletPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/wallet');
      return;
    }
    loadWalletData();
  }, [isAuthenticated, router]);

  const loadWalletData = async () => {
    try {
      const userData = await usersApi.getMe();
      setWalletBalance(userData.walletBalance || 0);
      // Mock transactions for now
      setTransactions([
        { id: 1, type: 'deposit', amount: 1000, date: new Date(Date.now() - 86400000), status: 'completed' },
        { id: 2, type: 'hold', amount: -500, date: new Date(Date.now() - 172800000), status: 'pending', auction: 'Diamond Ring' },
      ]);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const handleDeposit = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 100) {
      alert('Minimum deposit is $100');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await usersApi.addFunds(amount);
      setWalletBalance(result.walletBalance);
      setShowSuccess(true);
      setSelectedAmount(null);
      setCustomAmount('');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add funds');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-8 w-8 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              My Wallet
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            Manage your funds for bidding on exclusive auctions
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-400">Funds added successfully!</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Balance Card */}
          <Card className="p-6 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-bg-secondary)]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Available Balance</p>
                <p className="text-4xl font-bold text-[var(--color-primary)]">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl">
                <Wallet className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Shield className="h-4 w-4" />
              <span>Secured with bank-level encryption</span>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Verification</span>
                <Badge variant={user?.status === 'verified' ? 'success' : 'warning'}>
                  {user?.status === 'verified' ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Bidder ID</span>
                <span className="text-[var(--color-text-primary)] font-mono">
                  #{user?.bidderNumber?.toString().padStart(3, '0') || '000'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Total Wins</span>
                <span className="text-[var(--color-text-primary)]">{user?.totalWins || 0}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Add Funds Section */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[var(--color-primary)]" />
            Add Funds
          </h3>

          <div className="space-y-6">
            {/* Preset Amounts */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                Select Amount
              </label>
              <div className="grid grid-cols-5 gap-3">
                {DEPOSIT_AMOUNTS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-4 rounded-lg border text-center transition-all ${
                      selectedAmount === amount
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Or Enter Custom Amount
              </label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    min={100}
                    className="pl-8"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Minimum deposit: $100
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                Payment Method
              </label>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <CreditCard className="h-5 w-5" />
                  Credit Card
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Crypto (Coming Soon)
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleDeposit}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedAmount || customAmount ? formatCurrency(selectedAmount || parseFloat(customAmount) || 0) : 'Funds'}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-[var(--color-text-muted)]">
              By adding funds, you agree to our terms of service. Funds are held securely and can be withdrawn at any time.
            </p>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--color-primary)]" />
            Recent Transactions
          </h3>

          {transactions.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-tertiary)]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'deposit' 
                        ? 'bg-green-500/20' 
                        : tx.type === 'hold'
                        ? 'bg-yellow-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className={`h-4 w-4 text-green-500`} />
                      ) : (
                        <ArrowUpRight className={`h-4 w-4 ${tx.type === 'hold' ? 'text-yellow-500' : 'text-red-500'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-[var(--color-text-primary)] font-medium">
                        {tx.type === 'deposit' ? 'Deposit' : tx.type === 'hold' ? 'Bid Hold' : 'Payment'}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {tx.auction || new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-500' : 'text-[var(--color-text-primary)]'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                    </p>
                    <Badge 
                      variant={tx.status === 'completed' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
