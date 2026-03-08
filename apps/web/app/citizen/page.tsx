"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import ChatContainer from "@/components/dashboard/ChatContainer";
import RecentTickets from "@/components/dashboard/RecentTickets";
import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database.types";

type ComplaintRow = Database["public"]["Tables"]["complaints"]["Row"];
type NotificationRow = Pick<ComplaintRow, "id" | "title" | "status" | "citizen_id" | "created_at" | "updated_at">;

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function statusClasses(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "submitted") return "bg-amber-100 text-amber-700";
  if (normalized === "assigned") return "bg-blue-100 text-blue-700";
  if (normalized === "in_progress" || normalized === "under_review") return "bg-purple-100 text-purple-700";
  if (normalized === "resolved") return "bg-green-100 text-green-700";
  if (normalized === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [citizenId, setCitizenId] = useState<string | null>(null);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    const bootstrapCitizen = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user?.id) {
        setCitizenId(null);
        setNotificationLoading(false);
        return;
      }
      setCitizenId(userData.user.id);
    };

    void bootstrapCitizen();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!citizenId) return;

    const fetchNotifications = async () => {
      setNotificationLoading(true);
      setNotificationError(null);

      const { data, error } = await supabase
        .from("complaints")
        .select("id, title, status, citizen_id, created_at, updated_at")
        .eq("citizen_id", citizenId)
        .order("updated_at", { ascending: false })
        .limit(6);

      if (error) {
        setNotificationError("Failed to load updates");
        setNotificationLoading(false);
        return;
      }

      setNotifications((data ?? []) as NotificationRow[]);
      setNotificationLoading(false);
    };

    const mergeIncoming = (incoming: NotificationRow) => {
      setNotifications((prev) => {
        const withoutCurrent = prev.filter((item) => item.id !== incoming.id);
        return [incoming, ...withoutCurrent].slice(0, 6);
      });

      if (!isNotificationOpen) {
        setHasUnreadUpdates(true);
      }
    };

    void fetchNotifications();

    const channel = supabase
      .channel(`citizen-notifications-${citizenId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${citizenId}`,
        },
        (payload) => {
          mergeIncoming(payload.new as NotificationRow);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${citizenId}`,
        },
        (payload) => {
          mergeIncoming(payload.new as NotificationRow);
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [citizenId, isNotificationOpen]);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => {
      const nextValue = !prev;
      if (nextValue) {
        setHasUnreadUpdates(false);
      }
      return nextValue;
    });
    setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
    setIsNotificationOpen(false);
  };

  return (
    <div className="w-full h-full">
      <div className="flex w-full flex-col h-full">
        {/* Dashboard Header - Full width with right-aligned controls */}
        <div className="flex w-full items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h1 className="heading-1 text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 truncate">
              JanSamadhan AI Assistant
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              Report an issue quickly, then track what happened next.
            </p>
          </div>

          <div className="relative hidden sm:flex items-center gap-2">
            <div ref={notificationMenuRef} className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-expanded={isNotificationOpen}
                onClick={toggleNotifications}
                className="relative h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Bell size={18} className="mx-auto" />
                {hasUnreadUpdates && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              {isNotificationOpen && (
                <div
                  role="menu"
                  aria-label="Notifications"
                  className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
                >
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Latest Updates
                  </p>

                  <div className="max-h-72 overflow-y-auto">
                    {notificationLoading ? (
                      <p className="px-2 py-3 text-sm text-gray-500">Loading updates...</p>
                    ) : notificationError ? (
                      <p className="px-2 py-3 text-sm text-red-600">{notificationError}</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-gray-500">No recent updates</p>
                    ) : (
                      notifications.slice(0, 6).map((notification) => (
                        <div
                          key={notification.id}
                          role="menuitem"
                          className="rounded-lg px-2 py-2 hover:bg-gray-50"
                        >
                          <p className="line-clamp-1 text-sm font-medium text-gray-900">
                            {notification.title || "Untitled issue"}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusClasses(notification.status || "")}`}
                          >
                            {formatStatus(notification.status || "submitted")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={toggleProfileMenu}
                className="h-10 rounded-full border border-gray-200 bg-white px-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <UserCircle2 size={18} />
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProfileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Expands to fill available space */}
        <div className="flex-1 px-4 sm:px-6 overflow-y-auto">
          <div className="mt-6 sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileChatOpen(true)}
              className="w-full rounded-xl border border-[#b4725a]/30 bg-white px-4 py-4 text-left shadow-sm transition-colors hover:border-[#b4725a] dark:border-purple-500/40 dark:bg-gray-900"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Open AI Assistant
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Start or continue your complaint conversation.
              </p>
            </button>
          </div>

          <div className="mt-6 hidden sm:block">
            <ChatContainer className="w-full max-h-[calc(100vh-24rem)] h-[28rem] lg:max-h-[calc(100vh-22rem)] lg:h-[30rem]" />
          </div>

          <section className="mt-8 w-full pb-6 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 rounded-t-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Recent Tickets
            </h2>
            <span className="text-xs text-gray-500">
              Latest activity
            </span>
          </div>

            <RecentTickets />
          </section>
        </div>
      </div>

      {isMobileChatOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-[1px]"
            onClick={() => setIsMobileChatOpen(false)}
          />
          <div className="absolute inset-0 flex flex-col bg-gray-50 p-3 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  JanSamadhan AI Assistant
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile full-screen chat</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ChatContainer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}