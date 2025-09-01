
// ---------------- src/data/buses.js ----------------
// Dummy routes (rough sample coordinates around Lahore roads)
// Each routeCoords array is [lng, lat].
export const buses = [
  {
    id: 1,
    name: 'Bus 101',
    routeName: 'Canal Rd – Jail Rd',
    loopMs: 70000,
    startOffsetMs: 0,
    routeCoords: [
      [74.2739, 31.4826], [74.2915, 31.4995], [74.3122, 31.5079], [74.3309, 31.5129], [74.3521, 31.5175],
      [74.3678, 31.5207], [74.3859, 31.5234], [74.4042, 31.5252], [74.4206, 31.5261]
    ],
    metrics: baseMetrics({ model: 'Hino AK8J', driver: 'Ali Raza', depot: 'Canal Depot' })
  },
  {
    id: 2,
    name: 'Bus 202',
    routeName: 'Ferozepur Rd – Kalma',
    loopMs: 60000,
    startOffsetMs: 8000,
    routeCoords: [
      [74.3097, 31.4965], [74.3228, 31.4978], [74.3344, 31.5032], [74.3447, 31.5099], [74.3564, 31.5132],
      [74.3660, 31.5151], [74.3748, 31.5175]
    ],
    metrics: baseMetrics({ model: 'Yutong ZK6122', driver: 'Zeeshan', depot: 'Kalma Chowk' })
  },
  {
    id: 3,
    name: 'Bus 303',
    routeName: 'Ring Rd – DHA',
    loopMs: 90000,
    startOffsetMs: 12000,
    routeCoords: [
      [74.4025, 31.4744], [74.3907, 31.4868], [74.3784, 31.4997], [74.3685, 31.5095], [74.3567, 31.5208]
    ],
    metrics: baseMetrics({ model: 'Volvo B11R', driver: 'Hammad', depot: 'DHA' })
  },
  {
    id: 4,
    name: 'Bus 404',
    routeName: 'Mall Rd – Lakshmi',
    loopMs: 65000,
    startOffsetMs: 20000,
    routeCoords: [
      [74.3176, 31.5590], [74.3279, 31.5507], [74.3398, 31.5462], [74.3507, 31.5451], [74.3616, 31.5455]
    ],
    metrics: baseMetrics({ model: 'Daewoo BV120MA', driver: 'Usman', depot: 'Mall Road' })
  },
  {
    id: 5,
    name: 'Bus 505',
    routeName: 'Johar Town – Expo',
    loopMs: 50000,
    startOffsetMs: 5000,
    routeCoords: [
      [74.2703, 31.4626], [74.2833, 31.4705], [74.2952, 31.4786], [74.3099, 31.4851], [74.3255, 31.4896]
    ],
    metrics: baseMetrics({ model: 'Higer KLQ', driver: 'Ammar', depot: 'Johar Town' })
  },
  {
    id: 6,
    name: 'Bus 606',
    routeName: 'Metrobus Mainline',
    loopMs: 80000,
    startOffsetMs: 15000,
    routeCoords: [
      [74.2329, 31.4967], [74.2487, 31.5039], [74.2689, 31.5086], [74.2912, 31.5121], [74.3156, 31.5154],
      [74.3398, 31.5188], [74.3617, 31.5212]
    ],
    metrics: baseMetrics({ model: 'Yutong U12', driver: 'Bilal', depot: 'Metro HQ' })
  },
  {
    id: 7,
    name: 'Bus 707',
    routeName: 'Barki Rd – Airport',
    loopMs: 75000,
    startOffsetMs: 3000,
    routeCoords: [
      [74.4479, 31.5376], [74.4324, 31.5203], [74.4157, 31.5073], [74.4019, 31.4985]
    ],
    metrics: baseMetrics({ model: 'Mercedes OC500', driver: 'Javed', depot: 'Airport' })
  },
]

function baseMetrics({ model, driver, depot }) {
  return {
    model,
    year: 2021,
    mileage: 185000,
    kmDriven: 245600,
    kmpl: 2.8,
    dieselToday: 18500,
    dieselMonthly: 540000,
    maintenanceMonthly: 120000,
    lastService: '2025-08-15',
    nextService: '2025-09-30',
    assetValue: 28500000,
    driver,
    shift: 'Morning',
    depot,
    contact: '+92-300-0000000',
    compliance: 'Fit (All checks OK)',
    notes: 'Operating normally. No incidents reported. Tire rotation due next service.'
  }
}