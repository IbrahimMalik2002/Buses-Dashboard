import React from 'react'


export default function BasemapControl({ value, onChange }) {
return (
<div className="basemap-control">
<label>Basemap:</label>
<select value={value} onChange={(e) => onChange(e.target.value)}>
<option value="osm">OSM</option>
<option value="dark">Dark</option>
<option value="satellite">Satellite</option>
</select>
</div>
)
}