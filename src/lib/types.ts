export interface JWSTImage {
  id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  dateCreated: string
  distance?: number
  lookbackTime?: string
  objectType?: string
  instrument?: string
  coordinates?: string
  keywords?: string[]
}

export type ObjectType = 'galaxy' | 'nebula' | 'star' | 'exoplanet' | 'all'
export type InstrumentType = 'NIRCam' | 'MIRI' | 'NIRSpec' | 'NIRISS' | 'all'

export interface FilterState {
  objectType: ObjectType
  instrument: InstrumentType
  distanceRange: [number, number]
}
