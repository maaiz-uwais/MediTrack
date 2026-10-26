import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import api from '../../services/api';
import { Bell, CheckCircle2, Clock, AlertCircle, X, ExternalLink } from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Backend route may not be reached if no notifications yet
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:pl-64 transition-all">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Slide-over Notification Panel */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setNotificationsOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">
                      You do not have any pending healthcare alerts or messages.
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id || item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        !item.isRead
                          ? 'bg-teal-50/50 border-teal-200/80 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
