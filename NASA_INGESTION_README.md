# NASA Exoplanet Data Ingestion Pipeline

A comprehensive data engineering pipeline that fetches, processes, and enriches NASA exoplanet data for the Cosmic Life Explorer application.

## 🚀 Overview

This pipeline ingests raw exoplanet data from the NASA Exoplanet Archive, applies comprehensive data cleaning and validation, derives additional fields, and outputs a clean, enriched CSV ready for analysis in the Cosmic Life Explorer.

## 📋 Features

- **Direct NASA API Integration**: Fetches data from NASA Exoplanet Archive TAP service
- **Comprehensive Data Cleaning**: Handles missing values, encoding issues, and data normalization
- **Schema Mapping**: Transforms NASA schema to Cosmic Life Explorer master schema
- **Derived Fields**: Computes Jupiter masses/radii, habitable zone flags, and Earth Similarity Index
- **Data Validation**: Ensures data quality with comprehensive validation rules
- **Rich Output**: Produces clean CSV with metadata and quality reports

## 🏗️ Architecture

```
NASA Exoplanet Archive → Python Pipeline → Processed CSV → TypeScript Loader → Frontend
```

### Components

1. **Python Ingestion Pipeline** (`backend/nasa_exoplanet_ingestion.py`)
2. **TypeScript Data Schema** (`src/data/nasaProcessedExoplanets.ts`)
3. **Data Loader Service** (`src/services/processedNasaLoader.ts`)
4. **Test Suite** (`backend/test_nasa_ingestion.py`)

## 🛠️ Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Required Python packages (see `backend/requirements.txt`)

### Installation

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Verify installation:**
   ```bash
   python test_nasa_ingestion.py
   ```

## 📊 Data Schema

### Input Schema (NASA)
- `pl_name`: Planet name
- `hostname`: Host star name
- `discoverymethod`: Discovery method
- `disc_year`: Discovery year
- `pl_orbper`: Orbital period (days)
- `pl_rade`: Planet radius (Earth radii)
- `pl_masse`: Planet mass (Earth masses)
- `st_teff`: Stellar effective temperature (K)
- `st_rad`: Stellar radius (Solar radii)
- `st_mass`: Stellar mass (Solar masses)

### Output Schema (Cosmic Life Explorer)
- `planet_name`: Planet name
- `host_name`: Host star name
- `disc_method`: Discovery method (normalized)
- `disc_year`: Discovery year
- `pl_orbper_days`: Orbital period (days)
- `pl_rad_rearth`: Planet radius (Earth radii)
- `pl_mass_mearth`: Planet mass (Earth masses)
- `st_teff_k`: Stellar temperature (K)
- `st_rad_rsun`: Stellar radius (Solar radii)
- `st_mass_msun`: Stellar mass (Solar masses)
- `pl_mass_mjup`: Planet mass (Jupiter masses) - derived
- `pl_rad_rjup`: Planet radius (Jupiter radii) - derived
- `habitable_zone_flag`: Habitable zone classification - derived
- `esi`: Earth Similarity Index (0-1) - derived
- `has_mass`: Boolean flag for mass data
- `has_radius`: Boolean flag for radius data
- `has_stellar_data`: Boolean flag for stellar data

## 🔄 Pipeline Steps

### 1. Data Fetching
- Connects to NASA Exoplanet Archive TAP service
- Downloads CSV with specified columns
- Ensures UTF-8 encoding

### 2. Data Cleaning
- Strips whitespace from string fields
- Normalizes discovery methods to lowercase
- Converts numeric fields with error handling
- Treats missing values appropriately

### 3. Field Derivation
- **Jupiter Conversions**: Mass and radius in Jupiter units
- **Habitable Zone**: Simple classification based on stellar parameters
- **Earth Similarity Index**: Mass and radius similarity to Earth
- **Data Quality Flags**: Boolean indicators for data completeness

### 4. Data Validation
- Required fields present (planet_name, host_name, disc_method, disc_year)
- Discovery year ≥ 1988
- Numeric fields ≥ 0
- Comprehensive error reporting

### 5. Schema Mapping
- Transforms NASA column names to Cosmic Life Explorer schema
- Preserves all derived fields
- Maintains data types and relationships

### 6. Output Generation
- Clean CSV with all mapped and derived fields
- Sorted by planet name for consistency
- Comprehensive quality report
- Detailed logging

