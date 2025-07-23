import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from typing import Tuple, List, Dict
import logging

# Setup professional logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Path setup for reading the CSV relative to the script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE_PATH = os.path.join(BASE_DIR, "../src/data/exoplanets.csv")

def load_exoplanets_from_csv(file_path: str) -> pd.DataFrame:
    """
    Load the comprehensive exoplanet dataset from CSV file (5900+ planets).

    Args:
        file_path: Relative or absolute path to the CSV file.

    Returns:
        DataFrame with all exoplanet data properly typed.
    """
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        logging.info(f"Successfully loaded {len(df)} exoplanets from {file_path}")
        logging.info(f"Columns available: {list(df.columns)}")
        
        # Clean and standardize column names if needed
        df.columns = df.columns.str.strip().str.lower()
        
        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
        
        # Fill string columns with 'Unknown'
        string_columns = df.select_dtypes(include=['object']).columns
        df[string_columns] = df[string_columns].fillna('Unknown')
        
        return df

    except Exception as e:
        logging.error(f"Failed to load CSV file from {file_path}: {e}")
        raise

def convert_to_frontend_format(df: pd.DataFrame) -> List[Dict]:
    """
    Convert the pandas DataFrame to the format expected by the frontend.
    """
    planets = []
    
    for idx, row in df.iterrows():
        try:
            # Map CSV columns to frontend format
            planet = {
                'id': f"planet-{idx}",
                'name': str(row.get('name', row.get('planet_name', f'Planet-{idx}'))),
                'distanceFromEarth': float(row.get('distance', row.get('sy_dist', 100))),
                'orbitalPeriod': float(row.get('orbital_period', row.get('pl_orbper', 365))),
                'temperature': float(row.get('temperature', row.get('pl_eqt', row.get('st_teff', 288)))),
                'starType': str(row.get('star_type', row.get('st_spectype', 'G2V'))),
                'radius': float(row.get('radius', row.get('pl_rade', 1.0))),
                'mass': float(row.get('mass', row.get('pl_bmasse', 1.0))),
                'discoveryYear': int(row.get('discovery_year', row.get('disc_year', 2000))),
                'discoveryMethod': str(row.get('discovery_method', row.get('discoverymethod', 'Transit'))),
                'discoveryFacility': str(row.get('discovery_facility', row.get('disc_facility', 'Unknown'))),
                'constellation': str(row.get('constellation', 'Unknown')),
                'stellarTemperature': float(row.get('stellar_temperature', row.get('st_teff', 5778))),
                'orbitalDistance': float(row.get('orbital_distance', row.get('pl_orbsmax', 1.0))),
            }
            
            # Calculate habitability score using our backend function
            planet['habitabilityScore'] = calculate_habitability_score_for_planet(row)
            planet['inHabitableZone'] = is_in_habitable_zone(row)
            
            planets.append(planet)
            
        except Exception as e:
            logging.warning(f"Error processing planet at index {idx}: {e}")
            continue
    
    return planets

def calculate_habitability_score_for_planet(row) -> int:
    """Calculate habitability score (0-100) for a single planet from CSV data."""
    try:
        # Extract values with fallbacks
        planet_radius = float(row.get('radius', row.get('pl_rade', 1.0)))
        star_temp = float(row.get('stellar_temperature', row.get('st_teff', 5778)))
        orbital_distance = float(row.get('orbital_distance', row.get('pl_orbsmax', 1.0)))
        planet_mass = float(row.get('mass', row.get('pl_bmasse', 1.0)))
        planet_temp = float(row.get('temperature', row.get('pl_eqt', 288)))
        
        # Use the existing habitability calculation
        score = calculate_habitability_score(
            planet_radius=planet_radius,
            star_temperature=star_temp,
            orbital_distance=orbital_distance,
            atmospheric_pressure=1.0,  # Default
            stellar_luminosity=1.0,    # Default
            planet_mass=planet_mass,
            albedo=0.3,               # Default
            host_star_age=4.6         # Default
        )
        
        return int(score * 100)  # Convert to 0-100 scale
        
    except Exception as e:
        logging.warning(f"Error calculating habitability score: {e}")
        return 25  # Default moderate score

def is_in_habitable_zone(row) -> bool:
    """Determine if planet is in habitable zone."""
    try:
        temp = float(row.get('temperature', row.get('pl_eqt', 0)))
        if temp > 0:
            return 200 <= temp <= 350  # Conservative habitable zone
        
        # Fallback: check orbital distance
        orbital_dist = float(row.get('orbital_distance', row.get('pl_orbsmax', 0)))
        star_temp = float(row.get('stellar_temperature', row.get('st_teff', 5778)))
        
        if orbital_dist > 0 and star_temp > 0:
            hz_inner, hz_outer = habitable_zone_bounds_extended(star_temp)
            return hz_inner <= orbital_dist <= hz_outer
            
        return False
        
    except Exception:
        return False

# Load data at the top-level so it's ready for processing
try:
    exoplanet_df = load_exoplanets_from_csv(CSV_FILE_PATH)
    logging.info(f"Loaded {len(exoplanet_df)} exoplanets from CSV")
except Exception as e:
    logging.error(f"Failed to load exoplanet data: {e}")
    exoplanet_df = pd.DataFrame()  # Empty DataFrame as fallback

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