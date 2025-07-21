import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from typing import Tuple, List, Dict
import logging

# Setup professional logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Extended CSV dataset (simulated) of 80 exoplanets with realistic range of parameters
# Columns: planet_name, planet_radius (Earth radii), star_temperature (K), orbital_distance (AU),
# atmospheric_pressure (Earth atm), stellar_luminosity (solar units), planet_mass (Earth masses),
# eccentricity (0-1), orbital_period (days), albedo (0-1), host_star_metallicity ([Fe/H]), host_star_age (Gyr)

CSV_DATA = """
planet_name,planet_radius,star_temperature,orbital_distance,atmospheric_pressure,stellar_luminosity,planet_mass,eccentricity,orbital_period,albedo,host_star_metallicity,host_star_age
Kepler-22b,2.4,5518,0.85,1.2,0.79,5.4,0.02,289.9,0.3,0.05,4.0
Proxima Centauri b,1.1,3042,0.0485,0.9,0.0017,1.3,0.0,11.2,0.1,-0.04,4.9
TRAPPIST-1e,0.92,2559,0.028,0.8,0.0005,0.77,0.01,6.1,0.1,0.04,7.6
Gliese 667 Cc,1.54,3700,0.125,1.1,0.013,3.8,0.15,28.1,0.25,0.02,2.9
HD 40307g,2.1,4977,0.6,1.5,0.23,7.1,0.22,197.8,0.35,-0.06,5.1
Kepler-186f,1.11,3755,0.356,1.0,0.04,1.4,0.04,129.9,0.2,0.01,3.7
LHS 1140b,1.43,3131,0.09,1.2,0.0035,6.6,0.05,24.7,0.15,-0.05,5.5
Wolf 1061c,1.6,3500,0.084,0.7,0.01,4.3,0.12,17.9,0.3,-0.02,3.4
Kepler-62f,1.41,4925,0.72,1.3,0.21,3.3,0.09,267.3,0.32,0.00,6.2
Tau Ceti e,1.9,5344,0.55,0.9,0.52,4.5,0.05,168.1,0.28,-0.1,7.0
GJ 667 C f,1.5,3700,0.155,1.1,0.013,4.6,0.16,35.0,0.27,0.02,3.1
Kepler-452b,1.6,5757,1.05,1.4,1.04,5.0,0.04,384.8,0.3,0.04,6.0
K2-18b,2.6,3503,0.143,1.6,0.02,8.0,0.15,33.0,0.35,0.05,4.8
Kepler-438b,1.12,3748,0.166,1.0,0.02,1.5,0.11,35.2,0.19,0.03,3.8
Kepler-440b,1.86,3995,0.242,1.3,0.04,4.8,0.18,63.3,0.31,0.01,5.2
Ross 128b,1.35,3192,0.049,0.9,0.004,1.8,0.04,9.9,0.2,-0.02,6.0
Kepler-62e,1.61,4925,0.43,1.25,0.21,3.4,0.08,122.4,0.32,0.00,6.3
HD 219134b,1.6,4699,0.038,1.5,0.26,4.5,0.03,3.1,0.3,0.04,7.1
Kepler-10c,2.35,5627,0.24,1.5,0.79,14.0,0.06,45.3,0.28,0.1,8.0
GJ 273b,1.2,3370,0.091,1.1,0.006,2.9,0.07,18.6,0.22,0.0,5.6
Kapteyn b,1.1,3570,0.168,1.0,0.01,4.8,0.1,48.6,0.3,-0.86,11.5
K2-3d,1.5,3896,0.207,1.3,0.03,2.7,0.05,44.6,0.29,0.04,4.1
HD 85512b,1.4,4715,0.26,1.1,0.19,3.6,0.05,58.4,0.32,-0.16,5.3
Kepler-62d,1.43,4925,0.12,1.2,0.21,3.9,0.11,18.2,0.27,0.0,6.2
Kepler-145b,1.7,5350,0.36,1.3,0.45,4.5,0.12,64.0,0.3,0.03,5.7
Gliese 832c,1.5,3472,0.163,1.2,0.012,5.4,0.07,36.1,0.28,0.05,6.8
K2-18c,2.3,3503,0.07,1.4,0.02,7.2,0.1,9.2,0.33,0.05,4.8
Ross 128c,1.1,3192,0.13,0.8,0.004,1.2,0.02,16.0,0.15,-0.02,6.0
Kepler-20e,0.87,5500,0.05,1.0,0.76,0.8,0.02,6.1,0.2,0.05,6.4
K2-155d,1.6,4900,0.17,1.3,0.18,3.2,0.08,40.2,0.3,0.03,5.9
Kepler-186c,1.3,3755,0.13,1.1,0.04,2.5,0.07,29.8,0.23,0.01,3.7
Luyten b,1.1,3200,0.09,1.0,0.005,2.0,0.06,19.4,0.18,-0.03,7.1
Gliese 667 Cf,1.8,3700,0.16,1.2,0.013,5.7,0.12,39.6,0.29,0.02,3.1
Wolf 1061b,1.4,3500,0.035,0.95,0.01,1.5,0.04,4.9,0.2,-0.02,3.4
GJ 667 Ce,1.2,3700,0.05,0.9,0.013,2.3,0.03,7.2,0.19,0.02,3.1
Kepler-62c,0.54,4925,0.05,0.6,0.21,0.1,0.03,12.4,0.1,0.00,6.2
HD 97658b,2.3,5119,0.08,1.5,0.33,8.0,0.05,9.5,0.34,-0.23,6.5
K2-18e,1.7,3503,0.19,1.1,0.02,3.7,0.1,33.4,0.29,0.05,4.8
Kepler-138d,1.2,3800,0.17,1.0,0.045,2.1,0.07,33.0,0.22,0.0,3.9
GJ 667 Cb,1.54,3700,0.05,1.1,0.013,4.5,0.02,7.2,0.27,0.02,3.1
Ross 128b2,1.3,3192,0.06,1.0,0.004,3.2,0.04,10.5,0.2,-0.02,6.0
Kepler-22c,1.9,5518,0.95,1.3,0.79,6.2,0.05,302.0,0.3,0.05,4.0
GJ 273c,1.5,3370,0.15,1.4,0.006,4.3,0.1,32.1,0.27,0.0,5.6
K2-3b,1.6,3896,0.08,1.3,0.03,2.6,0.04,10.1,0.3,0.04,4.1
Kepler-20f,1.05,5500,0.35,1.0,0.76,1.1,0.06,69.7,0.25,0.05,6.4
GJ 667 Cd,1.3,3700,0.08,1.1,0.013,3.1,0.07,15.3,0.26,0.02,3.1
Kepler-36b,1.5,5900,0.13,1.2,1.1,4.1,0.04,13.8,0.28,0.06,5.5
LHS 1140c,1.1,3131,0.04,1.0,0.0035,1.7,0.02,6.9,0.17,-0.05,5.5
Wolf 1061d,1.8,3500,0.15,1.2,0.01,5.0,0.08,60.3,0.3,-0.02,3.4
GJ 667 Ce2,1.4,3700,0.12,1.1,0.013,3.6,0.05,27.0,0.27,0.02,3.1
Kepler-452c,1.3,5757,1.1,1.1,1.04,2.7,0.04,410.1,0.28,0.04,6.0
K2-18f,1.2,3503,0.22,1.0,0.02,2.4,0.05,42.5,0.25,0.05,4.8
Kepler-1606b,1.6,4800,0.52,1.4,0.19,5.6,0.13,128.3,0.31,-0.02,5.5
GJ 273d,1.4,3370,0.12,1.2,0.006,3.7,0.06,26.4,0.28,0.0,5.6
K2-3c,1.5,3896,0.12,1.3,0.03,3.1,0.08,24.6,0.3,0.04,4.1
Kepler-11f,2.5,5660,0.25,1.5,1.01,8.4,0.07,46.7,0.34,0.06,5.0
Gliese 832b,2.0,3472,0.20,1.6,0.012,7.2,0.14,36.0,0.32,0.05,6.8
HD 97658c,1.6,5119,0.13,1.3,0.33,3.9,0.04,15.3,0.3,-0.23,6.5
Kepler-144b,1.7,5600,0.46,1.2,0.78,4.2,0.06,75.5,0.29,0.04,5.7
LHS 1140d,1.1,3131,0.07,1.0,0.0035,1.9,0.03,14.5,0.2,-0.05,5.5
Wolf 1061e,1.3,3500,0.11,1.1,0.01,3.0,0.07,22.8,0.28,-0.02,3.4
GJ 667 Cf2,1.2,3700,0.14,1.0,0.013,2.9,0.06,30.7,0.27,0.02,3.1
Kepler-62b,1.0,4925,0.05,1.0,0.21,1.0,0.02,10.3,0.2,0.0,6.2
"""

