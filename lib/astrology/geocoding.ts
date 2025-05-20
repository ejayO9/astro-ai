// A simple utility to get coordinates for cities
// In a production app, you would use a geocoding API like Google Maps, Mapbox, etc.

interface Coordinates {
  latitude: number
  longitude: number
}

// Sample database of major Indian cities
const INDIAN_CITIES: Record<string, Coordinates> = {
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  "new delhi": { latitude: 28.6139, longitude: 77.209 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  kanpur: { latitude: 26.4499, longitude: 80.3319 },
  nagpur: { latitude: 21.1458, longitude: 79.0882 },
  indore: { latitude: 22.7196, longitude: 75.8577 },
  thane: { latitude: 19.2183, longitude: 72.9781 },
  bhopal: { latitude: 23.2599, longitude: 77.4126 },
  visakhapatnam: { latitude: 17.6868, longitude: 83.2185 },
  patna: { latitude: 25.5941, longitude: 85.1376 },
  vadodara: { latitude: 22.3072, longitude: 73.1812 },
  ghaziabad: { latitude: 28.6692, longitude: 77.4538 },
  ludhiana: { latitude: 30.901, longitude: 75.8573 },
  agra: { latitude: 27.1767, longitude: 78.0081 },
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  surat: { latitude: 21.1702, longitude: 72.8311 },
  coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  guwahati: { latitude: 26.1445, longitude: 91.7362 },
  chandigarh: { latitude: 30.7333, longitude: 76.7794 },
  thiruvananthapuram: { latitude: 8.5241, longitude: 76.9366 },
  trivandrum: { latitude: 8.5241, longitude: 76.9366 },
}

// Default coordinates for India (New Delhi)
const DEFAULT_COORDINATES: Coordinates = { latitude: 28.6139, longitude: 77.209 }

export async function getCityCoordinates(city: string, country: string): Promise<Coordinates> {
  // Normalize city name
  const normalizedCity = city.toLowerCase().trim()

  // For India, use our predefined database
  if (country.toLowerCase().includes("india")) {
    return INDIAN_CITIES[normalizedCity] || DEFAULT_COORDINATES
  }

  // For other countries, in a real app you would call a geocoding API
  // For now, return default coordinates
  console.warn(`Geocoding for ${city}, ${country} not implemented. Using default coordinates.`)
  return DEFAULT_COORDINATES
}
