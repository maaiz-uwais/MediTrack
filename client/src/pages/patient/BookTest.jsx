import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTests, getAllPackages } from '../../services/testService';
import { createTestBooking } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical,
  Package,
  Search,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Droplets,
  Calendar,
  Truck,
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  X
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
];

const STANDARD_SLOTS = [
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

const BookTest = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'packages'
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected items in cart
  const [selectedTests, setSelectedTests] = useState([]); // array of test objects
  const [selectedPackages, setSelectedPackages] = useState([]); // array of package objects

  // Booking Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collectionType, setCollectionType] = useState('home_collection'); // 'lab_visit' or 'home_collection'
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(STANDARD_SLOTS[1]);
  const [address, setAddress] = useState({
    street: profile?.address?.street || '',
    city: profile?.address?.city || 'Bengaluru',
    state: profile?.address?.state || 'Karnataka',
    postalCode: profile?.address?.postalCode || '',
  });

  // Success Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
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
        toast.error('Failed to load test catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    getAllTests({ category: selectedCategory, search }).then((res) => {
      if (res.data.success) setTests(res.data.tests);
    });
  };

  // Toggle selection
  const handleToggleTest = (t) => {
    const exists = selectedTests.some((item) => item._id === t._id);
    if (exists) {
      setSelectedTests((prev) => prev.filter((item) => item._id !== t._id));
      toast('Test removed from selection', { icon: '🗑️' });
    } else {
      setSelectedTests((prev) => [...prev, t]);
      toast.success(`Added ${t.name}`);
    }
  };

  const handleTogglePackage = (pkg) => {
    const exists = selectedPackages.some((item) => item._id === pkg._id);
    if (exists) {
      setSelectedPackages((prev) => prev.filter((item) => item._id !== pkg._id));
      toast('Package removed from selection', { icon: '🗑️' });
    } else {
      setSelectedPackages((prev) => [...prev, pkg]);
      toast.success(`Added ${pkg.title}`);
    }
  };

  // Pricing calculations
  const testsSubtotal = selectedTests.reduce(
    (sum, t) => sum + (t.discountPrice && t.discountPrice > 0 ? t.discountPrice : t.price),
    0
  );
  const packagesSubtotal = selectedPackages.reduce(
    (sum, p) => sum + (p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price),
    0
  );
  const homeFee = collectionType === 'home_collection' ? 150 : 0;
  const grandTotal = testsSubtotal + packagesSubtotal + homeFee;

  const totalItemsCount = selectedTests.length + selectedPackages.length;

  const handleProceedToCheckout = () => {
    if (totalItemsCount === 0) {
      toast.error('Please select at least one test or health package first.');
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        testIds: selectedTests.map((t) => t._id),
        packageIds: selectedPackages.map((p) => p._id),
        collectionType,
        scheduledDate,
        slot: selectedSlot,
        address: collectionType === 'home_collection' ? address : {},
      };

      const res = await createTestBooking(payload);
      if (res.data.success) {
        toast.success('Diagnostic test booking created successfully!');
        setConfirmedBooking(res.data.booking);
        setCheckoutModalOpen(false);
        // Reset selections
        setSelectedTests([]);
        setSelectedPackages([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white p-6 sm:p-8 shadow-xl shadow-teal-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-teal-200 mb-3">
              <FlaskConical className="w-3.5 h-3.5" /> Accredited Diagnostic Pathology
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Book Diagnostic Tests & Packages
            </h1>
            <p className="mt-1 text-sm text-teal-100/90 max-w-xl">
              Choose from 50+ laboratory investigations or bundled preventive checkups. Pick doorstep home sample collection or an express walk-in visit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-teal-200 uppercase font-bold tracking-wider block">
                NABL Accredited
              </span>
              <span className="text-sm font-extrabold text-white">100% Precision</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-teal-200 uppercase font-bold tracking-wider block">
                Home Collection
              </span>
              <span className="text-sm font-extrabold text-white">Certified Phlebotomists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-xs w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'tests'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Individual Tests ({tests.length})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'packages'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Health Packages ({packages.length})
        </button>
      </div>

      {/* ===================== TESTS TAB ===================== */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {/* Category Filter and Search Bar */}
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
                  placeholder="Search diagnostic tests..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Go
              </button>
            </form>
          </div>

          {/* Tests Grid */}
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 mt-2 font-semibold">Loading diagnostic tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80">
              <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No diagnostic tests found</p>
              <p className="text-xs text-slate-400 mt-1">Try another category or search keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((t) => {
                const isSelected = selectedTests.some((item) => item._id === t._id);
                return (
                  <div
                    key={t._id}
                    className={`bg-white rounded-3xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                          {t.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">
                          {t.code}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                        {t.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-rose-500" />
                          {t.sampleType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {t.tatHours}h report
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {t.fastingRequired ? `Fasting: ${t.fastingDurationHours || 8}h` : 'No fasting'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-slate-900">
                            ₹{t.discountPrice && t.discountPrice > 0 ? t.discountPrice : t.price}
                          </span>
                          {t.discountPrice && t.discountPrice < t.price && (
                            <span className="text-xs text-slate-400 line-through">₹{t.price}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleTest(t)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== PACKAGES TAB ===================== */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isSelected = selectedPackages.some((item) => item._id === pkg._id);
            return (
              <div
                key={pkg._id}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Health Checkup Package
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Best Value
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-3">{pkg.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      Parameters Included ({pkg.tests?.length || 0}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.tests?.map((t) => (
                        <span
                          key={t._id || t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {t.name || 'Test parameter'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500">
                    <p>
                      <strong>Recommended for:</strong> {pkg.recommendedFor}
                    </p>
                  </div>
                </div>

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
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      Save ₹{(pkg.price - (pkg.discountPrice || pkg.price)).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTogglePackage(pkg)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Select Package
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== FLOATING CART SUMMARY BAR ===================== */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/30">
              {totalItemsCount}
            </div>
            <div>
              <p className="text-xs text-slate-300">
                {selectedTests.length} Test(s) • {selectedPackages.length} Package(s)
              </p>
              <p className="text-base font-extrabold text-white">
                Total: ₹{grandTotal.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-teal-400 font-medium">
                  {collectionType === 'home_collection' ? '(Incl. Home Fee ₹150)' : '(Walk-in)'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedTests([]);
                setSelectedPackages([]);
              }}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Clear
            </button>
            <button
              onClick={handleProceedToCheckout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/30 transition-all"
            >
              Schedule Slot & Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== BOOKING & SLOT SELECTION MODAL ===================== */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Configure Sample Collection</h3>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 mt-4">
              {/* Collection Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Sample Collection Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectionType('home_collection')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      collectionType === 'home_collection'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span className="text-xs">Home Collection</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-medium block mt-1">
                      +₹150 phlebotomy fee
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionType('lab_visit')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      collectionType === 'lab_visit'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span className="text-xs">Lab Visit</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      Central diagnostic center
                    </span>
                  </button>
                </div>
              </div>

              {/* Home Address if home_collection */}
              {collectionType === 'home_collection' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-700">Sample Collection Address:</p>
                  <div>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Flat, House no., Building, Street Area"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="City"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="State"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      required
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      placeholder="Pincode"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Date & Slot Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Time Slot
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {STANDARD_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Breakdown Summary */}
              <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-200/60 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Items Subtotal:</span>
                  <span>₹{(testsSubtotal + packagesSubtotal).toLocaleString()}</span>
                </div>
                {collectionType === 'home_collection' && (
                  <div className="flex justify-between text-slate-600">
                    <span>Doorstep Phlebotomy Fee:</span>
                    <span>₹150</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-teal-200/60 text-sm">
                  <span>Total Payable:</span>
                  <span className="text-teal-700">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-60"
                >
                  {submitting ? 'Confirming...' : 'Confirm Diagnostic Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION SUCCESS MODAL ===================== */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Booking Confirmed!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your diagnostic investigation order has been scheduled.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking ID:</span>
                <span className="font-mono font-bold text-slate-800">
                  {confirmedBooking.bookingId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-slate-800">
                  {new Date(confirmedBooking.scheduledDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slot:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {confirmedBooking.collectionType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-teal-700">₹{confirmedBooking.totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  navigate('/patient/tracker');
                }}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
              >
                Track Live Sample Journey
              </button>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Book Another Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTest;