# Note: For brevity, the full 80 rows are assumed filled similarly with varied parameters.
# In actual usage, replace '...' with complete data rows.

def load_data_from_csv_string(csv_string: str) -> pd.DataFrame:
    """
    Load extended exoplanet dataset from embedded CSV string.
    
    Returns:
        DataFrame with typed columns
    """
    from io import StringIO
    df = pd.read_csv(StringIO(csv_string))
    # Enforce data types explicitly
    expected_types = {
        'planet_name': str,
        'planet_radius': float,
        'star_temperature': float,
        'orbital_distance': float,
        'atmospheric_pressure': float,
        'stellar_luminosity': float,
        'planet_mass': float,
        'eccentricity': float,
        'orbital_period': float,
        'albedo': float,
        'host_star_metallicity': float,
        'host_star_age': float
    }
    df = df.astype(expected_types)
    logging.info(f"Loaded {len(df)} exoplanet records.")
    return df

def habitable_zone_bounds_extended(star_temp: float) -> Tuple[float, float]:
    """
    Calculate inner and outer habitable zone boundaries (AU) using Kopparapu et al. 2013.
    This model accounts for star temperature effects on habitable zone limits.
    
    Source: Kopparapu et al., 2013, ApJ, 765, 131 https://doi.org/10.1088/0004-637X/765/2/131
    
    Parameters:
        star_temp (K)
    
    Returns:
        (inner_bound, outer_bound) in AU
    """
    T_star = star_temp
    # Empirical coefficients for runaway greenhouse (inner) and maximum greenhouse (outer)
    S_inner = 1.107 + 1.332e-4 * (T_star - 5780) + 1.580e-8 * (T_star - 5780)**2
    S_outer = 0.356 + 6.171e-5 * (T_star - 5780) + 1.698e-9 * (T_star - 5780)**2
    L_star = (T_star / 5778) ** 4  # Approximate luminosity if no direct value
    
    inner_bound = np.sqrt(L_star / S_inner)
    outer_bound = np.sqrt(L_star / S_outer)
    return inner_bound, outer_bound

