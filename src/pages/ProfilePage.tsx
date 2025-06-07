import React, { useState } from 'react';
import { Mail, Copy, CheckCircle, Save } from 'lucide-react';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const ProfilePage: React.FC = () => {
  const { user, updatePreferences, logout, emailForwardingAddress } = useStore();
  const [copied, setCopied] = React.useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.preferred_currency || 'USD');
  const [isSaving, setIsSaving] = useState(false);
  
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(emailForwardingAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCurrencyUpdate = async () => {
    setIsSaving(true);
    await updatePreferences({ preferred_currency: selectedCurrency });
    setIsSaving(false);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profile info */}
        <Card title="Account Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email Address
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                {user?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Preferred Currency
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol}) - {currency.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save size={16} />}
                  onClick={handleCurrencyUpdate}
                  isLoading={isSaving}
                  className="sm:w-auto w-full"
                >
                  Save
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => logout()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Forwarding email */}
        <Card title="Your LEDGR Email">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Your Unique Forwarding Address
              </label>
              
              {/* Email display container */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all leading-relaxed">
                      {emailForwardingAddress}
                    </p>
                  </div>
                  <button
                    onClick={copyEmailToClipboard}
                    className={`flex-shrink-0 p-2 rounded-md transition-colors ${
                      copied 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                    title={copied ? 'Copied!' : 'Copy email address'}
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              
              {copied && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                  ✓ Email address copied to clipboard!
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How to use</h3>
              <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal pl-4 space-y-1">
                <li>Forward your order-related emails to the address above</li>
                <li>LEDGR will automatically extract and categorize your purchases</li>
                <li>View your spending in the dashboard and analytics</li>
                <li>Set budgets to keep your spending on track</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;