## 🚀 Usage

### Run the Full Pipeline

```bash
cd backend
python nasa_exoplanet_ingestion.py
```

### Run Tests Only

```bash
cd backend
python test_nasa_ingestion.py
```

### Output Files

The pipeline generates:

1. **`public/nasa_exoplanets_processed.csv`**: Clean, processed data
2. **`public/nasa_ingestion_report.txt`**: Comprehensive quality report
3. **`backend/nasa_ingestion.log`**: Detailed execution log

## 📈 Data Quality Metrics

The pipeline provides comprehensive quality metrics:

- **Total Records**: Complete dataset size
- **Valid Records**: Records passing all validation rules
- **Success Rate**: Percentage of valid records
- **Column Coverage**: Data completeness for each field type
- **Validation Errors**: Detailed error reporting
- **Statistical Summary**: Min/max/mean for numeric fields

## 🔧 Customization

### Modify Column Mapping

Edit the `column_mapping` dictionary in `NASAExoplanetIngestion.__init__()`:

```python
self.column_mapping = {
    'nasa_column': 'cosmic_column',
    # ... add more mappings
}
```

### Add Derived Fields

Extend the `derive_additional_fields()` method:

```python
def derive_additional_fields(self, df: pd.DataFrame) -> pd.DataFrame:
    # ... existing code ...
    
    # Add your custom field
    df_derived['custom_field'] = self._compute_custom_field(df)
    
    return df_derived
```

### Modify Validation Rules

Update the `validate_data()` method:

```python
def validate_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
    # ... existing validation ...
    
    # Add custom validation rules
    custom_validation = self._custom_validation(df)
    
    return df_valid, validation_results
```

## 🧪 Testing

### Test Suite Coverage

The test suite validates:

- ✅ **Dependencies**: Required Python packages
- ✅ **API Connection**: NASA Exoplanet Archive connectivity
- ✅ **Data Processing**: Column mapping and field derivation
- ✅ **File Output**: CSV generation and file handling

### Running Tests

```bash
cd backend
python test_nasa_ingestion.py
```

### Test Output

```
🧪 NASA Exoplanet Data Ingestion Pipeline - Test Suite
============================================================
📦 Testing dependencies...
✅ requests: Available
✅ pandas: Available
✅ numpy: Available
✅ logging: Available
✅ All required packages available

🔗 Testing NASA API connection...
✅ API connection successful: 200
📄 Response size: 1234 characters
✅ CSV parsing successful: 10 rows, 10 columns
📊 Sample columns: ['pl_name', 'hostname', 'discoverymethod', 'disc_year', 'pl_orbper']
🪐 Sample data:
   pl_name      hostname discoverymethod  disc_year  pl_orbper  pl_rade  pl_masse  st_teff  st_rad  st_mass
0  Kepler-22b  Kepler-22         Transit       2011     289.9      2.4      5.4     5518    0.979     0.97
1  Proxima...  Proxima...  Radial Velocity       2016      11.2      1.1      1.3     3042    0.141    0.122
2  TRAPPIST-1e TRAPPIST-1         Transit       2017       6.1     0.92     0.77     2559    0.121    0.089

🔧 Testing data processing...
✅ Sample data created: 3 rows
✅ Column mapping successful: ['planet_name', 'host_name', 'disc_method', 'disc_year', 'pl_orbper_days', 'pl_rad_rearth', 'pl_mass_mearth', 'st_teff_k', 'st_rad_rsun', 'st_mass_msun']
✅ Derived fields calculated: Jupiter mass and radius
📊 Sample derived values:
  planet_name  pl_mass_mearth  pl_mass_mjup  pl_rad_rearth  pl_rad_rjup
0  Kepler-22b             5.4      0.017000            2.4      0.214000
1  Proxima Centauri b     1.3      0.004000            1.1      0.098000
2  TRAPPIST-1e            0.77     0.002000            0.92     0.082000

💾 Testing file output...
✅ Test file saved: ../public/test_nasa_output.csv
📄 File size: 456 bytes
✅ File readback successful: 2 rows
✅ Test file cleaned up

============================================================
📋 TEST SUMMARY
============================================================
✅ PASS Dependencies
✅ PASS NASA API Connection
✅ PASS Data Processing
✅ PASS File Output

📊 Results: 4/4 tests passed
🎉 All tests passed! Ready to run the full pipeline.
```