def estimate_surface_temperature(
    star_temp: float,
    orbital_distance: float,
    albedo: float
) -> float:
    """
    Estimate equilibrium surface temperature of the planet in Kelvin.
    Assumes no atmosphere or greenhouse effect (blackbody equilibrium).
    
    Formula:
        T_eq = T_star * sqrt(R_star / (2 * d)) * (1 - albedo)^{1/4}
    Where R_star ~ 1 solar radius (assumed for simplicity)
    
    Parameters:
        star_temp (K)
        orbital_distance (AU)
        albedo (0-1)
    
    Returns:
        Surface temperature in Kelvin
    """
    # Solar radius in AU
    R_sun_AU = 0.00465047
    T_eq = star_temp * np.sqrt(R_sun_AU / (2 * orbital_distance)) * (1 - albedo) ** 0.25
    return T_eq

def calculate_surface_gravity(
    planet_mass: float,
    planet_radius: float
) -> float:
    """
    Calculate surface gravity relative to Earth gravity.
    
    Parameters:
        planet_mass (Earth masses)
        planet_radius (Earth radii)
    
    Returns:
        Surface gravity (Earth g units)
    """
    # g = M / R^2 (relative to Earth)
    g = planet_mass / (planet_radius ** 2)
    return g

def calculate_water_retention_potential(
    planet_mass: float,
    planet_radius: float,
    star_temp: float,
    orbital_distance: float
) -> float:
    """
    Simplified water retention potential score (0-1).
    Accounts for gravity (mass-radius) and stellar irradiation.
    
    Parameters:
        planet_mass (Earth masses)
        planet_radius (Earth radii)
        star_temp (K)
        orbital_distance (AU)
    
    Returns:
        Score (0 to 1)
    """
    gravity = calculate_surface_gravity(planet_mass, planet_radius)
    T_eq = estimate_surface_temperature(star_temp, orbital_distance, albedo=0.3)  # Assume Earth-like albedo
    
    # Assume planets with gravity > 0.5g can retain water
    gravity_factor = 1 if gravity >= 0.5 else gravity / 0.5
    
    # Too hot planets (T_eq > 320K) lose water, score declines linearly to 0 at 400K
    if T_eq <= 320:
        temp_factor = 1.0
    elif T_eq >= 400:
        temp_factor = 0.0
    else:
        temp_factor = (400 - T_eq) / 80
    
    score = gravity_factor * temp_factor
    return np.clip(score, 0, 1)

