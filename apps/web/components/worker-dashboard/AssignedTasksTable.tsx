"use client"

import Link from "next/link"
import { formatSeverity, severityClass, type DashboardTask } from "./dashboard-types"

type AssignedTasksTableProps = {
  tasks: DashboardTask[]
  loading: boolean
  error: string | null
  hasCurrentTask: boolean
  onStartTask: (complaintId: string) => Promise<void>
}

function trunc(value: string, maxChars = 44): string {
  if (value.length <= maxChars) return value
  return `${value.slice(0, maxChars - 1)}...`
}

export default function AssignedTasksTable({
  tasks,
  loading,
  error,
  hasCurrentTask,
  onStartTask,
}: AssignedTasksTableProps) {

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Assigned Tasks</h2>
        <Link href="/worker/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <p className="text-sm text-gray-500">Loading assigned tasks...</p> : null}

      {!loading && tasks.length === 0 ? <p className="text-sm text-gray-600">No pending tasks assigned.</p> : null}

      {tasks.length > 0 ? (
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="border-b text-gray-500">

              <tr>
                <th className="py-2 text-left">Complaint ID</th>
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-left">Location</th>
                <th className="py-2 text-left">Priority</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Action</th>
              </tr>

            </thead>

            <tbody>

              {tasks.map((task) => {
                const isDisabled = hasCurrentTask
                return (
                  <tr key={task.id} className="border-b last:border-none">
                    <td className="py-3">
                      <Link href={`/complaints/${task.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                        {task.ticketId}
                      </Link>
                    </td>

                    <td>{task.category}</td>

                    <td title={task.location}>{trunc(task.location)}</td>

                    <td>
                      <span className={`rounded-full border px-2 py-1 text-xs ${severityClass(task.severity)}`}>
                        {formatSeverity(task.severity)}
                      </span>
                    </td>

                    <td>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">Assigned</span>
                    </td>

                    <td className="space-x-2">
                      <Link
                        href={`/complaints/${task.id}`}
                        className="inline-block rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => onStartTask(task.id)}
                        disabled={isDisabled}
                        title={isDisabled ? "Complete your current task first." : "Start this task"}
                        className={`rounded-md border px-3 py-1 text-sm ${
                          isDisabled
                            ? "cursor-not-allowed border-gray-200 text-gray-400"
                            : "border-blue-200 text-blue-700 hover:bg-blue-50"
                        }`}
                      >
                        Start
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}