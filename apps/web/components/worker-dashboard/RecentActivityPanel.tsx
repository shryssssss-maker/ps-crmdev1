"use client"

import { relativeTime, type ActivityItem } from "./dashboard-types"

type RecentActivityPanelProps = {
  items: ActivityItem[]
  loading: boolean
  error: string | null
}

export default function RecentActivityPanel({ items, loading, error }: RecentActivityPanelProps) {

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">

      <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <p className="text-sm text-gray-500">Loading recent activity...</p> : null}

      {!loading && items.length === 0 ? <p className="text-sm text-gray-600">No recent activity.</p> : null}

      {items.length > 0 ? (
        <div className="space-y-4">

          {items.map((activity) => (

            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />

              <div className="flex-1">
                <p className="text-sm text-gray-700">{activity.text}</p>
                <span className="text-xs text-gray-400">{relativeTime(activity.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}