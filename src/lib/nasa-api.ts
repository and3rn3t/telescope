import { JWSTImage } from './types'

const NASA_API_BASE = import.meta.env.VITE_NASA_API_BASE || 'https://images-api.nasa.gov'
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY
const USE_API_KEY = import.meta.env.VITE_ENABLE_NASA_API_KEY === 'true'
const API_TIMEOUT = Number.parseInt(import.meta.env.VITE_NASA_API_TIMEOUT || '10000', 10)

// Note: NASA Images API is free and doesn't require API keys
// The API key is available for future use with other NASA APIs (APOD, etc.)
const SUPPORTS_API_KEY = false

interface NASAImageItem {
  data: Array<{
    title: string
    description: string
    date_created: string
    keywords?: string[]
    nasa_id: string
  }>
  links?: Array<{
    href: string
    rel: string
  }>
}

interface NASASearchResponse {
  collection: {
    items: NASAImageItem[]
  }
}

const JWST_TARGETS_WITH_DISTANCES: Record<
  string,
  { distance: number; lookbackTime: string; objectType: string }
> = {
  'pillars of creation': {
    distance: 6500,
    lookbackTime: '6,500 years',
    objectType: 'nebula',
  },
  'carina nebula': {
    distance: 7600,
    lookbackTime: '7,600 years',
    objectType: 'nebula',
  },
  'southern ring nebula': {
    distance: 2000,
    lookbackTime: '2,000 years',
    objectType: 'nebula',
  },
  'stephans quintet': {
    distance: 290000000,
    lookbackTime: '290 million years',
    objectType: 'galaxy',
  },
  stephan: {
    distance: 290000000,
    lookbackTime: '290 million years',
    objectType: 'galaxy',
  },
  'deep field': {
    distance: 13000000000,
    lookbackTime: '13 billion years',
    objectType: 'galaxy',
  },
  smacs: {
    distance: 13100000000,
    lookbackTime: '13.1 billion years',
    objectType: 'galaxy',
  },
  'phantom galaxy': {
    distance: 32000000,
    lookbackTime: '32 million years',
    objectType: 'galaxy',
  },
  'cartwheel galaxy': {
    distance: 500000000,
    lookbackTime: '500 million years',
    objectType: 'galaxy',
  },
  'tarantula nebula': {
    distance: 161000,
    lookbackTime: '161,000 years',
    objectType: 'nebula',
  },
  'orion nebula': {
    distance: 1344,
    lookbackTime: '1,344 years',
    objectType: 'nebula',
  },
  'wasp-96': {
    distance: 1150,
    lookbackTime: '1,150 years',
    objectType: 'exoplanet',
  },
  neptune: {
    distance: 0.000477,
    lookbackTime: '4.2 light-hours',
    objectType: 'star',
  },
  jupiter: {
    distance: 0.000082,
    lookbackTime: '43 light-minutes',
    objectType: 'star',
  },
  uranus: {
    distance: 0.00032,
    lookbackTime: '2.8 light-hours',
    objectType: 'star',
  },
  saturn: {
    distance: 0.00016,
    lookbackTime: '1.4 light-hours',
    objectType: 'star',
  },
  mars: {
    distance: 0.000028,
    lookbackTime: '14.6 light-minutes',
    objectType: 'star',
  },
  earendel: {
    distance: 28000000000,
    lookbackTime: '12.9 billion years',
    objectType: 'star',
  },
  'whirlpool galaxy': {
    distance: 23000000,
    lookbackTime: '23 million years',
    objectType: 'galaxy',
  },
  'spiral galaxy': {
    distance: 50000000,
    lookbackTime: '50 million years',
    objectType: 'galaxy',
  },
  ngc: {
    distance: 100000000,
    lookbackTime: '100 million years',
    objectType: 'galaxy',
  },
  'sombrero galaxy': {
    distance: 29000000,
    lookbackTime: '29 million years',
    objectType: 'galaxy',
  },
  andromeda: {
    distance: 2500000,
    lookbackTime: '2.5 million years',
    objectType: 'galaxy',
  },
  'ring nebula': {
    distance: 2000,
    lookbackTime: '2,000 years',
    objectType: 'nebula',
  },
  'eta carinae': {
    distance: 7500,
    lookbackTime: '7,500 years',
    objectType: 'star',
  },
  "webb's first deep field": {
    distance: 13100000000,
    lookbackTime: '13.1 billion years',
    objectType: 'galaxy',
  },
  'cosmic cliffs': {
    distance: 7600,
    lookbackTime: '7,600 years',
    objectType: 'nebula',
  },
  'ngc 3132': {
    distance: 2000,
    lookbackTime: '2,000 years',
    objectType: 'nebula',
  },
  'ngc 7317': {
    distance: 290000000,
    lookbackTime: '290 million years',
    objectType: 'galaxy',
  },
  'wasp-96b': {
    distance: 1150,
    lookbackTime: '1,150 years',
    objectType: 'exoplanet',
  },
  miri: {
    distance: 50000000,
    lookbackTime: '50 million years',
    objectType: 'galaxy',
  },
  nircam: {
    distance: 100000000,
    lookbackTime: '100 million years',
    objectType: 'galaxy',
  },
  infrared: {
    distance: 1000000000,
    lookbackTime: '1 billion years',
    objectType: 'galaxy',
  },
  'galaxy cluster': {
    distance: 4600000000,
    lookbackTime: '4.6 billion years',
    objectType: 'galaxy',
  },
  'stellar nursery': {
    distance: 5000,
    lookbackTime: '5,000 years',
    objectType: 'nebula',
  },
  'star formation': {
    distance: 8000,
    lookbackTime: '8,000 years',
    objectType: 'nebula',
  },
  'brown dwarf': {
    distance: 75,
    lookbackTime: '75 years',
    objectType: 'star',
  },
}

