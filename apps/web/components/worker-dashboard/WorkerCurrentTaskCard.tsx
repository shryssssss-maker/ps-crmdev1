"use client"

import { useMemo } from "react"
import { formatDistance, formatSeverity, severityClass, type DashboardTask } from "./dashboard-types"

type CurrentTaskCardProps = {
  task: DashboardTask | null
  loading: boolean
  error: string | null
  onUpdateProgress: (complaintId: string, note: string) => Promise<void>
  onMarkCompleted: (complaintId: string) => Promise<void>
}

export default function CurrentTaskCard({
  task,
  loading,
  error,
  onUpdateProgress,
  onMarkCompleted,
}: CurrentTaskCardProps) {
  const mapsUrl = useMemo(() => {
    if (task?.latitude == null || task?.longitude == null) return null
    return `https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`
  }, [task?.latitude, task?.longitude])

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Current Task</h2>
        {task ? (
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${severityClass(task.severity)}`}>
            {formatSeverity(task.severity)}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <p className="text-sm text-gray-500">Loading current task...</p> : null}

      {!loading && !task ? (
        <p className="text-sm text-gray-600">
          No task currently in progress.
          <br />
          Start a task from the list below.
        </p>
      ) : null}

      {task ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
            <p>
              <span className="font-medium text-gray-900">Complaint ID:</span> {task.ticketId}
            </p>
            <p>
              <span className="font-medium text-gray-900">Category:</span> {task.category}
            </p>
            <p className="md:col-span-2">
              <span className="font-medium text-gray-900">Description:</span> {task.description}
            </p>
            <p className="md:col-span-2">
              <span className="font-medium text-gray-900">Location:</span> {task.location}
            </p>
            <p>
              <span className="font-medium text-gray-900">Distance:</span> {formatDistance(task.distanceKm)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={mapsUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                mapsUrl ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-gray-300"
              }`}
              onClick={(event) => {
                if (!mapsUrl) event.preventDefault()
              }}
            >
              Navigate
            </a>

            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={async () => {
                if (!task) return
                const note = window.prompt("Add progress note")?.trim() ?? ""
                if (!note) return
                await onUpdateProgress(task.id, note)
              }}
            >
              Update Progress
            </button>

            <button
              type="button"
              onClick={() => onMarkCompleted(task.id)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Mark Completed
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
