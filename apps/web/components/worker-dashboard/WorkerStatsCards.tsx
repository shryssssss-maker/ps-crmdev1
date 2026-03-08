"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import type { DashboardStats } from "./dashboard-types"

type WorkerStatsCardsProps = {
  stats: DashboardStats
  error: string | null
}

type CardMetric = {
  label: string
  icon: string
  urgent?: boolean
}

const cards: CardMetric[] = [
  { label: "Tasks Today", icon: "📋" },
  { label: "Pending", icon: "⭕" },
  { label: "Completed Today", icon: "✅" },
  { label: "Urgent", icon: "🔥", urgent: true },
]

export default function WorkerStatsCards({ stats, error }: WorkerStatsCardsProps) {

  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!cardsRef.current) return

    gsap.fromTo(
      cardsRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }
    )

  }, [stats])

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card, index) => {
          const value =
            card.label === "Tasks Today"
              ? stats.tasksToday
              : card.label === "Pending"
                ? stats.pending
                : card.label === "Completed Today"
                  ? stats.completedToday
                  : stats.urgent

          return (
          <div
            key={index}
            className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
              card.urgent ? "border-red-200 bg-red-50" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${
                  card.urgent ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                {card.icon}
              </div>

              <div>
                <div className="text-sm text-gray-500">{card.label}</div>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}