function extractDistance(
  title: string,
  description: string
): { distance: number; lookbackTime: string; objectType: string } | null {
  const searchText = `${title} ${description}`.toLowerCase()

  for (const [key, value] of Object.entries(JWST_TARGETS_WITH_DISTANCES)) {
    if (searchText.includes(key)) {
      return value
    }
  }

  const lightYearRegex = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:billion|million)?\s*light[- ]?years?/i
  const lightYearMatch = lightYearRegex.exec(searchText)
  if (lightYearMatch) {
    let distance = Number.parseFloat(lightYearMatch[1].replaceAll(',', ''))
    if (searchText.includes('billion')) distance *= 1000000000
    else if (searchText.includes('million')) distance *= 1000000

    let unitSuffix = ''
    if (searchText.includes('billion')) {
      unitSuffix = 'billion'
    } else if (searchText.includes('million')) {
      unitSuffix = 'million'
    }

    const lookbackTime = `${lightYearMatch[1]} ${unitSuffix} years`.trim()
    return { distance, lookbackTime, objectType: 'galaxy' }
  }

  return null
}

function extractInstrument(keywords?: string[]): string | undefined {
  if (!keywords) return undefined

  const instruments = ['NIRCam', 'MIRI', 'NIRSpec', 'NIRISS', 'FGS']
  for (const keyword of keywords) {
    for (const instrument of instruments) {
      if (keyword.toUpperCase().includes(instrument.toUpperCase())) {
        return instrument
      }
    }
  }
  return undefined
}

/**
 * Build NASA API URL with optional API key for enhanced rate limits
 */
function buildNASAApiUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl)

  // Add search parameters
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  // Add API key if configured and supported by endpoint
  if (
    USE_API_KEY &&
    NASA_API_KEY &&
    NASA_API_KEY !== 'your_nasa_api_key_here' &&
    SUPPORTS_API_KEY
  ) {
    url.searchParams.set('api_key', NASA_API_KEY)
  }

  return url.toString()
}

/**
 * Get sample JWST images as fallback when API fails
 */
