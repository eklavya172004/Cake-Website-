'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function SplitPaymentUI({ 
  totalAmount, 
  cakeName,
  orderData,
  onPaymentLinksGenerated 
}: { 
  totalAmount: number;
  cakeName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPaymentLinksGenerated?: (links: any[]) => void;
}) {
  const router = useRouter();
  const [coPayers, setCoPayers] = useState([{ email: '', amount: totalAmount }]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generatedLinks, setGeneratedLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const addPayer = () => {
    if (coPayers.length >= 3) {
      setError('❌ Maximum 3 co-payers allowed for split payment');
      return;
    }
    setCoPayers([...coPayers, { email: '', amount: 0 }]);
    setError(''); // Clear error when adding valid payer
  };

  const removePayer = (index: number) => {
    if (coPayers.length > 1) {
      setCoPayers(coPayers.filter((_, i) => i !== index));
    }
  };

  const updatePayer = (index: number, field: string, value: string | number) => {
    const copy = [...coPayers];
    copy[index] = { ...copy[index], [field]: value };
    setCoPayers(copy);
  };

  const calculateTotal = () => {
    return coPayers.reduce((sum, payer) => sum + Number(payer.amount), 0);
  };

  const handleCreateLinks = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);
    
    // Validate minimum order amount
    if (totalAmount < 500) {
      setError('❌ Split payment only works for orders above ₹500');
      setLoading(false);
      return;
    }

    // Validate minimum users
    const validPayersWithEmails = coPayers.filter(p => p.email && p.amount > 0);
    if (validPayersWithEmails.length < 2) {
      setError('❌ Minimum 2 co-payers required for split payment');
      setLoading(false);
      return;
    }

    // Validate maximum users
    if (validPayersWithEmails.length > 3) {
      setError('❌ Maximum 3 co-payers allowed for split payment');
      setLoading(false);
      return;
    }
    
    // Validate total amount matches
    const total = calculateTotal();
    if (Math.abs(total - totalAmount) > 0.01) {
      setError(`❌ Total amounts must equal ₹${totalAmount.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/split-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          totalAmount, 
          coPayers: validPayersWithEmails, 
          orderId: `ORDER-${Date.now()}`,
          cakeName,
          orderData: orderData // Pass full order info to create order after payment
        }),
      });
      const data = await res.json();
      
      if (data.success && data.links && data.coPaymentId) {
        setGeneratedLinks(data.links);
        setSuccess(true);
        
        // Store coPaymentId for tracking
        sessionStorage.setItem('coPaymentId', data.coPaymentId);
        
        onPaymentLinksGenerated?.(data.links);
        
        // ✅ Redirect to tracking page after 2 seconds using coPaymentId
        setTimeout(() => {
          console.log('Redirecting to split payment tracking:', data.coPaymentId);
          router.push(`/split-payment-status/${data.coPaymentId}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to generate links');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error generating payment links');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-linear-to-br from-pink-50 to-purple-50 rounded-lg shadow-lg p-6 border border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-pink-600" size={24} />
        <h2 className="text-2xl font-bold text-pink-700">Split Payment</h2>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
        <p className="font-semibold mb-1">How it works:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Add 2-3 co-payers and their payment amounts</li>
          <li>Minimum order amount: ₹500</li>
          <li>Click &quot;Generate &amp; Send Payment Links&quot;</li>
          <li>Payment links will be emailed to each person</li>
          <li>Once all payments are received, your order will be confirmed</li>
        </ol>
        <p className="mt-2 pt-2 border-t border-blue-300 text-xs font-semibold">📋 Rules: 2-3 co-payers required • Order must be ≥₹500</p>
      </div>
      
      {totalAmount < 500 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded flex gap-2 items-start">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="text-sm"><strong>⚠️ Note:</strong> Split payment requires minimum order of ₹500. Current order: ₹{totalAmount.toFixed(2)}</span>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex gap-2 items-start">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex gap-2 items-start">
          <CheckCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">✅ Payment links sent successfully!</p>
            <p className="text-sm mt-1">🔄 Redirecting to payment tracker...</p>
            <p className="text-xs mt-2">You&apos;ll be able to track each co-payer&apos;s payment status in real-time.</p>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {coPayers.map((payer, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input 
                type="email"
                placeholder="friend@example.com"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={payer.email}
                onChange={(e) => updatePayer(i, 'email', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={payer.amount}
                onChange={(e) => updatePayer(i, 'amount', parseFloat(e.target.value) || 0)}
              />
            </div>
            {coPayers.length > 1 && (
              <button
                type="button"
                onClick={() => removePayer(i)}
                className="p-2 hover:bg-red-100 rounded text-red-600"
                title="Remove this co-payer"
                aria-label="Remove co-payer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4 p-3 bg-white rounded border border-gray-200">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Total:</span>
          <span className={`font-bold ${Math.abs(calculateTotal() - totalAmount) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{calculateTotal().toFixed(2)} / ₹{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <button 
        type="button"
        onClick={addPayer}
        disabled={coPayers.length >= 3}
        className="w-full mb-3 text-pink-600 font-semibold py-2 rounded border-2 border-pink-600 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title={coPayers.length >= 3 ? 'Maximum 3 co-payers allowed' : 'Add another co-payer'}
      >
        + Add Co-Payer {coPayers.length < 3 && `(${coPayers.length}/3)`}
      </button>

      <button 
        type="button"
        onClick={handleCreateLinks}
        disabled={loading || totalAmount < 500}
        className="w-full bg-linear-to-r from-pink-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition shadow-md"
        title={totalAmount < 500 ? 'Order must be at least ₹500 for split payment' : ''}
      >
        {loading ? 'Generating Links...' : 'Generate & Send Payment Links'}
      </button>
      
      {generatedLinks.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded border border-green-300">
          <h3 className="font-bold text-green-700 mb-3">✓ Payment links sent!</h3>
          <p className="text-sm text-gray-600 mb-3">
            Payment links have been sent to all co-payers. The order will be placed once all payments are received.
          </p>
          <div className="space-y-2">
            {generatedLinks.map((link, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                <p className="text-gray-600 mb-1">Link {idx + 1}:</p>
                <a 
                  href={link.short_url || link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {link.short_url || link.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
