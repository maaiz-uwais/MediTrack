import React, { useState, useEffect } from 'react';
import { getAllPayments, refundPayment } from '../../services/adminService';
import {
  CreditCard,
  Search,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  FileText,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalVolume, setTotalVolume] = useState(0);
  const [refundedVolume, setRefundedVolume] = useState(0);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPayments();
      if (res.data.success) {
        setPayments(res.data.payments || []);
        setTotalVolume(res.data.totalVolume || 0);
        setRefundedVolume(res.data.refundedVolume || 0);
      }
    } catch {
      toast.error('Failed to load transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId, amount) => {
    if (!window.confirm(`Initiate full refund of ₹${amount} for this transaction?`)) return;
    try {
      const res = await refundPayment(paymentId);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed.');
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.paymentId?.toLowerCase().includes(q) ||
      p.razorpayOrderId?.toLowerCase().includes(q) ||
      p.patient?.name?.toLowerCase().includes(q) ||
      p.patient?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Razorpay Transactions & Financial Audits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time digital payment reconciliation, automated invoicing, and refund administration.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Gross Volume</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{totalVolume.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total captured collections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Transactions</span>
          <p className="text-2xl font-bold text-teal-600 mt-2">{payments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Diagnostic tests & doctor visits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Refunds Disbursed</span>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            ₹{refundedVolume.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Cancelled & disputed payments</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Payment ID, Order ID, or Patient..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Showing {filteredPayments.length} of {payments.length}
        </span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Loading ledger...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No transactions recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                      {p.paymentId}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Order: {p.razorpayOrderId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{p.patient?.name || 'Guest Patient'}</p>
                      <p className="text-slate-400 text-[11px]">{p.patient?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {p.bookingType === 'TestBooking' ? 'Diagnostic Test' : 'Doctor Consult'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.status === 'Captured' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Captured
                        </span>
                      ) : p.status === 'Refunded' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                          <RotateCcw className="w-3 h-3" /> Refunded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {p.status === 'Captured' && (
                        <button
                          onClick={() => handleRefund(p._id, p.amount)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Disburse Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
