"use client"

import { useMemo } from "react"
import { useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import { markerColor, severityClass, type DashboardTask } from "./dashboard-types"

type TaskMapWidgetProps = {
  tasks: DashboardTask[]
  loading: boolean
  error: string | null
}

function createMarkerIcon(color: string): L.DivIcon {
  return new L.DivIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.25);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function FitMapToMarkers({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]))
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 })
  }, [map, points])

  return null
}

export default function TaskMapWidget({ tasks, loading, error }: TaskMapWidgetProps) {
  const mappableTasks = useMemo(
    () => tasks.filter((task) => task.latitude != null && task.longitude != null),
    [tasks],
  )

  const markerIcons = useMemo(() => {
    return new Map(mappableTasks.map((task) => [task.id, createMarkerIcon(markerColor(task.severity))]))
  }, [mappableTasks])

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Task Map</h2>

      {error ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <p className="mb-3 text-sm text-gray-500">Loading map...</p> : null}

      <div className="relative h-[260px] overflow-hidden rounded-lg">
        <MapContainer center={[28.6139, 77.209]} zoom={11} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {mappableTasks.map((task) => (
            <Marker
              key={task.id}
              position={[task.latitude as number, task.longitude as number]}
              icon={markerIcons.get(task.id) ?? createMarkerIcon(markerColor(task.severity))}
            >
              <Popup>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{task.ticketId}</p>
                  <p>{task.description.length > 80 ? `${task.description.slice(0, 77)}...` : task.description}</p>
                  <span className={`inline-block rounded-full border px-2 py-1 text-xs ${severityClass(task.severity)}`}>
                    {task.severity}
                  </span>
                  <div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded border px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      Navigate
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          <FitMapToMarkers
            points={mappableTasks.map((task) => ({ lat: task.latitude as number, lng: task.longitude as number }))}
          />
        </MapContainer>

        {!loading && mappableTasks.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/75 text-sm font-medium text-gray-600">
            No tasks to display on map.
          </div>
        ) : null}
      </div>
    </section>
  )
}