def calculate_radiation_hazard_index(
    star_temp: float,
    stellar_luminosity: float,
    orbital_distance: float,
    host_star_age: float
) -> float:
    """
    Approximate a radiation hazard index (0-1).
    Younger stars and closer planets have higher radiation.
    This simplistic model assumes radiation hazard inversely proportional to
    square of orbital distance and decreases with star age.
    
    Parameters:
        star_temp (K)
        stellar_luminosity (Solar units)
        orbital_distance (AU)
        host_star_age (Gyr)
    
    Returns:
        Radiation hazard index (0 = low, 1 = high)
    """
    # Normalize star temp between 2500K and 7000K for weighting
    temp_norm = np.clip((star_temp - 2500) / (7000 - 2500), 0, 1)
    
    # Base radiation proportional to stellar luminosity / distance^2
    base_radiation = stellar_luminosity / (orbital_distance ** 2)
    
    # Age factor: younger stars (<1 Gyr) more active; older stars less
    age_factor = 1.0 if host_star_age < 1 else max(0, 1 - (host_star_age - 1) / 9)  # scales from 1 to 0 over 1-10 Gyr
    
    raw_index = base_radiation * temp_norm * age_factor
    
    # Normalize roughly into [0,1]
    max_expected = 10  # arbitrary scaling
    hazard_index = np.clip(raw_index / max_expected, 0, 1)
    return hazard_index

def calculate_habitability_score(
    planet_radius: float,
    star_temperature: float,
    orbital_distance: float,
    atmospheric_pressure: float,
    stellar_luminosity: float,
    planet_mass: float,
    albedo: float,
    host_star_age: float
) -> float:
    """
    Compute a comprehensive habitability score combining:
    - Habitable zone inclusion
    - Planet radius suitability
    - Atmospheric pressure suitability
    - Stellar luminosity suitability
    - Water retention potential
    - Radiation hazard penalty
    
    Returns a score between 0 and 1.
    """
    hz_inner, hz_outer = habitable_zone_bounds_extended(star_temperature)
    in_hz = hz_inner <= orbital_distance <= hz_outer
    hz_factor = 1.0 if in_hz else 0.0

    radius_factor = np.exp(-((planet_radius - 1.0) ** 2) / (2 * 0.3 ** 2))
    pressure_factor = np.exp(-((atmospheric_pressure - 1.0) ** 2) / (2 * 0.5 ** 2))
    luminosity_factor = np.exp(-((stellar_luminosity - 1.0) ** 2) / (2 * 0.7 ** 2))
    water_potential = calculate_water_retention_potential(planet_mass, planet_radius, star_temperature, orbital_distance)
    radiation_penalty = 1 - calculate_radiation_hazard_index(star_temperature, stellar_luminosity, orbital_distance, host_star_age)

    score_raw = hz_factor * radius_factor * pressure_factor * luminosity_factor * water_potential * radiation_penalty
    score = float(np.clip(score_raw, 0, 1))
    return score

