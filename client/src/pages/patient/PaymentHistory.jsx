import React, { useState, useEffect } from 'react';
import { getMyPayments } from '../../services/paymentService';
import RazorpayCheckoutModal from '../../components/payment/RazorpayCheckoutModal';
import InvoiceModal from '../../components/payment/InvoiceModal';
import {
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeCheckoutItem, setActiveCheckoutItem] = useState(null);
  const [activeInvoicePaymentId, setActiveInvoicePaymentId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getMyPayments();
      if (res.data.success) {
        setPayments(res.data.payments || []);
        setPendingItems(res.data.pendingItems || []);
      }
    } catch {
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCheckoutSuccess = (paymentRecord) => {
    setActiveCheckoutItem(null);
    fetchPayments();
    // Open invoice immediately for the patient to view/print
    if (paymentRecord?._id) {
      setActiveInvoicePaymentId(paymentRecord._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Payment History & Billing Invoices
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review digital Razorpay receipts, complete pending consultations, and download official medical tax invoices.
        </p>
      </div>

      {/* Pending Checkouts Section */}
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Pending Checkouts ({pendingItems.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingItems.map((item) => (
              <div
                key={item.bookingId}
                className="bg-white rounded-3xl border border-amber-300 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {item.bookingCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Payment Required
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2.5 line-clamp-1">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono">{item.slot}</span>
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Payable Amount
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveCheckoutItem(item)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Pay with Razorpay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Transactions Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" /> Completed Transactions & Receipts
        </h3>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Loading billing history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No payment receipts found</p>
              <p className="text-xs text-slate-400 mt-1">
                Completed transactions will generate official tax receipts here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-6 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <span className="font-mono font-bold text-slate-800 block">
                          {p.invoiceNumber || p.paymentId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {p.paymentId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 truncate max-w-xs">
                          {p.receiptDetails?.description ||
                            `${p.bookingType === 'TestBooking' ? 'Diagnostic Test' : 'Doctor Consultation'}`}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Razorpay: {p.razorpayOrderId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.status === 'Captured' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Captured
                          </span>
                        ) : p.status === 'Refunded' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <RotateCcw className="w-3 h-3" /> Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            {p.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(p.invoiceDate || p.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => setActiveInvoicePaymentId(p._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-all shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      {activeCheckoutItem && (
        <RazorpayCheckoutModal
          bookingId={activeCheckoutItem.bookingId}
          bookingType={activeCheckoutItem.bookingType}
          amount={activeCheckoutItem.amount}
          title={activeCheckoutItem.title}
          onClose={() => setActiveCheckoutItem(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Invoice Viewer Modal */}
      {activeInvoicePaymentId && (
        <InvoiceModal
          paymentId={activeInvoicePaymentId}
          onClose={() => setActiveInvoicePaymentId(null)}
        />
      )}
    </div>
  );
};

export default PaymentHistory;
