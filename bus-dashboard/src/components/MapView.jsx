// src/components/MapView.jsx
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
import { buses } from "../data/buses";
import { useNavigate } from "react-router-dom";

const LAHORE = [74.3587, 31.5204];

// Basemap definitions (raster tile sources)
const BASEMAPS = {
  osm: {
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap contributors",
  },
  dark: {
    tiles: [
      "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    ],
    attribution: "© OpenStreetMap, © CARTO",
  },
  satellite: {
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Source: Esri, Maxar, Earthstar Geographics",
  },
};

export default function MapView({ basemap = "dark" }) {
  const mapRef = useRef(null);
  const frameRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: {},
        layers: [],
        // glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center: LAHORE,
      zoom: 11.5,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    map.on("load", () => {
      // add basemap (no 'before' layer so we avoid referencing missing layer ids)
      setBasemap(map, basemap);

      // Add bus emoji as text symbol - no need for image loading

      // add routes & points
      buses.forEach((bus, idx) => {
        const routeSourceId = `route-${bus.id}`;
        const pointSourceId = `point-${bus.id}`;

        // Add route source + line layer
        map.addSource(routeSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: bus.routeCoords },
            properties: { id: bus.id },
          },
        });
        map.addLayer({
          id: routeSourceId,
          type: "line",
          source: routeSourceId,
          paint: {
            "line-color": "#13c2c2",
            "line-width": 3,
            "line-opacity": 0.7,
          },
        });

        // Add point source + circle layer (start position)
        const start =
          Array.isArray(bus.routeCoords) && bus.routeCoords.length
            ? bus.routeCoords[0]
            : LAHORE;
        map.addSource(pointSourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: start },
                properties: {
                  id: bus.id,
                  name: bus.name,
                  routeName: bus.routeName,
                },
              },
            ],
          },
        });
        map.addLayer({
          id: pointSourceId,
          type: "symbol",
          source: pointSourceId,
          layout: {
            "text-field": "🚌",
            "text-size": 24,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "text-anchor": "center",
          },
        });

        map.on(
          "mouseenter",
          pointSourceId,
          () => (map.getCanvas().style.cursor = "pointer")
        );
        map.on(
          "mouseleave",
          pointSourceId,
          () => (map.getCanvas().style.cursor = "")
        );
        map.on("click", pointSourceId, (e) => {
          e.preventDefault();
          e.stopPropagation();

          const feature = e.features?.[0];
          if (!feature) return;

          const { id, name, routeName } = feature.properties || {};
          const coords = feature.geometry?.coordinates || start;

          // Find the full bus data
          const busData = buses.find((b) => b.id === id);
          if (!busData) return;

          const html = `
    <div class="popup">
      <div class="popup-title">${name}</div>
      <div class="popup-sub">Route: ${routeName}</div>
      <div class="popup-details">
        <div class="popup-detail">Driver: ${busData.metrics.driver}</div>
        <div class="popup-detail">Model: ${busData.metrics.model}</div>
        <div class="popup-detail">Depot: ${busData.metrics.depot}</div>
      </div>
      <button id="view-details-${id}" class="btn">View details →</button>
    </div>
  `;

          const popup = new maplibregl.Popup({
            offset: [0, -25],
            closeButton: true,
            closeOnClick: false,
            closeOnMove: false,
            autoPan: false,
            focusAfterOpen: false,
            maxWidth: "300px",
          })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map);

          setTimeout(() => {
            const btn = document.getElementById(`view-details-${id}`);
            if (btn) {
              btn.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();
                popup.remove();
                navigate(`/bus/${id}`);
              };
            }
          }, 0);
        });

        // animate this bus
        animateBus(map, bus);
      });

      // Fit bounds: build a proper FeatureCollection of LineStrings
      try {
        const features = buses
          .filter(
            (b) => Array.isArray(b.routeCoords) && b.routeCoords.length > 0
          )
          .map((b) => ({
            type: "Feature",
            geometry: { type: "LineString", coordinates: b.routeCoords },
            properties: {},
          }));
        if (features.length) {
          const fc = { type: "FeatureCollection", features };
          const bbox = turf.bbox(fc);
          map.fitBounds(
            [
              [bbox[0], bbox[1]],
              [bbox[2], bbox[3]],
            ],
            { padding: 40, duration: 800 }
          );
        }
      } catch (err) {
        // don't block startup if bbox fails
        console.warn("fitBounds failed", err);
      }
    });

    mapRef.current = map;
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      map.remove();
    };
  }, []);

  // react to basemap changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    setBasemap(map, basemap);
  }, [basemap]);

  // animate bus along its route (robust guards)
  function animateBus(map, bus) {
    // build a turf line; guard invalid coords
    if (!Array.isArray(bus.routeCoords) || bus.routeCoords.length < 2) return;

    const line = turf.lineString(bus.routeCoords);
    let lengthKm = 0;
    try {
      lengthKm = turf.length(line, { units: "kilometers" });
    } catch (err) {
      console.warn("turf.length error for bus", bus.id, err);
      return;
    }
    if (!isFinite(lengthKm) || lengthKm <= 0) return;

    const durationMs = bus.loopMs || 60_000;
    const startTs = performance.now() + (bus.startOffsetMs || 0);
    const pointSourceId = `point-${bus.id}`;

    const step = () => {
      const now = performance.now();
      const elapsed = (now - startTs) % durationMs;
      const fraction = Math.max(0, Math.min(1, elapsed / durationMs));
      // clamp distance slightly under lengthKm to avoid potential turf edge-cases
      const distKm = Math.min(
        lengthKm * fraction,
        Math.max(0, lengthKm - 1e-6)
      );
      let pt = null;
      try {
        pt = turf.along(line, distKm, { units: "kilometers" });
      } catch (err) {
        // in case turf.along errors for weird distance, fallback to start or end
        console.warn("turf.along error", err);
      }

      if (pt && pt.geometry && Array.isArray(pt.geometry.coordinates)) {
        const source = map.getSource(pointSourceId);
        if (source && typeof source.setData === "function") {
          const data = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: pt.geometry,
                properties: {
                  id: bus.id,
                  name: bus.name,
                  routeName: bus.routeName,
                },
              },
            ],
          };
          source.setData(data);
        }
      }

      frameRef.current = requestAnimationFrame(step);
    };
    step();
  }

  // set basemap without referencing a non-existing layer id
  function setBasemap(map, key) {
    const conf = BASEMAPS[key] || BASEMAPS.dark;

    try {
      if (map.getLayer("basemap")) map.removeLayer("basemap");
      if (map.getSource("basemap")) map.removeSource("basemap");
    } catch {}

    map.addSource("basemap", {
      type: "raster",
      tiles: conf.tiles,
      tileSize: 256,
      attribution: conf.attribution,
    });

    // Find the first non-basemap layer to insert basemap before it
    const layers = map.getStyle().layers;
    const firstDataLayer = layers.find((layer) => layer.id !== "basemap");

    if (firstDataLayer) {
      map.addLayer(
        { id: "basemap", type: "raster", source: "basemap" },
        firstDataLayer.id
      );
    } else {
      map.addLayer({ id: "basemap", type: "raster", source: "basemap" });
    }
  }

  return <div id="map" className="map" />;
}
