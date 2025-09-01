import React, { useState } from 'react'
import MapView from './components/MapView'
import BasemapControl from './components/BasemapControl'


export default function App() {
const [basemap, setBasemap] = useState('dark')


return (
<div className="app dark">
<header className="app-header">
<div className="branding">🚌 Lahore Bus Dashboard</div>
<div className="header-controls">
<BasemapControl value={basemap} onChange={setBasemap} />
</div>
</header>


<main className="main-grid">
<section className="panel map-panel">
<MapView basemap={basemap} />
</section>
<section className="panel stats-panel">
<h2>Fleet Snapshot</h2>
<div className="stats-grid">
<div className="stat-card"><div className="stat-title">Buses Active</div><div className="stat-value">7</div></div>
<div className="stat-card"><div className="stat-title">Avg. Speed</div><div className="stat-value">38 km/h</div></div>
<div className="stat-card"><div className="stat-title">Km Today</div><div className="stat-value">1,240</div></div>
<div className="stat-card"><div className="stat-title">Fuel Today</div><div className="stat-value">680 L</div></div>
</div>
<p className="hint">Click a bus on the map → see its route → “View details”.</p>
</section>
</main>


<footer className="app-footer">
<span>Basemaps © OpenStreetMap, CARTO, Esri | Demo data for development only</span>
</footer>
</div>
)
}