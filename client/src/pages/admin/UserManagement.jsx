import React, { useState, useEffect } from 'react';
import { getAllUsers, toggleBlockUser, deleteUser } from '../../services/adminService';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  FlaskConical,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers({
        role: roleFilter,
        status: statusFilter,
        search,
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch {
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleBlock = async (userId, userName) => {
    try {
      const res = await toggleBlockUser(userId);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.data.isBlocked } : u))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    try {
      const res = await deleteUser(deleteModalUser._id);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers((prev) => prev.filter((u) => u._id !== deleteModalUser._id));
        setDeleteModalUser(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Stethoscope className="w-3 h-3" /> Doctor
          </span>
        );
      case 'lab_staff':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <FlaskConical className="w-3 h-3" /> Lab Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
            <HeartPulse className="w-3 h-3" /> Patient
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage account status, enforce security suspensions, and oversee all platform participants.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
          Total Users: {users.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'patient', 'doctor', 'lab_staff', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Approval</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-slate-400 text-[11px]">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">{getRoleBadge(item.role)}</td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {item.phone || 'N/A'}
                    </td>

                    {/* Blocked / Active Status */}
                    <td className="py-3.5 px-4">
                      {item.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          <Lock className="w-2.5 h-2.5" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Unlock className="w-2.5 h-2.5" /> Active
                        </span>
                      )}
                    </td>

                    {/* Doctor Approval Status */}
                    <td className="py-3.5 px-4">
                      {item.role === 'doctor' ? (
                        item.isApproved ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Approved
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            Pending Review
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5">
                      {item.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleBlock(item._id, item.name)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.isBlocked
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            }`}
                            title={item.isBlocked ? 'Reactivate Account' : 'Suspend Account'}
                          >
                            {item.isBlocked ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setDeleteModalUser(item)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Delete User Account?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-700">{deleteModalUser.name}</strong>? All profile data, medical history, and bookings will be disassociated.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
