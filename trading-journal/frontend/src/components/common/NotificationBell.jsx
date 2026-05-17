// components/common/NotificationBell.jsx
import React, { useState, useEffect } from "react";
import { notificationService } from "../../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await notificationService.getAll();
        setNotifications(data.data);
        setUnread(data.unreadCount);
      } catch {}
    };
    fetch();
    // Vérifie les nouvelles notifs toutes les 60 secondes
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAll = async () => {
    await notificationService.markRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-dark-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent-red text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
              <span className="text-white font-medium text-sm">Notifications</span>
              {unread > 0 && (
                <button onClick={markAll} className="text-accent-green text-xs hover:underline">
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-dark-400 text-sm text-center py-8">Aucune notification</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-dark-700 hover:bg-dark-700 transition-colors ${!n.isRead ? "bg-dark-700/50" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-accent-green mt-1.5 flex-shrink-0" />}
                      <div className={!n.isRead ? "" : "pl-3.5"}>
                        <p className="text-white text-xs font-medium">{n.title}</p>
                        <p className="text-dark-400 text-xs mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
