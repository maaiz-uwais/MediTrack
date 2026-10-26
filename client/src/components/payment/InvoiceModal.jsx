import React, { useState, useEffect } from 'react';
import { getInvoiceData } from '../../services/paymentService';
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceModal = ({ paymentId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await getInvoiceData(paymentId);
        if (res.data.success) {
          setInvoice(res.data.invoice);
        }
      } catch {
        toast.error('Failed to load invoice receipt.');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchInvoice();
    }
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Official Clinical Receipt</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Generating tax invoice...</p>
          </div>
        ) : !invoice ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Invoice record not available.
          </div>
        ) : (
          <div id="printable-invoice" className="pt-4 space-y-6 text-slate-800">
            {/* Brand & Clinic Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                    MT
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Medi<span className="text-teal-600">Track</span>
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Digital Healthcare & Diagnostics Ltd.
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  {invoice.clinicDetails?.address}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  GSTIN: {invoice.clinicDetails?.gstin} • Tel: {invoice.clinicDetails?.phone}
                </p>
              </div>

              {/* Invoice Stamp & Metadata */}
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PAID IN FULL
                </span>
                <p className="text-base font-extrabold text-slate-900 mt-2 font-mono">
                  {invoice.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500">
                  Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Razorpay ID: {invoice.razorpayPaymentId}
                </p>
              </div>
            </div>

            {/* Billed To Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Billed Patient / Client
                </span>
                <p className="font-extrabold text-sm text-slate-900 mt-0.5">
                  {invoice.patientDetails?.name}
                </p>
                <p className="text-slate-500 mt-0.5">{invoice.patientDetails?.email}</p>
                <p className="text-slate-500 font-mono">{invoice.patientDetails?.phone}</p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Payment Verification Method
                </span>
                <p className="font-bold text-slate-800 mt-0.5">Razorpay Online Gateway (Test Mode)</p>
                <p className="text-slate-500">Currency: INR (Indian Rupees)</p>
                <p className="text-emerald-600 font-semibold flex sm:justify-end items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically Authorized
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Service Code</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.lineItems?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {item.code}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.type}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Breakdown & Totals */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
              <div className="text-slate-500 text-[11px] max-w-xs leading-relaxed">
                This is a computer-generated tax receipt issued under Indian Healthcare Regulations. Diagnostic investigations are conducted under clinical pathologist supervision.
              </div>

              <div className="w-full sm:w-60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Net Taxable Value:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>CGST (9%):</span>
                  <span>₹{invoice.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>SGST (9%):</span>
                  <span>₹{invoice.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Grand Total Paid:</span>
                  <span className="text-teal-700">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Stamp Footer */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>Receipt ID: {invoice.paymentId}</span>
              <div className="text-right">
                <p className="font-serif italic font-bold text-slate-700 text-xs">
                  Authorized Signatory
                </p>
                <p>MediTrack Clinical Billing Division</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceModal;
