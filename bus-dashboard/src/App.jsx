import React from "react"
import MapView from "./components/MapView"

export default function App() {
  return (
    <div className="app">
      <div className="sidebar">
        <h2>🚌 Lahore Bus Dashboard</h2>
        <p>Click on any bus to view details</p>
      </div>
      <MapView />
    </div>
  )
}