function getSampleJWSTImages(): JWSTImage[] {
  return [
    {
      id: 'sample-deep-field',
      title: "Webb's First Deep Field (SMACS 0723)",
      description:
        "This slice of the vast universe covers a patch of sky approximately the size of a grain of sand held at arm's length by someone on the ground.",
      imageUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002132/GSFC_20220712_Archive_e002132~orig.jpg',
      thumbnailUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002132/GSFC_20220712_Archive_e002132~medium.jpg',
      dateCreated: '2022-07-12T00:00:00Z',
      distance: 13100000000,
      lookbackTime: '13.1 billion years',
      objectType: 'galaxy',
      instrument: 'NIRCam',
      keywords: ['JWST', 'deep field', 'galaxy cluster', 'SMACS 0723'],
    },
    {
      id: 'sample-carina-nebula',
      title: 'Carina Nebula "Cosmic Cliffs"',
      description:
        'What looks much like craggy mountains on a moonlit evening is actually the edge of a nearby, young, star-forming region NGC 3324 in the Carina Nebula.',
      imageUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002133/GSFC_20220712_Archive_e002133~orig.jpg',
      thumbnailUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002133/GSFC_20220712_Archive_e002133~medium.jpg',
      dateCreated: '2022-07-12T00:00:00Z',
      distance: 7600,
      lookbackTime: '7,600 years',
      objectType: 'nebula',
      instrument: 'NIRCam',
      keywords: ['JWST', 'Carina Nebula', 'star formation', 'cosmic cliffs'],
    },
    {
      id: 'sample-southern-ring',
      title: 'Southern Ring Nebula (NGC 3132)',
      description:
        'The bright star at the center of NGC 3132, while prominent when viewed by Webb, plays a supporting role in sculpting the surrounding nebula.',
      imageUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002134/GSFC_20220712_Archive_e002134~orig.jpg',
      thumbnailUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002134/GSFC_20220712_Archive_e002134~medium.jpg',
      dateCreated: '2022-07-12T00:00:00Z',
      distance: 2000,
      lookbackTime: '2,000 years',
      objectType: 'nebula',
      instrument: 'NIRCam',
      keywords: ['JWST', 'Southern Ring Nebula', 'NGC 3132', 'planetary nebula'],
    },
    {
      id: 'sample-stephans-quintet',
      title: "Stephan's Quintet (NGC 7317)",
      description:
        'A visual grouping of five galaxies, four of which are truly close together and locked in a cosmic dance.',
      imageUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002135/GSFC_20220712_Archive_e002135~orig.jpg',
      thumbnailUrl:
        'https://images-assets.nasa.gov/image/GSFC_20220712_Archive_e002135/GSFC_20220712_Archive_e002135~medium.jpg',
      dateCreated: '2022-07-12T00:00:00Z',
      distance: 290000000,
      lookbackTime: '290 million years',
      objectType: 'galaxy',
      instrument: 'NIRCam',
      keywords: ['JWST', "Stephan's Quintet", 'NGC 7317', 'galaxy group'],
    },
  ]
}

/**
 * Fetch JWST images with enhanced error handling and multiple search strategies
 */
