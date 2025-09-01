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
      },
      center: LAHORE,
      zoom: 11.5,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    map.on("load", () => {
      // add basemap
      setBasemap(map, basemap);

      // Add all routes and bus points
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
          type: "circle",
          source: pointSourceId,
          paint: {
            "circle-radius": 8,
            "circle-color": "#ffd666",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#141414",
          },
        });

        // Add hover effects
        map.on("mouseenter", pointSourceId, () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", pointSourceId, () => {
          map.getCanvas().style.cursor = "";
        });
      });

      // Fit bounds to show all routes
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
        console.warn("fitBounds failed", err);
      }

      // Start animations after everything is loaded
      buses.forEach((bus) => {
        animateBus(map, bus);
      });

      // Add global click handler for all bus points (this will catch moving buses)
      map.on("click", (e) => {
        // Stop the default map behavior immediately
        e.preventDefault();
        e.originalEvent?.preventDefault();
        e.originalEvent?.stopPropagation();

        // Check if we clicked on any bus point layer
        const features = map.queryRenderedFeatures(e.point, {
          layers: buses.map((bus) => `point-${bus.id}`),
        });

        if (features.length > 0) {
          // Prevent map panning/zooming
          map.dragPan.disable();
          map.scrollZoom.disable();
          map.boxZoom.disable();
          map.dragRotate.disable();
          map.keyboard.disable();
          map.doubleClickZoom.disable();

          const feature = features[0];
          const { id, name, routeName } = feature.properties || {};
          const coords = e.lngLat.toArray();

          console.log("Global click - Clicked bus:", {
            id,
            name,
            routeName,
            coords,
          });

          // Find the full bus data
          const busData = buses.find((b) => String(b.id) === String(id));
          if (!busData) {
            console.log("Bus data not found for id:", id);
            // Re-enable map interactions
            setTimeout(() => {
              map.dragPan.enable();
              map.scrollZoom.enable();
              map.boxZoom.enable();
              map.dragRotate.enable();
              map.keyboard.enable();
              map.doubleClickZoom.enable();
            }, 100);
            return;
          }

          // Remove any existing popups
          document.querySelectorAll(".maplibregl-popup").forEach((popup) => {
            popup.remove();
          });

          const popupHTML = `
            <div class="popup" style="min-width: 250px; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
              <div class="popup-title" style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #333;">${name}</div>
              <div class="popup-sub" style="color: #666; margin-bottom: 12px;">Route: ${routeName}</div>
              <div class="popup-details" style="margin-bottom: 12px;">
                <div class="popup-detail" style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Driver:</strong> ${busData.metrics.driver}</div>
                <div class="popup-detail" style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Model:</strong> ${busData.metrics.model}</div>
                <div class="popup-detail" style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Depot:</strong> ${busData.metrics.depot}</div>
              </div>
              <button id="view-details-${id}" class="btn" style="
                background: #13c2c2; 
                color: white; 
                padding: 8px 16px; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 14px;
                width: 100%;
                transition: background-color 0.2s;
              " onmouseover="this.style.background='#0fb8b8'" onmouseout="this.style.background='#13c2c2'">View Details →</button>
            </div>
          `;

          const popup = new maplibregl.Popup({
            offset: [0, -25],
            closeButton: true,
            closeOnClick: false,
            closeOnMove: false,
            maxWidth: "300px",
            anchor: "bottom",
          })
            .setLngLat(coords)
            .setHTML(popupHTML)
            .addTo(map);

          // Re-enable map interactions when popup closes
          popup.on("close", () => {
            map.dragPan.enable();
            map.scrollZoom.enable();
            map.boxZoom.enable();
            map.dragRotate.enable();
            map.keyboard.enable();
            map.doubleClickZoom.enable();
          });

          // Add button click handler after popup is added
          setTimeout(() => {
            const btn = document.getElementById(`view-details-${id}`);
            if (btn) {
              console.log("Adding click handler to button");
              btn.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log("Navigating to bus details:", id);
                popup.remove();
                // Re-enable map interactions before navigation
                map.dragPan.enable();
                map.scrollZoom.enable();
                map.boxZoom.enable();
                map.dragRotate.enable();
                map.keyboard.enable();
                map.doubleClickZoom.enable();
                navigate(`/bus/${id}`);
              };
            } else {
              console.log("Button not found in DOM");
            }
          }, 50);

          // Re-enable map interactions after a short delay as backup
          setTimeout(() => {
            map.dragPan.enable();
            map.scrollZoom.enable();
            map.boxZoom.enable();
            map.dragRotate.enable();
            map.keyboard.enable();
            map.doubleClickZoom.enable();
          }, 200);
        }
      });
    });

    mapRef.current = map;
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      map.remove();
    };
  }, [navigate]);

  // React to basemap changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    setBasemap(map, basemap);
  }, [basemap]);

  // Animate bus along its route
  function animateBus(map, bus) {
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
      const distKm = Math.min(
        lengthKm * fraction,
        Math.max(0, lengthKm - 1e-6)
      );

      let pt = null;
      try {
        pt = turf.along(line, distKm, { units: "kilometers" });
      } catch (err) {
        console.warn("turf.along error", err);
        return;
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

  // Set basemap function
  function setBasemap(map, key) {
    const conf = BASEMAPS[key] || BASEMAPS.dark;

    try {
      if (map.getLayer("basemap")) map.removeLayer("basemap");
      if (map.getSource("basemap")) map.removeSource("basemap");
    } catch (e) {
      // Ignore errors when removing non-existent layers
    }

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
