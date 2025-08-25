#!/usr/bin/env python3
"""
NASA Exoplanet Data Ingestion Pipeline for Cosmic Life Explorer
Fetches, processes, and enriches NASA exoplanet data according to master schema.
"""

import requests
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime
import json
from io import StringIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nasa_ingestion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class NASAExoplanetIngestion:
    """Comprehensive NASA exoplanet data ingestion and processing pipeline."""
    
    def __init__(self):
        self.nasa_api_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT+pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_rade,pl_masse,st_teff,st_rad,st_mass+FROM+pscomppars&format=csv"
        self.output_file = "nasa_exoplanets_processed.csv"
        
        # Column mapping from NASA to Cosmic Life Explorer schema
        self.column_mapping = {
            'pl_name': 'planet_name',
            'hostname': 'host_name', 
            'discoverymethod': 'disc_method',
            'disc_year': 'disc_year',
            'pl_orbper': 'pl_orbper_days',
            'pl_rade': 'pl_rad_rearth',
            'pl_masse': 'pl_mass_mearth',
            'st_teff': 'st_teff_k',
            'st_rad': 'st_rad_rsun',
            'st_mass': 'st_mass_msun'
        }
        
        # Constants for unit conversions
        self.EARTH_TO_JUPITER_MASS = 317.828
        self.EARTH_TO_JUPITER_RADIUS = 11.209
        
    def fetch_nasa_data(self) -> pd.DataFrame:
        """Fetch CSV data from NASA Exoplanet Archive."""
        try:
            logger.info(f"Fetching data from NASA API: {self.nasa_api_url}")
            
            response = requests.get(self.nasa_api_url, timeout=30)
            response.raise_for_status()
            
            # Ensure UTF-8 encoding
            response.encoding = 'utf-8'
            csv_content = response.text
            
            logger.info(f"Successfully fetched {len(csv_content)} characters")
            
            # Parse CSV with pandas
            df = pd.read_csv(
                StringIO(csv_content),
                encoding='utf-8',
                na_values=['', 'nan', 'NaN', 'NULL', 'null'],
                keep_default_na=False
            )
            
            logger.info(f"Parsed CSV with {len(df)} rows and {len(df.columns)} columns")
            logger.info(f"Columns: {list(df.columns)}")
            
            return df
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch data from NASA API: {e}")
            raise
        except Exception as e:
            logger.error(f"Error parsing NASA CSV: {e}")
            raise
    
    def clean_and_normalize_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and normalize the raw data."""
        logger.info("Cleaning and normalizing data...")
        
        # Create a copy to avoid modifying original
        df_clean = df.copy()
        
        # Strip whitespace from string columns
        string_columns = df_clean.select_dtypes(include=['object']).columns
        for col in string_columns:
            df_clean[col] = df_clean[col].astype(str).str.strip()
        
        # Normalize discovery method to lowercase
        if 'discoverymethod' in df_clean.columns:
            df_clean['discoverymethod'] = df_clean['discoverymethod'].str.lower()
        
        # Convert numeric columns, handling errors gracefully
        numeric_columns = ['disc_year', 'pl_orbper', 'pl_rade', 'pl_masse', 'st_teff', 'st_rad', 'st_mass']
        for col in numeric_columns:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
        
        logger.info("Data cleaning completed")
        return df_clean
    
    def derive_additional_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Derive additional fields from existing data."""
        logger.info("Deriving additional fields...")
        
        df_derived = df.copy()
        
        # Compute Jupiter masses from Earth masses
        if 'pl_masse' in df_derived.columns:
            df_derived['pl_mass_mjup'] = df_derived['pl_masse'] / self.EARTH_TO_JUPITER_MASS
        
        # Compute Jupiter radii from Earth radii  
        if 'pl_rade' in df_derived.columns:
            df_derived['pl_rad_rjup'] = df_derived['pl_rade'] / self.EARTH_TO_JUPITER_RADIUS
        
        # Compute simple habitable zone flags
        if all(col in df_derived.columns for col in ['st_teff', 'st_rad', 'st_mass']):
            df_derived['habitable_zone_flag'] = self._compute_habitable_zone_flags(df_derived)
        
        # Compute Earth Similarity Index (ESI) if mass and radius available
        if all(col in df_derived.columns for col in ['pl_masse', 'pl_rade']):
            df_derived['esi'] = self._compute_esi(df_derived)
        
        # Add data quality flags
        df_derived['has_mass'] = df_derived['pl_masse'].notna()
        df_derived['has_radius'] = df_derived['pl_rade'].notna()
        df_derived['has_stellar_data'] = df_derived['st_teff'].notna() & df_derived['st_rad'].notna() & df_derived['st_mass'].notna()
        
        logger.info("Additional fields derived successfully")
        return df_derived
    
    def _compute_habitable_zone_flags(self, df: pd.DataFrame) -> pd.Series:
        """Compute simple habitable zone flags based on stellar parameters."""
        # Simple habitable zone calculation based on stellar luminosity
        # This is a simplified approach - more sophisticated calculations could be added
        
        # Estimate stellar luminosity from mass and radius (rough approximation)
        stellar_luminosity = (df['st_mass'] ** 3.5) * (df['st_rad'] ** 2)
        
        # Simple habitable zone boundaries (very rough)
        inner_boundary = 0.95 * np.sqrt(stellar_luminosity)
        outer_boundary = 1.37 * np.sqrt(stellar_luminosity)
        
        # Get orbital period in years (approximate conversion)
        orbital_period_years = df['pl_orbper'] / 365.25
        semi_major_axis = (orbital_period_years ** 2 * df['st_mass']) ** (1/3)
        
        # Classify habitable zone position
        def classify_habitable_zone(row):
            if pd.isna(row['semi_major_axis']) or pd.isna(row['inner_boundary']) or pd.isna(row['outer_boundary']):
                return 'unknown'
            elif row['semi_major_axis'] < row['inner_boundary']:
                return 'inner'
            elif row['semi_major_axis'] > row['outer_boundary']:
                return 'outer'
            else:
                return 'habitable'
        
        # Create temporary dataframe for calculation
        temp_df = pd.DataFrame({
            'semi_major_axis': semi_major_axis,
            'inner_boundary': inner_boundary,
            'outer_boundary': outer_boundary
        })
        
        return temp_df.apply(classify_habitable_zone, axis=1)
    
    def _compute_esi(self, df: pd.DataFrame) -> pd.Series:
        """Compute Earth Similarity Index (ESI)."""
        # ESI calculation based on mass and radius similarity to Earth
        # ESI = 1 - sqrt(0.5 * ((mass_diff/mass_earth)^2 + (radius_diff/radius_earth)^2))
        
        mass_diff = (df['pl_masse'] - 1.0) / 1.0  # Difference from Earth mass
        radius_diff = (df['pl_rade'] - 1.0) / 1.0  # Difference from Earth radius
        
        esi = 1 - np.sqrt(0.5 * (mass_diff**2 + radius_diff**2))
        
        # Clamp ESI to [0, 1] range
        esi = np.clip(esi, 0, 1)
        
        return esi
    
    def validate_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
        """Validate data according to requirements."""
        logger.info("Validating data...")
        
        initial_count = len(df)
        validation_results = {
            'total_records': initial_count,
            'valid_records': 0,
            'invalid_records': 0,
            'validation_errors': []
        }
        
        # Required field validation
        required_fields = ['pl_name', 'hostname', 'discoverymethod', 'disc_year']
        missing_required = df[required_fields].isnull().any(axis=1)
        
        if missing_required.any():
            validation_results['validation_errors'].append(
                f"Found {missing_required.sum()} rows with missing required fields"
            )
        
        # Year validation (>= 1988)
        if 'disc_year' in df.columns:
            invalid_years = df['disc_year'] < 1988
            if invalid_years.any():
                validation_results['validation_errors'].append(
                    f"Found {invalid_years.sum()} rows with discovery year < 1988"
                )
        
        # Numeric field validation (>= 0)
        numeric_fields = ['pl_orbper', 'pl_rade', 'pl_masse', 'st_teff', 'st_rad', 'st_mass']
        for field in numeric_fields:
            if field in df.columns:
                negative_values = (df[field] < 0) & df[field].notna()
                if negative_values.any():
                    validation_results['validation_errors'].append(
                        f"Found {negative_values.sum()} rows with negative {field}"
                    )
        
        # Filter valid records
        valid_mask = ~missing_required & (df['disc_year'] >= 1988)
        
        # For numeric fields, ensure they're non-negative if present
        for field in numeric_fields:
            if field in df.columns:
                valid_mask = valid_mask & ((df[field] >= 0) | df[field].isna())
        
        df_valid = df[valid_mask].copy()
        
        validation_results['valid_records'] = len(df_valid)
        validation_results['invalid_records'] = initial_count - len(df_valid)
        
        logger.info(f"Validation complete: {validation_results['valid_records']} valid, {validation_results['invalid_records']} invalid")
        
        if validation_results['validation_errors']:
            for error in validation_results['validation_errors']:
                logger.warning(error)
        
        return df_valid, validation_results
    
    def map_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Map columns from NASA schema to Cosmic Life Explorer schema."""
        logger.info("Mapping columns to master schema...")
        
        # Create new dataframe with mapped columns
        df_mapped = pd.DataFrame()
        
        for nasa_col, cosmic_col in self.column_mapping.items():
            if nasa_col in df.columns:
                df_mapped[cosmic_col] = df[nasa_col]
            else:
                logger.warning(f"Column {nasa_col} not found in source data")
                df_mapped[cosmic_col] = None
        
        # Add derived fields
        derived_fields = ['pl_mass_mjup', 'pl_rad_rjup', 'habitable_zone_flag', 'esi', 
                         'has_mass', 'has_radius', 'has_stellar_data']
        
        for field in derived_fields:
            if field in df.columns:
                df_mapped[field] = df[field]
        
        logger.info(f"Column mapping complete. Final columns: {list(df_mapped.columns)}")
        return df_mapped
    
    def finalize_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Final data preparation and sorting."""
        logger.info("Finalizing data...")
        
        # Fill missing values with appropriate defaults
        df_final = df.copy()
        
        # String fields: empty string
        string_columns = df_final.select_dtypes(include=['object']).columns
        for col in string_columns:
            df_final[col] = df_final[col].fillna('')
        
        # Numeric fields: keep as NaN (will be handled by frontend)
        
        # Sort by planet name for consistency
        if 'planet_name' in df_final.columns:
            df_final = df_final.sort_values('planet_name')
        
        # Reset index
        df_final = df_final.reset_index(drop=True)
        
        logger.info("Data finalization complete")
        return df_final
    
    def generate_summary_report(self, df: pd.DataFrame, validation_results: Dict) -> str:
        """Generate comprehensive summary report."""
        report = []
        report.append("=" * 80)
        report.append("NASA EXOPLANET DATA INGESTION SUMMARY REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Basic statistics
        report.append("DATA OVERVIEW:")
        report.append(f"  Total records processed: {validation_results['total_records']}")
        report.append(f"  Valid records: {validation_results['valid_records']}")
        report.append(f"  Invalid records: {validation_results['invalid_records']}")
        report.append(f"  Success rate: {(validation_results['valid_records']/validation_results['total_records']*100):.1f}%")
        report.append("")
        
        # Column statistics
        report.append("COLUMN STATISTICS:")
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                non_null = df[col].notna().sum()
                if non_null > 0:
                    min_val = df[col].min()
                    max_val = df[col].max()
                    mean_val = df[col].mean()
                    report.append(f"  {col}: {non_null} non-null values, range [{min_val:.3f}, {max_val:.3f}], mean {mean_val:.3f}")
                else:
                    report.append(f"  {col}: No non-null values")
            else:
                non_null = df[col].notna().sum()
                unique_count = df[col].nunique()
                report.append(f"  {col}: {non_null} non-null values, {unique_count} unique values")
        report.append("")
        
        # Validation errors
        if validation_results['validation_errors']:
            report.append("VALIDATION ERRORS:")
            for error in validation_results['validation_errors']:
                report.append(f"  - {error}")
            report.append("")
        
        # Data quality metrics
        report.append("DATA QUALITY METRICS:")
        if 'has_mass' in df.columns:
            mass_coverage = df['has_mass'].sum() / len(df) * 100
            report.append(f"  Mass data coverage: {mass_coverage:.1f}%")
        
        if 'has_radius' in df.columns:
            radius_coverage = df['has_radius'].sum() / len(df) * 100
            report.append(f"  Radius data coverage: {radius_coverage:.1f}%")
        
        if 'has_stellar_data' in df.columns:
            stellar_coverage = df['has_stellar_data'].sum() / len(df) * 100
            report.append(f"  Stellar data coverage: {stellar_coverage:.1f}%")
        
        if 'esi' in df.columns:
            esi_coverage = df['esi'].notna().sum() / len(df) * 100
            report.append(f"  ESI coverage: {esi_coverage:.1f}%")
        
        report.append("")
        report.append("=" * 80)
        
        return "\n".join(report)
    
    def run_pipeline(self) -> bool:
        """Run the complete ingestion pipeline."""
        try:
            logger.info("Starting NASA Exoplanet Data Ingestion Pipeline")
            logger.info("=" * 60)
            
            # Step 1: Fetch data
            df_raw = self.fetch_nasa_data()
            
            # Step 2: Clean and normalize
            df_clean = self.clean_and_normalize_data(df_raw)
            
            # Step 3: Derive additional fields
            df_derived = self.derive_additional_fields(df_clean)
            
            # Step 4: Validate data
            df_valid, validation_results = self.validate_data(df_derived)
            
            # Step 5: Map columns
            df_mapped = self.map_columns(df_valid)
            
            # Step 6: Finalize data
            df_final = self.finalize_data(df_mapped)
            
            # Step 7: Save processed data
            output_path = f"../public/{self.output_file}"
            df_final.to_csv(output_path, index=False, encoding='utf-8')
            logger.info(f"Processed data saved to: {output_path}")
            
            # Step 8: Generate and save report
            report = self.generate_summary_report(df_final, validation_results)
            report_path = f"../public/nasa_ingestion_report.txt"
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report)
            logger.info(f"Summary report saved to: {report_path}")
            
            # Print summary to console
            print("\n" + report)
            
            logger.info("Pipeline completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            return False

def main():
    """Main execution function."""
    print("🚀 NASA Exoplanet Data Ingestion Pipeline")
    print("=" * 50)
    
    pipeline = NASAExoplanetIngestion()
    success = pipeline.run_pipeline()
    
    if success:
        print("\n✅ Pipeline completed successfully!")
        print("📁 Check the public/ directory for output files")
    else:
        print("\n❌ Pipeline failed. Check logs for details.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
