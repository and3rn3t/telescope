import { JWSTImage } from './types'

const NASA_API_BASE = 'https://images-api.nasa.gov'

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

const JWST_TARGETS_WITH_DISTANCES: Record<string, { distance: number; lookbackTime: string; objectType: string }> = {
  'pillars of creation': { distance: 6500, lookbackTime: '6,500 years', objectType: 'nebula' },
  'carina nebula': { distance: 7600, lookbackTime: '7,600 years', objectType: 'nebula' },
  'southern ring nebula': { distance: 2000, lookbackTime: '2,000 years', objectType: 'nebula' },
  'stephans quintet': { distance: 290000000, lookbackTime: '290 million years', objectType: 'galaxy' },
  'stephan': { distance: 290000000, lookbackTime: '290 million years', objectType: 'galaxy' },
  'deep field': { distance: 13000000000, lookbackTime: '13 billion years', objectType: 'galaxy' },
  'smacs': { distance: 13100000000, lookbackTime: '13.1 billion years', objectType: 'galaxy' },
  'phantom galaxy': { distance: 32000000, lookbackTime: '32 million years', objectType: 'galaxy' },
  'cartwheel galaxy': { distance: 500000000, lookbackTime: '500 million years', objectType: 'galaxy' },
  'tarantula nebula': { distance: 161000, lookbackTime: '161,000 years', objectType: 'nebula' },
  'orion nebula': { distance: 1344, lookbackTime: '1,344 years', objectType: 'nebula' },
  'wasp-96': { distance: 1150, lookbackTime: '1,150 years', objectType: 'exoplanet' },
  'neptune': { distance: 0.000477, lookbackTime: '4.2 light-hours', objectType: 'star' },
  'jupiter': { distance: 0.000082, lookbackTime: '43 light-minutes', objectType: 'star' },
  'uranus': { distance: 0.00032, lookbackTime: '2.8 light-hours', objectType: 'star' },
  'saturn': { distance: 0.00016, lookbackTime: '1.4 light-hours', objectType: 'star' },
  'mars': { distance: 0.000028, lookbackTime: '14.6 light-minutes', objectType: 'star' },
  'earendel': { distance: 28000000000, lookbackTime: '12.9 billion years', objectType: 'star' },
  'whirlpool galaxy': { distance: 23000000, lookbackTime: '23 million years', objectType: 'galaxy' },
  'spiral galaxy': { distance: 50000000, lookbackTime: '50 million years', objectType: 'galaxy' },
  'ngc': { distance: 100000000, lookbackTime: '100 million years', objectType: 'galaxy' },
  'sombrero galaxy': { distance: 29000000, lookbackTime: '29 million years', objectType: 'galaxy' },
  'andromeda': { distance: 2500000, lookbackTime: '2.5 million years', objectType: 'galaxy' },
  'ring nebula': { distance: 2000, lookbackTime: '2,000 years', objectType: 'nebula' },
  'eta carinae': { distance: 7500, lookbackTime: '7,500 years', objectType: 'star' },
}

function extractDistance(title: string, description: string): { distance: number; lookbackTime: string; objectType: string } | null {
  const searchText = `${title} ${description}`.toLowerCase()
  
  for (const [key, value] of Object.entries(JWST_TARGETS_WITH_DISTANCES)) {
    if (searchText.includes(key)) {
      return value
    }
  }
  
  const lightYearMatch = searchText.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:billion|million)?\s*light[- ]?years?/i)
  if (lightYearMatch) {
    let distance = parseFloat(lightYearMatch[1].replace(/,/g, ''))
    if (searchText.includes('billion')) distance *= 1000000000
    else if (searchText.includes('million')) distance *= 1000000
    
    let lookbackTime = `${lightYearMatch[1]} ${searchText.includes('billion') ? 'billion' : searchText.includes('million') ? 'million' : ''} years`.trim()
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

export async function fetchJWSTImages(): Promise<JWSTImage[]> {
  try {
    const response = await fetch(
      `${NASA_API_BASE}/search?q=james webb space telescope&media_type=image&year_start=2022`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch NASA images')
    }
    
    const data: NASASearchResponse = await response.json()
    
    const images: JWSTImage[] = data.collection.items
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
      .filter(img => img.distance !== undefined)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    
    return images
  } catch (error) {
    console.error('Error fetching JWST images:', error)
    return []
  }
}
