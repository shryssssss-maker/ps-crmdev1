"use client"

import { formatDistance, formatSeverity, severityClass, type DashboardTask } from "./dashboard-types"

type UrgentTaskCardProps = {
  task: DashboardTask | null
  loading: boolean
  error: string | null
  onStartWork: (complaintId: string) => Promise<void>
}

export default function UrgentTaskCard({ task, loading, error, onStartWork }: UrgentTaskCardProps) {
  const mapsUrl =
    task?.latitude != null && task?.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`
      : null

  return (
    <section className="rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-orange-800">Urgent Task</h2>
        {task ? (
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${severityClass(task.severity)}`}>
            {formatSeverity(task.severity)}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <p className="text-sm text-orange-900/70">Loading urgent task...</p> : null}

      {!loading && !task ? <p className="text-sm text-orange-900/80">No urgent tasks. You&apos;re all caught up.</p> : null}

      {task ? (
        <div className="space-y-4 text-sm text-orange-950">
          <p>
            <span className="font-medium">Complaint ID:</span> {task.ticketId}
          </p>
          <p>
            <span className="font-medium">Category:</span> {task.category}
          </p>
          <p>
            <span className="font-medium">Description:</span> {task.description}
          </p>
          <p>
            <span className="font-medium">Location:</span> {task.location}
          </p>
          <p>
            <span className="font-medium">Distance:</span> {formatDistance(task.distanceKm)}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onStartWork(task.id)}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
            >
              Start Work
            </button>
            <a
              href={mapsUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`rounded-lg border px-4 py-2 text-sm ${
                mapsUrl
                  ? "border-orange-300 text-orange-900 hover:bg-orange-100"
                  : "cursor-not-allowed border-gray-300 text-gray-400"
              }`}
              onClick={(event) => {
                if (!mapsUrl) event.preventDefault()
              }}
            >
              Navigate
            </a>
          </div>
        </div>
      ) : null}
    </section>
  )
}