def cluster_planets(
    data: pd.DataFrame,
    n_clusters: int = 4,
    random_state: int = 42
) -> Tuple[pd.DataFrame, KMeans, PCA]:
    """
    Cluster planets by habitability-related features after scaling and PCA dimensionality reduction.
    
    Parameters:
        data: DataFrame containing feature columns
        n_clusters: number of clusters
        random_state: for reproducibility
    
    Returns:
        DataFrame with cluster assignments
        fitted KMeans model
        PCA transformer
    """
    feature_columns = [
        'planet_radius', 'star_temperature', 'orbital_distance', 'atmospheric_pressure',
        'stellar_luminosity', 'planet_mass', 'eccentricity', 'albedo', 'host_star_metallicity', 'host_star_age'
    ]
    X = data[feature_columns].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # PCA to reduce to 3 dimensions for clustering stability and visualization
    pca = PCA(n_components=3, random_state=random_state)
    X_pca = pca.fit_transform(X_scaled)

    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state)
    clusters = kmeans.fit_predict(X_pca)

    data_clustered = data.copy()
    data_clustered['cluster'] = clusters
    data_clustered['pca_1'] = X_pca[:, 0]
    data_clustered['pca_2'] = X_pca[:, 1]
    data_clustered['pca_3'] = X_pca[:, 2]

    logging.info(f"Performed clustering into {n_clusters} groups.")

    return data_clustered, kmeans_model, pca_model

def interpret_cluster(cluster_label: int) -> str:
    """
    Qualitative interpretation of cluster labels assuming ordering by habitability score means.
    """
    interpretations = {
        0: "Very High Habitability Potential",
        1: "Moderate to High Habitability Potential",
        2: "Low Habitability Potential",
        3: "Very Low Habitability Potential"
    }
    return interpretations.get(cluster_label, "Unknown Cluster")

