import pandas as pd

# Loading file
file_path = 'Trial.xlsx'
df = pd.read_excel(file_path, sheet_name='Sheet1')

# Mapping chemical columns to survival % columns
chemical_columns = {
    'H2': ('H2', 'survival %'),
    'O2': ('O2', 'survival %.1'),
    'N2': ('N2', 'survival %.2'),
    'CO2': ('CO2', 'survival %.3'),
    'NH3': ('NH3', 'survival %.4'),
    'C2H6': ('C2H6`', 'survival %.5'),
    'SO2': ('SO2', 'survival %.6'),
    'H2S': ('H2S', 'survival %.7'),
}

# Function to parse concentration range
def parse_range(rng_str):
    try:
        parts = rng_str.replace('–', '-').split('-')
        return float(parts[0]), float(parts[1])
    except:
        return float('-inf'), float('inf')

# Getting survival % based on value
def get_survival_value(chem_name, value):
    conc_col, surv_col = chemical_columns[chem_name]
    for _, row in df[[conc_col, surv_col]].iterrows():
        try:
            low, high = parse_range(str(row[conc_col]))
            if low <= value < high:
                val = row[surv_col]
                return float(str(val).split()[0]) if pd.notna(val) else 0.0
        except:
            continue
    return 0.0

# Generating report
def generate_biosignature_report(user_input):
    temp = user_input.get("Temperature", 25)
    report = {}
    total = 0
    count = 0

    for chem in chemical_columns:
        value = user_input.get(chem)
        if value is not None:
            score = get_survival_value(chem, value)
            report[chem] = score
            total += score
            count += 1

    # Handling temperature as physical parameter
    if 0 <= temp <= 40:
        temp_score = 100
    else:
        temp_score = 50
    report["Temperature"] = temp_score
    total += temp_score
    count += 1

    report["Habitability Score"] = round(total / count, 2)
    return report

# Getting user input
print("Enter the concentration values for each chemical:")
user_input = {}
for chem in chemical_columns:
    try:
        val = float(input(f"{chem}: "))
        user_input[chem] = val
    except:
        print(f"Invalid input for {chem}, skipping.")

try:
    temp = float(input("Temperature (°C): "))
except:
    temp = 25  # defaulting value to 25 if not entered
user_input["Temperature"] = temp

# Generating and printing the final report
report = generate_biosignature_report(user_input)
print("\n BIOSIGNATURE REPORT")
for key, val in report.items():
    print(f"{key}: {val}%")