## 📊 Sample Output

### Processed CSV Structure

```csv
planet_name,host_name,disc_method,disc_year,pl_orbper_days,pl_rad_rearth,pl_mass_mearth,st_teff_k,st_rad_rsun,st_mass_msun,pl_mass_mjup,pl_rad_rjup,habitable_zone_flag,esi,has_mass,has_radius,has_stellar_data
Kepler-22b,Kepler-22,transit,2011,289.9,2.4,5.4,5518,0.979,0.97,0.017,0.214,habitable,0.45,true,true,true
Proxima Centauri b,Proxima Centauri,radial velocity,2016,11.2,1.1,1.3,3042,0.141,0.122,0.004,0.098,habitable,0.87,true,true,true
TRAPPIST-1e,TRAPPIST-1,transit,2017,6.1,0.92,0.77,2559,0.121,0.089,0.002,0.082,habitable,0.91,true,true,true
```

### Quality Report

```
================================================================================
NASA EXOPLANET DATA INGESTION SUMMARY REPORT
================================================================================
Generated: 2024-01-15 14:30:25

DATA OVERVIEW:
  Total records processed: 5,000
  Valid records: 4,850
  Invalid records: 150
  Success rate: 97.0%

COLUMN STATISTICS:
  planet_name: 5000 non-null values, 5000 unique values
  host_name: 5000 non-null values, 3200 unique values
  disc_method: 5000 non-null values, 8 unique values
  disc_year: 5000 non-null values, range [1988.000, 2024.000], mean 2012.456
  pl_orbper_days: 4200 non-null values, range [0.100, 36500.000], mean 245.789
  pl_rad_rearth: 3800 non-null values, range [0.300, 25.000], mean 2.456
  pl_mass_mearth: 3500 non-null values, range [0.010, 5000.000], mean 45.678
  st_teff_k: 4200 non-null values, range [2000.000, 8000.000], mean 4500.123
  st_rad_rsun: 4100 non-null values, range [0.100, 100.000], mean 1.234
  st_mass_msun: 4100 non-null values, range [0.080, 3.000], mean 0.987

DATA QUALITY METRICS:
  Mass data coverage: 70.0%
  Radius data coverage: 76.0%
  Stellar data coverage: 82.0%
  ESI coverage: 65.0%

================================================================================
```

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check internet connectivity
   - Verify NASA API endpoint is accessible
   - Check firewall settings

2. **CSV Parsing Errors**
   - Verify CSV format is correct
   - Check for encoding issues
   - Ensure required columns are present

3. **Missing Dependencies**
   - Run `pip install -r requirements.txt`
   - Check Python version compatibility

4. **File Output Errors**
   - Verify write permissions in output directory
   - Check available disk space
   - Ensure output directory exists

### Debug Mode

Enable detailed logging by modifying the logging level:

```python
logging.basicConfig(
    level=logging.DEBUG,  # Change from INFO to DEBUG
    # ... rest of config
)
```

## 📚 API Reference

### NASAExoplanetIngestion Class

#### Methods

- `fetch_nasa_data()`: Downloads raw data from NASA API
- `clean_and_normalize_data(df)`: Cleans and normalizes input data
- `derive_additional_fields(df)`: Computes derived fields
- `validate_data(df)`: Validates data quality
- `map_columns(df)`: Maps to output schema
- `finalize_data(df)`: Final data preparation
- `run_pipeline()`: Executes complete pipeline

#### Properties

- `nasa_api_url`: NASA API endpoint
- `output_file`: Output CSV filename
- `column_mapping`: Schema mapping dictionary

### ProcessedNASALoader Class

#### Methods

- `loadProcessedData()`: Loads processed CSV data
- `getAllPlanets()`: Retrieves all exoplanets
- `searchPlanets(query)`: Searches by name or host star
- `getDataQuality()`: Returns quality metrics
- `getColumnStatistics()`: Returns column statistics

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NASA Exoplanet Archive**: For providing the comprehensive exoplanet dataset
- **Pandas**: For powerful data manipulation capabilities
- **Python Community**: For excellent data science tools and libraries

## 📞 Support

For questions or issues:

1. Check the troubleshooting section above
2. Review the logs in `backend/nasa_ingestion.log`
3. Run the test suite to identify issues
4. Open an issue in the repository

---

**Happy exoplanet exploring! 🪐✨**
