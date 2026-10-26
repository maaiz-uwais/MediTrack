import React, { useState, useEffect } from 'react';
import {
  getAllTests,
  createTest,
  updateTest,
  deleteTest,
  getAllPackages,
  createPackage,
  deletePackage,
} from '../../services/testService';
import {
  FlaskConical,
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Droplets,
  AlertCircle,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Pathology',
  'Biochemistry',
  'Hematology',
  'Microbiology',
  'Radiology',
  'Cardiology',
  'Endocrinology',
  'Immunology',
];

const TestPackageManagement = () => {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'packages'
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState({
    name: '',
    code: '',
    category: 'Pathology',
    description: '',
    price: 500,
    discountPrice: 400,
    sampleType: 'Blood',
    fastingRequired: false,
    fastingDurationHours: 0,
    tatHours: 24,
    precautions: 'No special precautions required.',
  });

  // Package Modal State
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({
    title: '',
    price: 1500,
    discountPrice: 999,
    description: '',
    recommendedFor: 'Adults of all ages',
    fastingRequired: true,
    tests: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsRes, packagesRes] = await Promise.all([
        getAllTests({ category: selectedCategory, search }),
        getAllPackages(),
      ]);
      if (testsRes.data.success) setTests(testsRes.data.tests);
      if (packagesRes.data.success) setPackages(packagesRes.data.packages);
    } catch {
      toast.error('Failed to load diagnostics catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Test CRUD handlers
  const handleOpenAddTest = () => {
    setEditingTest(null);
    setTestForm({
      name: '',
      code: `TEST-${Date.now().toString().slice(-4)}`,
      category: 'Pathology',
      description: '',
      price: 500,
      discountPrice: 400,
      sampleType: 'Blood',
      fastingRequired: false,
      fastingDurationHours: 0,
      tatHours: 24,
      precautions: 'No special precautions required.',
    });
    setTestModalOpen(true);
  };

  const handleOpenEditTest = (t) => {
    setEditingTest(t);
    setTestForm({
      name: t.name,
      code: t.code,
      category: t.category,
      description: t.description,
      price: t.price,
      discountPrice: t.discountPrice || t.price,
      sampleType: t.sampleType,
      fastingRequired: t.fastingRequired,
      fastingDurationHours: t.fastingDurationHours || 0,
      tatHours: t.tatHours,
      precautions: t.precautions || '',
    });
    setTestModalOpen(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        const res = await updateTest(editingTest._id, testForm);
        if (res.data.success) {
          toast.success(res.data.message);
          setTestModalOpen(false);
          fetchData();
        }
      } else {
        const res = await createTest(testForm);
        if (res.data.success) {
          toast.success(res.data.message);
          setTestModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test.');
    }
  };

  const handleDeleteTest = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      const res = await deleteTest(id);
      if (res.data.success) {
        toast.success(res.data.message);
        setTests((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete test.');
    }
  };

  // Package CRUD handlers
  const handleOpenAddPackage = () => {
    setPackageForm({
      title: '',
      price: 1500,
      discountPrice: 999,
      description: '',
      recommendedFor: 'Adults of all ages seeking comprehensive checkups',
      fastingRequired: true,
      tests: tests.slice(0, 3).map((t) => t._id),
    });
    setPackageModalOpen(true);
  };

  const handleTogglePackageTest = (testId) => {
    setPackageForm((prev) => {
      const exists = prev.tests.includes(testId);
      if (exists) {
        return { ...prev, tests: prev.tests.filter((id) => id !== testId) };
      } else {
        return { ...prev, tests: [...prev.tests, testId] };
      }
    });
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (packageForm.tests.length === 0) {
      toast.error('Please select at least one test to bundle in this package.');
      return;
    }
    try {
      const res = await createPackage(packageForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setPackageModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create package.');
    }
  };

  const handleDeletePackage = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete package '${title}'?`)) return;
    try {
      const res = await deletePackage(id);
      if (res.data.success) {
        toast.success(res.data.message);
        setPackages((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete package.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Catalog & Pricing Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure laboratory investigations, bundle discounted health packages, and manage sample collection rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'tests' ? (
            <button
              onClick={handleOpenAddTest}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Diagnostic Test
            </button>
          ) : (
            <button
              onClick={handleOpenAddPackage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Health Package
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-xs w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'tests'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Individual Tests ({tests.length})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'packages'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Bundled Packages ({packages.length})
        </button>
      </div>

      {/* ===================== TESTS TAB ===================== */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {/* Category Filter & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tests..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Go
              </button>
            </form>
          </div>

          {/* Tests Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Test Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Sample / Fasting</th>
                    <th className="py-3.5 px-4">Turnaround</th>
                    <th className="py-3.5 px-4">Price (₹)</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {tests.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-slate-800">{t.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.code}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-700">{t.sampleType}</p>
                        <p className="text-[11px] text-slate-400">
                          {t.fastingRequired ? `Fasting: ${t.fastingDurationHours || 8}h` : 'No Fasting'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" /> {t.tatHours} hrs
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">₹{t.discountPrice || t.price}</span>
                        {t.discountPrice && t.discountPrice < t.price && (
                          <span className="ml-1.5 text-[11px] text-slate-400 line-through">
                            ₹{t.price}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditTest(t)}
                          className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                          title="Edit Test"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(t._id, t.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete Test"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PACKAGES TAB ===================== */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Health Bundle
                  </span>
                  <button
                    onClick={() => handleDeletePackage(pkg._id, pkg.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-3">{pkg.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>

                {/* Tests included */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Included Tests ({pkg.tests?.length || 0}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.tests?.map((t) => (
                      <span
                        key={t._id || t}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {t.name || 'Test Parameter'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  <p>
                    <strong>Ideal for:</strong> {pkg.recommendedFor}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      ₹{pkg.discountPrice || pkg.price}
                    </span>
                    {pkg.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">₹{pkg.price}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Save ₹{(pkg.price - (pkg.discountPrice || pkg.price)).toLocaleString()}
                  </span>
                </div>

                <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== ADD / EDIT TEST MODAL ===================== */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTest ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}
              </h3>
              <button
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                    placeholder="e.g. Serum Calcium"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Test Code
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                    placeholder="e.g. TEST-CAL-01"
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Sample Type
                  </label>
                  <select
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Serum">Serum</option>
                    <option value="Swab">Swab</option>
                    <option value="Stool">Stool</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={testForm.discountPrice}
                    onChange={(e) => setTestForm({ ...testForm, discountPrice: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    TAT (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={testForm.tatHours}
                    onChange={(e) => setTestForm({ ...testForm, tatHours: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Clinical significance and parameters tested..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={testForm.fastingRequired}
                    onChange={(e) =>
                      setTestForm({ ...testForm, fastingRequired: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  Fasting Required Before Sample
                </label>

                {testForm.fastingRequired && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Duration:</span>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={testForm.fastingDurationHours}
                      onChange={(e) =>
                        setTestForm({ ...testForm, fastingDurationHours: e.target.value })
                      }
                      className="w-16 p-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center"
                    />
                    <span className="text-xs text-slate-500">hours</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
                >
                  {editingTest ? 'Save Changes' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CREATE PACKAGE MODAL ===================== */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Health Package Bundle</h3>
              <button
                onClick={() => setPackageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Package Title
                </label>
                <input
                  type="text"
                  required
                  value={packageForm.title}
                  onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                  placeholder="e.g. Master Vitality Wellness"
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Standard Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Discounted Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={packageForm.discountPrice}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, discountPrice: e.target.value })
                    }
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description & Recommended Audience
                </label>
                <textarea
                  rows={2}
                  required
                  value={packageForm.description}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, description: e.target.value })
                  }
                  placeholder="Comprehensive profile covering liver, kidney, and cardiovascular health..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Multi-test Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Select Included Diagnostic Tests ({packageForm.tests.length} chosen)
                </label>
                <div className="max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50 space-y-1.5">
                  {tests.map((t) => {
                    const isChecked = packageForm.tests.includes(t._id);
                    return (
                      <div
                        key={t._id}
                        onClick={() => handleTogglePackageTest(t._id)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <span>{t.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {t.code} • {t.category}
                          </span>
                        </div>
                        <span className="font-bold">₹{t.discountPrice || t.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPackageManagement;
