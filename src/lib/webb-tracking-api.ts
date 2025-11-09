/**
 * Webb Tracking API Integration
 * Fetches real-time spacecraft telemetry from NASA's "Where is Webb?" service
 */

export interface WebbTelemetry {
  // Orbital position
  distanceEarthKm: number
  distanceEarthMiles: number
  distanceL2Km: number
  distanceL2Miles: number

  // Velocity
  velocityKmS: number
  velocityMph: number

  // Temperatures (Kelvin)
  tempC: {
    tempWarmSide1C: number
    tempWarmSide2C: number
    tempCoolSide1C: number
    tempCoolSide2C: number
  }

  // Coordinates
  sunEarthMoonAngle: number

  // Timestamp
  time: string
  isLive: boolean
}

const WEBB_API_URL = 'https://webb.nasa.gov/content/webbLaunch/flightCurrentState2.0.json'
const CACHE_DURATION = 60000 // 1 minute cache

let cachedData: WebbTelemetry | null = null
let lastFetch = 0

/**
 * Fetch real-time Webb spacecraft telemetry
 */
export async function fetchWebbTelemetry(): Promise<WebbTelemetry> {
  const now = Date.now()

  // Return cached data if still fresh
  if (cachedData && now - lastFetch < CACHE_DURATION) {
    return cachedData
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // Use CORS proxy for development to bypass NASA's CORS restrictions
    const proxyUrl = import.meta.env.PROD
      ? WEBB_API_URL
      : `https://corsproxy.io/?${encodeURIComponent(WEBB_API_URL)}`

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Webb API returned ${response.status}`)
    }

    const data = await response.json()

    // Parse the NASA JSON format
    const telemetry: WebbTelemetry = {
      distanceEarthKm: parseFloat(data.distanceEarthKm) || 0,
      distanceEarthMiles: parseFloat(data.distanceEarthMiles) || 0,
      distanceL2Km: parseFloat(data.distanceL2Km) || 0,
      distanceL2Miles: parseFloat(data.distanceL2Miles) || 0,
      velocityKmS: parseFloat(data.velocityKmS) || 0,
      velocityMph: parseFloat(data.velocityMph) || 0,
      tempC: {
        tempWarmSide1C: parseFloat(data.tempC?.tempWarmSide1C) || 0,
        tempWarmSide2C: parseFloat(data.tempC?.tempWarmSide2C) || 0,
        tempCoolSide1C: parseFloat(data.tempC?.tempCoolSide1C) || 0,
        tempCoolSide2C: parseFloat(data.tempC?.tempCoolSide2C) || 0,
      },
      sunEarthMoonAngle: parseFloat(data.sunEarthMoonAngle) || 0,
      time: data.time || new Date().toISOString(),
      isLive: true,
    }

    cachedData = telemetry
    lastFetch = now

    return telemetry
  } catch (error) {
    console.warn('⚠️ Failed to fetch Webb telemetry, using fallback:', error)

    // Return fallback data if API fails
    const fallback: WebbTelemetry = {
      distanceEarthKm: 1500000,
      distanceEarthMiles: 932000,
      distanceL2Km: 250000,
      distanceL2Miles: 155000,
      velocityKmS: 0.1,
      velocityMph: 224,
      tempC: {
        tempWarmSide1C: 15,
        tempWarmSide2C: 18,
        tempCoolSide1C: -233,
        tempCoolSide2C: -230,
      },
      sunEarthMoonAngle: 85,
      time: new Date().toISOString(),
      isLive: false,
    }

    return fallback
  }
}

/**
 * Convert Celsius to Kelvin
 */
export function celsiusToKelvin(celsius: number): number {
  return celsius + 273.15
}

/**
 * Format distance with appropriate units
 */
export function formatDistance(km: number): string {
  if (km < 1000) {
    return `${km.toFixed(0)} km`
  } else if (km < 1000000) {
    return `${(km / 1000).toFixed(2)} thousand km`
  } else {
    return `${(km / 1000000).toFixed(2)} million km`
  }
}

/**
 * Calculate light-time distance (how long light takes to travel)
 */
export function calculateLightTime(km: number): string {
  const lightSeconds = km / 299792.458 // speed of light in km/s

  if (lightSeconds < 60) {
    return `${lightSeconds.toFixed(1)} light-seconds`
  } else if (lightSeconds < 3600) {
    return `${(lightSeconds / 60).toFixed(1)} light-minutes`
  } else {
    return `${(lightSeconds / 3600).toFixed(2)} light-hours`
  }
}

/**
 * Get status color based on temperature
 */
export function getTemperatureStatus(
  tempC: number,
  isWarmSide: boolean
): 'nominal' | 'warning' | 'critical' {
  if (isWarmSide) {
    // Warm side should be around 0-30°C
    if (tempC >= -10 && tempC <= 40) return 'nominal'
    if (tempC >= -20 && tempC <= 50) return 'warning'
    return 'critical'
  } else {
    // Cool side should be around -233°C
    if (tempC >= -235 && tempC <= -230) return 'nominal'
    if (tempC >= -240 && tempC <= -225) return 'warning'
    return 'critical'
  }
}