export async function fetchJWSTImages(): Promise<JWSTImage[]> {
  try {
    // Multiple search strategies to get better cosmic imagery
    const searchQueries = [
      'webb deep field galaxy',
      'james webb nebula',
      'jwst galaxy cluster',
      'webb carina nebula',
      'james webb pillars of creation',
      'jwst stephan quintet',
      'webb southern ring nebula',
      'james webb exoplanet',
      'jwst spectrum',
      'webb infrared space',
    ]

    const allImages: JWSTImage[] = []

    // Execute multiple searches to get diverse cosmic imagery
    for (const query of searchQueries) {
      try {
        const apiUrl = buildNASAApiUrl(`${NASA_API_BASE}/search`, {
          q: query,
          media_type: 'image',
          year_start: '2022',
          page_size: '20',
        })

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'JWST-Deep-Sky-Explorer/1.0',
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.warn(`Search query "${query}" failed: ${response.status}`)
          continue
        }

        const data: NASASearchResponse = await response.json()

        // Process images from this search
        const searchImages = data.collection.items
          .filter(item => item.links && item.links.length > 0)
          .map(item => {
            const metadata = item.data[0]
            const imageUrl = item.links?.[0]?.href || ''

            const distanceData = extractDistance(metadata.title, metadata.description || '')
            const instrument = extractInstrument(metadata.keywords)

            return {
              id: metadata.nasa_id,
              title: metadata.title,
              description: metadata.description || 'No description available',
              imageUrl: imageUrl,
              thumbnailUrl: imageUrl,
              dateCreated: metadata.date_created,
              distance: distanceData?.distance,
              lookbackTime: distanceData?.lookbackTime,
              objectType: distanceData?.objectType,
              instrument: instrument,
              keywords: metadata.keywords || [],
            }
          })
          .filter(img => img.distance !== undefined) // Only keep images with distance data

        allImages.push(...searchImages)

        // Small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`Failed to fetch images for query "${query}":`, error)
      }
    }

    // Remove duplicates based on NASA ID and sort by distance
    const uniqueImages = Array.from(new Map(allImages.map(img => [img.id, img])).values()).sort(
      (a, b) => (a.distance || 0) - (b.distance || 0)
    )

    if (uniqueImages.length > 0) {
      console.warn(
        `Successfully fetched ${uniqueImages.length} unique JWST images with distance data`
      )
      return uniqueImages
    } else {
      console.warn('No JWST images with distance data found, using sample dataset')
      return getSampleJWSTImages()
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('NASA API request timed out')
        throw new Error('NASA API request timed out. Please check your connection.')
      } else {
        console.error('Error fetching JWST images:', error.message)
        throw error
      }
    } else {
      console.error('Unknown error fetching JWST images:', error)
      throw new Error('An unexpected error occurred while fetching images.')
    }
  }
}

/**
 * Test NASA API Key with APOD (Astronomy Picture of the Day) endpoint
 */
export async function testNASAApiKey(): Promise<{
  success: boolean
  message: string
  apiKeyValid: boolean
}> {
  if (!NASA_API_KEY || NASA_API_KEY === 'your_nasa_api_key_here') {
    return {
      success: false,
      message: 'No API key configured',
      apiKeyValid: false,
    }
  }

  try {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=1`,
      {
        signal: AbortSignal.timeout(5000),
      }
    )

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: `API key valid! Retrieved APOD: "${data[0]?.title || 'Untitled'}"`,
        apiKeyValid: true,
      }
    } else if (response.status === 403) {
      return {
        success: false,
        message: 'API key is invalid or has exceeded rate limits',
        apiKeyValid: false,
      }
    } else {
      return {
        success: false,
        message: `NASA API error: ${response.status} ${response.statusText}`,
        apiKeyValid: false,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection error',
      apiKeyValid: false,
    }
  }
}

/**
 * Test NASA Images API connectivity (no key required)
 */
export async function testNASAConnection(): Promise<{
  success: boolean
  message: string
  apiKeyActive: boolean
  rateLimit?: {
    limit: string
    remaining: string
  }
}> {
  try {
    const testUrl = buildNASAApiUrl(`${NASA_API_BASE}/search`, {
      q: 'webb',
      media_type: 'image',
      page_size: '1',
    })

    const response = await fetch(testUrl, {
      signal: AbortSignal.timeout(5000),
    })

    const rateLimitInfo = {
      limit: response.headers.get('X-RateLimit-Limit') || 'Unknown',
      remaining: response.headers.get('X-RateLimit-Remaining') || 'Unknown',
    }

    if (response.ok) {
      const data = await response.json()
      const hasResults = data.collection?.items?.length > 0

      return {
        success: true,
        message: hasResults
          ? `NASA Images API connected successfully. Found ${data.collection.items.length} test result(s). Note: Images API doesn't require API keys.`
          : 'NASA Images API connected but no test results found.',
        apiKeyActive: USE_API_KEY && NASA_API_KEY !== 'your_nasa_api_key_here',
        rateLimit: rateLimitInfo,
      }
    } else {
      return {
        success: false,
        message: `NASA API Error: ${response.status} ${response.statusText}`,
        apiKeyActive: false,
        rateLimit: rateLimitInfo,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
      apiKeyActive: false,
    }
  }
}
