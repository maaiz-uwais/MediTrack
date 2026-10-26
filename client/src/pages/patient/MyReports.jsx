import React, { useState, useEffect } from 'react';
import { getMyReports } from '../../services/reportService';
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getMyReports({ search });
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch {
      toast.error('Failed to load lab reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Laboratory Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access, view, and download certified clinical pathology and biochemistry investigation reports.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
          Available Reports: {reports.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Report ID, test name, or parameter..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
          />
        </form>
      </div>

      {/* Reports Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Retrieving signed reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No laboratory reports available</p>
            <p className="text-xs text-slate-400 mt-1">
              Once the lab completes processing your sample, authorized PDF reports will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((r) => (
              <div
                key={r._id}
                className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                        #{r.reportId}
                      </span>
                      {r.criticalFlag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" /> Attention Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Normal Ranges
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                      {r.fileName || 'Diagnostic Report.pdf'}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(r.uploadedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Authorized by Chief Pathologist</span>
                    </p>

                    {r.summary && (
                      <p className="text-xs text-slate-600 mt-1 italic max-w-xl">
                        "{r.summary}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <a
                    href={r.fileUrl || '/uploads/sample_diagnostic_report.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> View & Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
