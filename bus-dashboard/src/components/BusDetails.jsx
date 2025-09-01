
// ---------------- src/pages/BusDetails.jsx ----------------
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { buses } from '../data/buses'

export default function BusDetails() {
  const { id } = useParams()
  const bus = buses.find((b) => String(b.id) === String(id))
  if (!bus) {
    return (
      <div className="details-page dark">
        <div className="details-header">
          <Link className="btn" to="/">← Back</Link>
          <h1>Bus not found</h1>
        </div>
      </div>
    )
  }

  const metrics = bus.metrics

  return (
    <div className="details-page dark">
      <div className="details-header">
        <Link className="btn" to="/">← Back</Link>
        <div>
          <h1>{bus.name}</h1>
          <div className="sub">Route: {bus.routeName}</div>
        </div>
      </div>

      <section className="grid-2">
        <div className="card">
          <h3>Overview</h3>
          <ul className="kv">
            <li><span>Bus ID</span><b>{bus.id}</b></li>
            <li><span>Model</span><b>{metrics.model}</b></li>
            <li><span>Year</span><b>{metrics.year}</b></li>
            <li><span>Mileage</span><b>{metrics.mileage.toLocaleString()} km</b></li>
            <li><span>Odometer</span><b>{metrics.kmDriven.toLocaleString()} km</b></li>
            <li><span>Avg. Fuel Economy</span><b>{metrics.kmpl} km/L</b></li>
          </ul>
        </div>
        <div className="card">
          <h3>Costs & Maintenance</h3>
          <ul className="kv">
            <li><span>Diesel Today</span><b>Rs {metrics.dieselToday.toLocaleString()}</b></li>
            <li><span>Diesel (Monthly)</span><b>Rs {metrics.dieselMonthly.toLocaleString()}</b></li>
            <li><span>Maintenance (Monthly)</span><b>Rs {metrics.maintenanceMonthly.toLocaleString()}</b></li>
            <li><span>Last Service</span><b>{metrics.lastService}</b></li>
            <li><span>Next Service Due</span><b>{metrics.nextService}</b></li>
            <li><span>Asset Value</span><b>Rs {metrics.assetValue.toLocaleString()}</b></li>
          </ul>
        </div>
      </section>

      <section className="card">
        <h3>Driver & Ops</h3>
        <ul className="kv">
          <li><span>Driver</span><b>{metrics.driver}</b></li>
          <li><span>Shift</span><b>{metrics.shift}</b></li>
          <li><span>Depot</span><b>{metrics.depot}</b></li>
          <li><span>Contact</span><b>{metrics.contact}</b></li>
          <li><span>Compliance</span><b>{metrics.compliance}</b></li>
        </ul>
      </section>

      <section className="card">
        <h3>Notes</h3>
        <p>{metrics.notes}</p>
      </section>
    </div>
  )
}
