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
  habitabilityScore: number; // 0-10
}

export const exoplanets: Exoplanet[] = [
  {
    id: "kepler-452b",
    name: "Kepler-452b",
    distanceFromEarth: 1402,
    orbitalPeriod: 385,
    temperature: 265,
    starType: "G2V",
    biosignatures: ["Water vapor", "Oxygen", "Methane traces"],
    radius: 1.6,
    mass: 5.0,
    discoveryYear: 2015,
    constellation: "Cygnus",
    habitabilityScore: 0 // Will be calculated dynamically
  },
  {
    id: "proxima-centauri-b",
    name: "Proxima Centauri b",
    distanceFromEarth: 4.24,
    orbitalPeriod: 11.2,
    temperature: 234,
    starType: "M5.5V",
    biosignatures: ["Possible water", "Atmospheric methane"],
    radius: 1.17,
    mass: 1.27,
    discoveryYear: 2016,
    constellation: "Centaurus",
    habitabilityScore: 0
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    distanceFromEarth: 40.7,
    orbitalPeriod: 6.1,
    temperature: 251,
    starType: "M8V",
    biosignatures: ["Water vapor", "Carbon dioxide", "Potential oxygen"],
    radius: 0.92,
    mass: 0.77,
    discoveryYear: 2017,
    constellation: "Aquarius",
    habitabilityScore: 0
  },
  {
    id: "gliese-667cc",
    name: "Gliese 667Cc",
    distanceFromEarth: 23.6,
    orbitalPeriod: 28.1,
    temperature: 277,
    starType: "M1.5V",
    biosignatures: ["Atmospheric water", "Ozone traces"],
    radius: 1.54,
    mass: 3.8,
    discoveryYear: 2011,
    constellation: "Scorpius",
    habitabilityScore: 0
  },
  {
    id: "k2-18b",
    name: "K2-18b",
    distanceFromEarth: 124,
    orbitalPeriod: 33,
    temperature: 279,
    starType: "M2.5V",
    biosignatures: ["Water vapor confirmed", "Hydrogen", "Helium"],
    radius: 2.3,
    mass: 8.6,
    discoveryYear: 2015,
    constellation: "Leo",
    habitabilityScore: 0
  },
  {
    id: "toi-715b",
    name: "TOI-715b",
    distanceFromEarth: 137,
    orbitalPeriod: 19.3,
    temperature: 290,
    starType: "M4V",
    biosignatures: ["Potential water vapor", "Atmospheric composition unknown"],
    radius: 1.55,
    mass: 3.02,
    discoveryYear: 2024,
    constellation: "Volans",
    habitabilityScore: 0
  },
  {
    id: "lhs-1140b",
    name: "LHS 1140b",
    distanceFromEarth: 48.6,
    orbitalPeriod: 24.7,
    temperature: 230,
    starType: "M4.5V",
    biosignatures: ["Dense atmosphere", "Possible water retention"],
    radius: 1.73,
    mass: 6.6,
    discoveryYear: 2017,
    constellation: "Cetus",
    habitabilityScore: 0
  },
  {
    id: "wolf-1061c",
    name: "Wolf 1061c",
    distanceFromEarth: 13.8,
    orbitalPeriod: 17.9,
    temperature: 223,
    starType: "M3V",
    biosignatures: ["Potential atmosphere", "Rocky composition"],
    radius: 1.4,
    mass: 4.3,
    discoveryYear: 2015,
    constellation: "Ophiuchus",
    habitabilityScore: 0
  }
];