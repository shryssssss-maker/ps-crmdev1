"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

type Task = {
  id: string
  category: string
  location: string
  priority: string
  status: string
}

const tasks: Task[] = [
  { id: "CMP-8825", category: "Water Leakage", location: "Sector 8", priority: "High", status: "Submitted" },
  { id: "CMP-8826", category: "Water Leakage", location: "Sector 8", priority: "High", status: "Assigned" },
  { id: "CMP-8827", category: "Water Leakage", location: "Sector 9", priority: "High", status: "In Progress" },
  { id: "CMP-8828", category: "Water Leakage", location: "Sector 10", priority: "High", status: "Completed" },
  { id: "CMP-8829", category: "Water Leakage", location: "Sector 12", priority: "High", status: "Rejected" },
]

function statusColor(status: string) {

  switch (status) {
    case "Assigned":
      return "bg-blue-100 text-blue-700"
    case "In Progress":
      return "bg-orange-100 text-orange-700"
    case "Completed":
      return "bg-green-100 text-green-700"
    case "Rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }

}

export default function AssignedTasksTable() {

  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!tableRef.current) return

    gsap.fromTo(
      tableRef.current.querySelectorAll("tbody tr"),
      {
        opacity: 0,
        y: 15
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out"
      }
    )

  }, [])

  return (
    <div
      ref={tableRef}
      className="bg-white border rounded-xl p-5 shadow-sm"
    >

      <h2 className="text-lg font-semibold mb-4">
        Assigned Tasks Preview
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="text-gray-500 border-b">

            <tr>
              <th className="text-left py-2">Complaint ID</th>
              <th className="text-left py-2">Category</th>
              <th className="text-left py-2">Location</th>
              <th className="text-left py-2">Priority</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Action</th>
            </tr>

          </thead>

          <tbody>

            {tasks.map((task) => (

              <tr key={task.id} className="border-b last:border-none">

                <td className="py-3">{task.id}</td>

                <td>{task.category}</td>

                <td>{task.location}</td>

                <td className="font-medium">{task.priority}</td>

                <td>

                  <span
                    className={`px-2 py-1 rounded-full text-xs ${statusColor(task.status)}`}
                  >
                    {task.status}
                  </span>

                </td>

                <td className="space-x-2">

                  <button
                    className="px-3 py-1 text-sm rounded-md border hover:bg-gray-100"
                  >
                    Start
                  </button>

                  <button
                    className="px-3 py-1 text-sm rounded-md border hover:bg-gray-100"
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}