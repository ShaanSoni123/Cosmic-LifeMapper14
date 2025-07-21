export interface ExtendedExoplanetData {
  planet_name: string;
  planet_radius: number; // Earth radii
  star_temperature: number; // Kelvin
  orbital_distance: number; // AU
  atmospheric_pressure: number; // Earth atm
  stellar_luminosity: number; // Solar units
  planet_mass: number; // Earth masses
  eccentricity: number; // 0-1
  orbital_period: number; // days
  albedo: number; // 0-1
  host_star_metallicity: number; // [Fe/H]
  host_star_age: number; // Gyr
}

export const extendedExoplanetData: ExtendedExoplanetData[] = [
  {
    planet_name: "Kepler-22b",
    planet_radius: 2.4,
    star_temperature: 5518,
    orbital_distance: 0.85,
    atmospheric_pressure: 1.2,
    stellar_luminosity: 0.79,
    planet_mass: 5.4,
    eccentricity: 0.02,
    orbital_period: 289.9,
    albedo: 0.3,
    host_star_metallicity: 0.05,
    host_star_age: 4.0
  },
  {
    planet_name: "Proxima Centauri b",
    planet_radius: 1.1,
    star_temperature: 3042,
    orbital_distance: 0.0485,
    atmospheric_pressure: 0.9,
    stellar_luminosity: 0.0017,
    planet_mass: 1.3,
    eccentricity: 0.0,
    orbital_period: 11.2,
    albedo: 0.1,
    host_star_metallicity: -0.04,
    host_star_age: 4.9
  },
  {
    planet_name: "TRAPPIST-1e",
    planet_radius: 0.92,
    star_temperature: 2559,
    orbital_distance: 0.028,
    atmospheric_pressure: 0.8,
    stellar_luminosity: 0.0005,
    planet_mass: 0.77,
    eccentricity: 0.01,
    orbital_period: 6.1,
    albedo: 0.1,
    host_star_metallicity: 0.04,
    host_star_age: 7.6
  },
  {
    planet_name: "Gliese 667Cc",
    planet_radius: 1.54,
    star_temperature: 3700,
    orbital_distance: 0.125,
    atmospheric_pressure: 1.1,
    stellar_luminosity: 0.013,
    planet_mass: 3.8,
    eccentricity: 0.15,
    orbital_period: 28.1,
    albedo: 0.25,
    host_star_metallicity: 0.02,
    host_star_age: 2.9
  },
  {
    planet_name: "K2-18b",
    planet_radius: 2.6,
    star_temperature: 3503,
    orbital_distance: 0.143,
    atmospheric_pressure: 1.6,
    stellar_luminosity: 0.02,
    planet_mass: 8.0,
    eccentricity: 0.15,
    orbital_period: 33.0,
    albedo: 0.35,
    host_star_metallicity: 0.05,
    host_star_age: 4.8
  },
  {
    planet_name: "TOI-715b",
    planet_radius: 1.55,
    star_temperature: 3200,
    orbital_distance: 0.083,
    atmospheric_pressure: 1.0,
    stellar_luminosity: 0.006,
    planet_mass: 3.02,
    eccentricity: 0.08,
    orbital_period: 19.3,
    albedo: 0.25,
    host_star_metallicity: 0.0,
    host_star_age: 5.0
  },
  {
    planet_name: "LHS 1140b",
    planet_radius: 1.73,
    star_temperature: 3131,
    orbital_distance: 0.09,
    atmospheric_pressure: 1.2,
    stellar_luminosity: 0.0035,
    planet_mass: 6.6,
    eccentricity: 0.05,
    orbital_period: 24.7,
    albedo: 0.15,
    host_star_metallicity: -0.05,
    host_star_age: 5.5
  },
  {
    planet_name: "Wolf 1061c",
    planet_radius: 1.4,
    star_temperature: 3500,
    orbital_distance: 0.084,
    atmospheric_pressure: 0.7,
    stellar_luminosity: 0.01,
    planet_mass: 4.3,
    eccentricity: 0.12,
    orbital_period: 17.9,
    albedo: 0.3,
    host_star_metallicity: -0.02,
    host_star_age: 3.4
  }
];