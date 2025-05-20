export interface BirthDetails {
  date: string // YYYY-MM-DD
  time: string // HH:MM (24-hour format)
  latitude: number
  longitude: number
  timezone: string // e.g., "+05:30"
  city?: string
  country?: string
  name?: string
}

export interface PlanetPosition {
  name: string
  longitude: number
  sign: string
  nakshatra: string
  nakshatraPada: number
  isRetrograde: boolean
  house?: number
}

export interface HouseData {
  number: number
  startLongitude: number
  sign: string
  planets: PlanetPosition[]
}

export interface AscendantData {
  longitude: number
  sign: string
  nakshatra: string
  nakshatraPada: number
}

export interface DashaPeriod {
  planet: string
  from: Date
  to: Date
  duration: string
  balanceAtBirth?: string
}

export interface HierarchicalDashaPeriod extends DashaPeriod {
  level: "mahadasha" | "antardasha" | "pratyantardasha" | "sookshma" | "prana"
  children?: HierarchicalDashaPeriod[]
  parent?: HierarchicalDashaPeriod
}

export interface AstrologyChart {
  native: {
    birthDate: Date
    location: {
      latitude: number
      longitude: number
      timezone: string
      city?: string
      country?: string
    }
    name?: string
  }
  ascendant: AscendantData
  planets: PlanetPosition[]
  rashiChart: Record<number, HouseData>
  navamsaChart: Record<number, HouseData>
  dashamsa: Record<number, HouseData>
  dashas: DashaPeriod[]
  hierarchicalDashas?: HierarchicalDashaPeriod[]
  ayanamsa: number
}

export interface AstrologyPromptData {
  birthDetails: BirthDetails
  chartData?: AstrologyChart
  query?: string
}
