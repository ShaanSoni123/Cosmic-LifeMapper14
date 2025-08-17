export interface Exoplanet {
  id: string;
  name: string;
  distanceFromEarth: number; // light years
  orbitalPeriod: number; // days
  temperature: number; // Kelvin
  starType: string;
  biosignatures: string[];
  radius: number; // Earth radii
  mass: number; // Earth masses
  discoveryYear: number;
  constellation: string;
  habitabilityScore: number; // 0-10 scale
}

// Curated collection of notable exoplanets with detailed analysis
export const exoplanets: Exoplanet[] = [
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    distanceFromEarth: 620,
    orbitalPeriod: 289.9,
    temperature: 262,
    starType: "G5V",
    biosignatures: ["Water vapor potential", "Atmospheric stability indicators"],
    radius: 2.4,
    mass: 5.4,
    discoveryYear: 2011,
    constellation: "Cygnus",
    habitabilityScore: 4.5
  },
  {
    id: "proxima-centauri-b",
    name: "Proxima Centauri b",
    distanceFromEarth: 4.24,
    orbitalPeriod: 11.2,
    temperature: 234,
    starType: "M5.5V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators"],
    radius: 1.1,
    mass: 1.3,
    discoveryYear: 2016,
    constellation: "Centaurus",
    habitabilityScore: 6.5
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    distanceFromEarth: 40.7,
    orbitalPeriod: 6.1,
    temperature: 251,
    starType: "M8V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators", "Oxygen traces possible"],
    radius: 0.92,
    mass: 0.77,
    discoveryYear: 2017,
    constellation: "Aquarius",
    habitabilityScore: 7.2
  },
  {
    id: "gliese-667-cc",
    name: "Gliese 667 Cc",
    distanceFromEarth: 23.6,
    orbitalPeriod: 28.1,
    temperature: 277,
    starType: "M1.5V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators"],
    radius: 1.54,
    mass: 3.8,
    discoveryYear: 2011,
    constellation: "Scorpius",
    habitabilityScore: 6.8
  },
  {
    id: "hd-40307g",
    name: "HD 40307g",
    distanceFromEarth: 42,
    orbitalPeriod: 197.8,
    temperature: 227,
    starType: "K2.5V",
    biosignatures: ["Water vapor potential", "Atmospheric stability indicators"],
    radius: 2.1,
    mass: 7.1,
    discoveryYear: 2012,
    constellation: "Pictor",
    habitabilityScore: 5.9
  },
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    distanceFromEarth: 582,
    orbitalPeriod: 129.9,
    temperature: 188,
    starType: "M1V",
    biosignatures: ["Water vapor potential", "Liquid water possible"],
    radius: 1.11,
    mass: 1.4,
    discoveryYear: 2014,
    constellation: "Cygnus",
    habitabilityScore: 6.2
  },
  {
    id: "lhs-1140b",
    name: "LHS 1140b",
    distanceFromEarth: 40.7,
    orbitalPeriod: 24.7,
    temperature: 230,
    starType: "M4.5V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators"],
    radius: 1.43,
    mass: 6.6,
    discoveryYear: 2017,
    constellation: "Cetus",
    habitabilityScore: 7.1
  },
  {
    id: "wolf-1061c",
    name: "Wolf 1061c",
    distanceFromEarth: 13.8,
    orbitalPeriod: 17.9,
    temperature: 223,
    starType: "M3V",
    biosignatures: ["Water vapor potential", "Atmospheric stability indicators"],
    radius: 1.6,
    mass: 4.3,
    discoveryYear: 2015,
    constellation: "Ophiuchus",
    habitabilityScore: 5.7
  },
  {
    id: "kepler-62f",
    name: "Kepler-62f",
    distanceFromEarth: 1200,
    orbitalPeriod: 267.3,
    temperature: 208,
    starType: "K2V",
    biosignatures: ["Water vapor potential", "Liquid water possible"],
    radius: 1.41,
    mass: 3.3,
    discoveryYear: 2013,
    constellation: "Lyra",
    habitabilityScore: 6.0
  },
  {
    id: "tau-ceti-e",
    name: "Tau Ceti e",
    distanceFromEarth: 11.9,
    orbitalPeriod: 168.1,
    temperature: 241,
    starType: "G8.5V",
    biosignatures: ["Water vapor potential", "Atmospheric stability indicators"],
    radius: 1.9,
    mass: 4.5,
    discoveryYear: 2012,
    constellation: "Cetus",
    habitabilityScore: 5.4
  },
  {
    id: "kepler-452b",
    name: "Kepler-452b",
    distanceFromEarth: 1402,
    orbitalPeriod: 384.8,
    temperature: 265,
    starType: "G2V",
    biosignatures: ["Water vapor potential", "Atmospheric stability indicators", "Liquid water possible"],
    radius: 1.6,
    mass: 5.0,
    discoveryYear: 2015,
    constellation: "Cygnus",
    habitabilityScore: 6.9
  },
  {
    id: "k2-18b",
    name: "K2-18b",
    distanceFromEarth: 124,
    orbitalPeriod: 33.0,
    temperature: 234,
    starType: "M2.5V",
    biosignatures: ["Water vapor detected", "Liquid water possible", "Atmospheric stability indicators", "Hydrogen atmosphere"],
    radius: 2.6,
    mass: 8.0,
    discoveryYear: 2015,
    constellation: "Leo",
    habitabilityScore: 8.1
  },
  {
    id: "kepler-438b",
    name: "Kepler-438b",
    distanceFromEarth: 640,
    orbitalPeriod: 35.2,
    temperature: 276,
    starType: "M0V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators"],
    radius: 1.12,
    mass: 1.5,
    discoveryYear: 2015,
    constellation: "Lyra",
    habitabilityScore: 7.3
  },
  {
    id: "kepler-440b",
    name: "Kepler-440b",
    distanceFromEarth: 851,
    orbitalPeriod: 101.1,
    temperature: 273,
    starType: "K7V",
    biosignatures: ["Water vapor potential", "Liquid water possible"],
    radius: 1.86,
    mass: 4.8,
    discoveryYear: 2015,
    constellation: "Lyra",
    habitabilityScore: 6.4
  },
  {
    id: "ross-128b",
    name: "Ross 128b",
    distanceFromEarth: 11.0,
    orbitalPeriod: 9.9,
    temperature: 269,
    starType: "M4V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators"],
    radius: 1.35,
    mass: 1.8,
    discoveryYear: 2017,
    constellation: "Virgo",
    habitabilityScore: 7.5
  },
  {
    id: "kepler-62e",
    name: "Kepler-62e",
    distanceFromEarth: 1200,
    orbitalPeriod: 122.4,
    temperature: 270,
    starType: "K2V",
    biosignatures: ["Water vapor potential", "Liquid water possible", "Atmospheric stability indicators"],
    radius: 1.61,
    mass: 3.4,
    discoveryYear: 2013,
    constellation: "Lyra",
    habitabilityScore: 6.7
  },
  {
    id: "hd-219134b",
    name: "HD 219134b",
    distanceFromEarth: 21.3,
    orbitalPeriod: 3.1,
    temperature: 1100,
    starType: "K3V",
    biosignatures: [],
    radius: 1.6,
    mass: 4.5,
    discoveryYear: 2015,
    constellation: "Cassiopeia",
    habitabilityScore: 1.2
  },
  {
    id: "kepler-10c",
    name: "Kepler-10c",
    distanceFromEarth: 608,
    orbitalPeriod: 45.3,
    temperature: 584,
    starType: "G0V",
    biosignatures: [],
    radius: 2.35,
    mass: 14.0,
    discoveryYear: 2011,
    constellation: "Draco",
    habitabilityScore: 2.1
  },
  {
    id: "gj-273b",
    name: "GJ 273b",
    distanceFromEarth: 12.4,
    orbitalPeriod: 18.6,
    temperature: 237,
    starType: "M3.5V",
    biosignatures: ["Water vapor potential", "Atmospheric stability indicators"],
    radius: 1.2,
    mass: 2.9,
    discoveryYear: 2017,
    constellation: "Gemini",
    habitabilityScore: 5.8
  },
  {
    id: "kapteyn-b",
    name: "Kapteyn b",
    distanceFromEarth: 12.8,
    orbitalPeriod: 48.6,
    temperature: 184,
    starType: "M1V",
    biosignatures: ["Water vapor potential"],
    radius: 1.1,
    mass: 4.8,
    discoveryYear: 2014,
    constellation: "Pictor",
    habitabilityScore: 4.9
  }
];

// Export total count
export const TOTAL_EXOPLANETS = exoplanets.length;