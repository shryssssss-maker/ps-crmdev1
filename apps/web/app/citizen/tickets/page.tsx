"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database.types";

type ComplaintRow = Database["public"]["Tables"]["complaints"]["Row"];
type TicketListRow = Pick<
  ComplaintRow,
  "id" | "ticket_id" | "title" | "address_text" | "assigned_department" | "status" | "created_at" | "upvote_count"
>;

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

function formatReportedTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function extractRelevantAddress(fullAddress: string | null | undefined): string {
  if (!fullAddress) return "Address unavailable";
  const beforeGPS = fullAddress.split("|")[0].trim();
  const lines = beforeGPS
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 100);
  return lines.slice(0, 3).join(", ") || beforeGPS;
}

export default function CitizenTicketsPage() {
  const [tickets, setTickets] = useState<TicketListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citizenId, setCitizenId] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapCitizen = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        setError("Unable to identify citizen account.");
        setLoading(false);
        return;
      }

      setCitizenId(user.id);
    };

    void bootstrapCitizen();
  }, []);

  useEffect(() => {
    if (!citizenId) return;

    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      const { data, error: ticketError } = await supabase
        .from("complaints")
        .select("id, ticket_id, title, address_text, assigned_department, status, created_at, upvote_count")
        .eq("citizen_id", citizenId)
        .order("created_at", { ascending: false });

      if (ticketError) {
        setError("Failed to load tickets.");
        setLoading(false);
        return;
      }

      setTickets((data ?? []) as TicketListRow[]);
      setLoading(false);
    };

    const toTicketRow = (row: ComplaintRow): TicketListRow => ({
      id: row.id,
      ticket_id: row.ticket_id,
      title: row.title,
      address_text: row.address_text,
      assigned_department: row.assigned_department,
      status: row.status,
      created_at: row.created_at,
      upvote_count: row.upvote_count,
    });

    void fetchTickets();

    const channel = supabase
      .channel(`citizen-ticket-list-${citizenId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${citizenId}`,
        },
        (payload) => {
          const incoming = toTicketRow(payload.new as ComplaintRow);
          setTickets((prev) => {
            const withoutDuplicate = prev.filter((item) => item.id !== incoming.id);
            return [incoming, ...withoutDuplicate];
          });
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
          const incoming = toTicketRow(payload.new as ComplaintRow);
          setTickets((prev) => prev.map((item) => (item.id === incoming.id ? incoming : item)));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "complaints",
          filter: `citizen_id=eq.${citizenId}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id?: string }).id;
          if (!deletedId) return;
          setTickets((prev) => prev.filter((item) => item.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [citizenId]);

  return (
    <div className="w-full h-screen flex flex-col px-4 sm:px-6 py-6">
      <header className="mb-4">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">Your Tickets</h1>
        <p className="mt-1 text-sm text-gray-600">Track all complaints you have reported in one list.</p>
      </header>

      <section className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <div className="min-w-[980px] flex flex-col flex-1">
            <div className="sticky top-0 z-10 grid grid-cols-[150px_2fr_2fr_1.2fr_1fr_1fr_100px] gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Ticket ID</span>
              <span>Issue Title</span>
              <span>Locality / Address</span>
              <span>Assigned Department</span>
              <span>Status</span>
              <span>Reported Time</span>
              <span className="text-right">Upvotes</span>
            </div>

            {loading && (
              <div className="px-5 py-8 text-sm text-gray-500">Loading tickets...</div>
            )}

            {!loading && error && (
              <div className="px-5 py-8 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && tickets.length === 0 && (
              <div className="px-5 py-8 text-sm text-gray-500">No tickets reported yet.</div>
            )}

            {!loading && !error && tickets.length > 0 && (
              <ul className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                {tickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="grid grid-cols-[150px_2fr_2fr_1.2fr_1fr_1fr_100px] gap-3 px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 font-mono text-xs sm:text-sm truncate">
                      {ticket.ticket_id || "N/A"}
                    </span>

                    <span className="text-gray-900 font-medium line-clamp-2 leading-snug">
                      {ticket.title || "Untitled issue"}
                    </span>

                    <span className="text-gray-600 line-clamp-1 leading-snug cursor-pointer" title={ticket.address_text || "Address unavailable"}>
                      {extractRelevantAddress(ticket.address_text) || "Address unavailable"}
                    </span>

                    <span className="text-gray-700 line-clamp-2 leading-snug">
                      {ticket.assigned_department || "Unassigned"}
                    </span>

                    <span>
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClasses(ticket.status || "")}`}>
                        {formatStatus(ticket.status || "submitted")}
                      </span>
                    </span>

                    <span className="text-gray-500 text-xs sm:text-sm">
                      {formatReportedTime(ticket.created_at)}
                    </span>

                    <span className="inline-flex items-center justify-end gap-1 text-gray-700 font-medium">
                      <ArrowUp size={14} className="text-gray-400" />
                      {ticket.upvote_count ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
