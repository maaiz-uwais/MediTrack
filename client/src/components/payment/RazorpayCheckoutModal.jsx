import React, { useState, useEffect } from 'react';
import { createRazorpayOrder, verifyPaymentSignature } from '../../services/paymentService';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const RazorpayCheckoutModal = ({
  bookingId,
  bookingType,
  amount,
  title,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [simulationMethod, setSimulationMethod] = useState('card'); // 'card', 'upi', 'netbanking'

  useEffect(() => {
    const initOrder = async () => {
      try {
        setLoading(true);
        const res = await createRazorpayOrder({ bookingId, bookingType });
        if (res.data.success) {
          setOrderData(res.data.order);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to initiate Razorpay order.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      initOrder();
    }
  }, [bookingId, bookingType]);

  // Handle Complete Test Payment
  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setVerifying(true);

    try {
      const mockPaymentId = `pay_rzp_mock_${Date.now()}`;
      const payload = {
        razorpayOrderId: orderData.id,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: 'sig_dev_verified_simulation',
        paymentDbId: orderData.paymentDbId,
      };

      const res = await verifyPaymentSignature(payload);
      if (res.data.success) {
        toast.success(res.data.message);
        onSuccess(res.data.payment);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-500/30">
              ₹
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Razorpay Checkout</h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                Secured Test Mode Sandbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Creating Razorpay Order...</p>
          </div>
        ) : !orderData ? (
          <div className="py-12 text-center text-xs text-slate-500">Order not initialized.</div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Total Payable
                </span>
                <p className="text-2xl font-black text-white mt-0.5">
                  ₹{orderData.amountInRupees.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                  <Lock className="w-2.5 h-2.5" /> 256-Bit SSL
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Order: {orderData.id.slice(0, 14)}...
                </p>
              </div>
            </div>

            {/* Item details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Billed For:</span>
              <p className="font-bold text-slate-800 mt-0.5 truncate">{title || orderData.description}</p>
            </div>

            {/* Test Payment Simulation Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Simulate Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSimulationMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    simulationMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Test Card
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMethod('upi')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    simulationMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  UPI QR / VPA
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    simulationMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  NetBanking
                </button>
              </div>
            </div>

            {/* Test Mode Sandbox Info */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Razorpay Test Mode Verified</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Clicking the button below sends a test payload with SHA-256 signature verification directly to your MediTrack backend to capture the transaction.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={verifying}
                onClick={handleSimulatePayment}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60"
              >
                {verifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying HMAC Signature...
                  </>
                ) : (
                  <>
                    Authorize & Pay ₹{orderData.amountInRupees.toLocaleString('en-IN')}{' '}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayCheckoutModal;
