import React from "react"
import { useParams, Link } from "react-router-dom"
import { buses } from "../data/buses"

export default function BusDetails() {
  const { id } = useParams()
  const bus = buses.find((b) => b.id === id)

  if (!bus) return <div>Bus not found</div>

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{bus.name} - {bus.routeName}</h2>
      <p><strong>Mileage:</strong> {bus.mileage}</p>
      <p><strong>KMs Driven:</strong> {bus.kmsDriven}</p>
      <p><strong>Maintenance:</strong> {bus.maintenance}</p>
      <p><strong>Diesel Costs:</strong> {bus.dieselCosts}</p>
      <p><strong>Value:</strong> {bus.value}</p>
      <Link to="/">← Back to map</Link>
    </div>
  )
}
