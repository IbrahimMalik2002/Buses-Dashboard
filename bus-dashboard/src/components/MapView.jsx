import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useNavigate } from "react-router-dom";
// import buses from "../data/buses";                               

mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbW1hbGlrMjAwMiIsImEiOiJjbTQ4OGFsZ2YwZXIyMmlvYWI5a2lqcmRmIn0.rBsosB8v7n08Vkq1UHH_Pw';

export default function MapView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [74.3587, 31.5204], // Lahore
      zoom: 11,
    });

    mapRef.current = map;

    // Wait for style to load before adding sources/layers
    map.on("load", () => {
      buses.forEach((bus) => {
        const pointSourceId = `bus-${bus.id}-point`;
        const routeSourceId = `bus-${bus.id}-route`;

        // Add the route line
        map.addSource(routeSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: bus.route,
            },
          },
        });

        map.addLayer({
          id: routeSourceId,
          type: "line",
          source: routeSourceId,
          paint: {
            "line-color": "#1DB954",
            "line-width": 3,
          },
        });

        // Add the bus point
        map.addSource(pointSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              id: bus.id,
              name: bus.name,
              routeName: bus.routeName,
            },
            geometry: {
              type: "Point",
              coordinates: bus.route[0],
            },
          },
        });

        map.addLayer({
          id: pointSourceId,
          type: "symbol",
          source: pointSourceId,
          layout: {
            "icon-image": "bus-15", // built-in Mapbox bus icon
            "icon-size": 1.2,
            "icon-allow-overlap": true,
          },
        });

        // Handle click
        map.on("click", pointSourceId, (e) => {
          const feature = e.features?.[0];
          if (!feature) return;

          const { id, name, routeName } = feature.properties || {};
          const coords = feature.geometry?.coordinates;

          const html = `
            <div class="popup">
              <div class="popup-title">${name}</div>
              <div class="popup-sub">Route: ${routeName}</div>
              <button id="view-details" class="btn">View details →</button>
            </div>
          `;

          const popup = new mapboxgl.Popup({
            offset: 12,
            autoPan: false,
            focusAfterOpen: false,
          })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map);

          setTimeout(() => {
            const btn = document.getElementById("view-details");
            if (btn) {
              btn.onclick = () => {
                popup.remove();
                navigate(`/bus/${id}`);
              };
            }
          }, 0);
        });

        // Animate bus along its route
        let i = 0;
        function moveBus() {
          const coords = bus.route[i % bus.route.length];
          const source = map.getSource(pointSourceId);
          if (source) {
            source.setData({
              type: "Feature",
              properties: {
                id: bus.id,
                name: bus.name,
                routeName: bus.routeName,
              },
              geometry: {
                type: "Point",
                coordinates: coords,
              },
            });
          }
          i++;
          requestAnimationFrame(moveBus);
        }
        moveBus();
      });
    });

    return () => {
      map.remove();
    };
  }, [navigate]);

  return <div ref={mapContainer} className="w-full h-screen" />;
}