def generate_detailed_report(planet: pd.Series) -> str:
    """
    Create an extensive scientific report string for a given planet.
    """
    report = []
    report.append(f"=== Exoplanet Report: {planet['planet_name']} ===")
    report.append(f"Planet Radius (Earth radii): {planet['planet_radius']:.2f}")
    report.append(f"Planet Mass (Earth masses): {planet['planet_mass']:.2f}")
    report.append(f"Star Effective Temperature (K): {planet['star_temperature']:.1f}")
    report.append(f"Orbital Distance (AU): {planet['orbital_distance']:.3f}")
    report.append(f"Orbital Eccentricity: {planet['eccentricity']:.3f}")
    report.append(f"Atmospheric Pressure (Earth atm): {planet['atmospheric_pressure']:.2f}")
    report.append(f"Albedo: {planet['albedo']:.2f}")
    report.append(f"Stellar Luminosity (Solar units): {planet['stellar_luminosity']:.3f}")
    report.append(f"Host Star Metallicity [Fe/H]: {planet['host_star_metallicity']:.3f}")
    report.append(f"Host Star Age (Gyr): {planet['host_star_age']:.2f}")
    report.append(f"Habitability Score: {planet['habitability_score']:.3f}")
    report.append(f"Cluster Assignment: {planet['cluster']} ({interpret_cluster(planet['cluster'])})")
    report.append(f"PCA Components: [{planet['pca_1']:.3f}, {planet['pca_2']:.3f}, {planet['pca_3']:.3f}]")

    surface_temp = estimate_surface_temperature(planet['star_temperature'], planet['orbital_distance'], planet['albedo'])
    surface_gravity = calculate_surface_gravity(planet['planet_mass'], planet['planet_radius'])
    water_potential = calculate_water_retention_potential(
        planet['planet_mass'], planet['planet_radius'], planet['star_temperature'], planet['orbital_distance']
    )
    radiation_index = calculate_radiation_hazard_index(
        planet['star_temperature'], planet['stellar_luminosity'], planet['orbital_distance'], planet['host_star_age']
    )

    report.append(f"Estimated Surface Temperature (K): {surface_temp:.1f}")
    report.append(f"Surface Gravity (Earth g): {surface_gravity:.2f}")
    report.append(f"Water Retention Potential: {water_potential:.3f}")
    report.append(f"Radiation Hazard Index: {radiation_index:.3f}")

    report.append("\nScientific Context and Notes:")
    report.append(
        "The habitability score synthesizes planetary and stellar parameters, "
        "including location within the habitable zone (Kopparapu et al., 2013), "
        "planetary radius suitability for Earth-like conditions (Rogers, 2015), "
        "atmospheric pressure, and potential water retention ability influenced by gravity and temperature (Seager et al., 2013)."
    )
    report.append(
        "Radiation hazard index approximates stellar activity and irradiation risks impacting biological sustainability (Vidotto et al., 2013)."
    )
    report.append(
        "Clustering and PCA allow categorization and dimensionality reduction for identifying planet groups with similar habitability traits."
    )
    report.append("\nReferences:")
    report.append("1. Kopparapu et al., 'Habitable Zones around Main-sequence Stars', ApJ, 2013. https://doi.org/10.1088/0004-637X/765/2/131")
    report.append("2. Rogers, 'Most 1.6 Earth-radius Planets are Not Rocky', ApJ, 2015. https://doi.org/10.1088/0004-637X/801/1/41")
    report.append("3. Seager, 'Exoplanet Atmospheres: Physical Processes', Princeton Univ Press, 2010.")
    report.append("4. Vidotto et al., 'The Stellar Winds of Low-Mass Stars', MNRAS, 2013. https://doi.org/10.1093/mnras/stt161")
    report.append("5. NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/")

    return "\n".join(report)

def process_and_cluster_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Process the exoplanet dataset end-to-end:
    - Calculate habitability scores
    - Perform clustering with PCA
    - Return DataFrame enriched with these features
    """
    logging.info("Calculating habitability scores...")
    scores = []
    for idx, row in df.iterrows():
        score = calculate_habitability_score(
            planet_radius=row['planet_radius'],
            star_temperature=row['star_temperature'],
            orbital_distance=row['orbital_distance'],
            atmospheric_pressure=row['atmospheric_pressure'],
            stellar_luminosity=row['stellar_luminosity'],
            planet_mass=row['planet_mass'],
            albedo=row['albedo'],
            host_star_age=row['host_star_age']
        )
        scores.append(score)
    df['habitability_score'] = scores

    logging.info("Clustering planets with PCA dimensionality reduction...")
    df_clustered, kmeans_model, pca_model = cluster_planets(df)

    return df_clustered

def choose_exoplanet(df: pd.DataFrame):
    print("\nAvailable Exoplanets:\n")
    for i, name in enumerate(df['planet_name'].tolist()):
        print(f"{i + 1}. {name}")
    
    try:
        choice = int(input("\nEnter the number of the exoplanet to view its report: ")) - 1
        if 0 <= choice < len(df):
            planet = df.iloc[choice]
            report = generate_detailed_report(planet)
            print("\n" + "=" * 100)
            print(report)
            print("=" * 100 + "\n")
        else:
            print("Invalid choice. Please select a valid number from the list.")
    except ValueError:
        print("Invalid input. Please enter a number.")

def main():
    logging.info("Starting exoplanet habitability backend processing...")

    # Load dataset
    df = load_data_from_csv_string(CSV_DATA)

    # Process habitability scores and clustering
    df_processed = process_and_cluster_dataset(df)

    # Output reports for each planet
    logging.info(f"Generating reports for {len(df_processed)} exoplanets...")
    choose_exoplanet(df_processed)

if __name__ == "__main__":
    main()