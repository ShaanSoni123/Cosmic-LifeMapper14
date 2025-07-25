// Biosignature Analysis based on backend/Code.py
import Papa from 'papaparse';

interface ChemicalData {
  concentration: string;
  survival: number;
}

interface BiosignatureInput {
  H2?: number;
  O2?: number;
  N2?: number;
  CO2?: number;
  NH3?: number;
  C2H6?: number;
  SO2?: number;
  H2S?: number;
  Temperature?: number;
}

interface BiosignatureReport {
  H2?: number;
  O2?: number;
  N2?: number;
  CO2?: number;
  NH3?: number;
  C2H6?: number;
  SO2?: number;
  H2S?: number;
  Temperature?: number;
  'Habitability Score': number;
}

// Chemical columns mapping from backend/Code.py
const chemicalColumns = {
  'H2': 'H2',
  'O2': 'O2', 
  'N2': 'N2',
  'CO2': 'CO2',
  'NH3': 'NH3',
  'C2H6': 'C2H6',
  'SO2': 'SO2',
  'H2S': 'H2S'
};

// Mock data structure similar to the Excel file from backend/Code.py
const mockChemicalData: { [key: string]: ChemicalData[] } = {
  'H2': [
    { concentration: '0-10', survival: 95 },
    { concentration: '10-50', survival: 85 },
    { concentration: '50-100', survival: 70 },
    { concentration: '100-500', survival: 40 },
    { concentration: '500+', survival: 10 }
  ],
  'O2': [
    { concentration: '0-5', survival: 20 },
    { concentration: '5-21', survival: 100 },
    { concentration: '21-40', survival: 90 },
    { concentration: '40-80', survival: 60 },
    { concentration: '80+', survival: 20 }
  ],
  'N2': [
    { concentration: '0-50', survival: 60 },
    { concentration: '50-78', survival: 100 },
    { concentration: '78-90', survival: 95 },
    { concentration: '90-95', survival: 80 },
    { concentration: '95+', survival: 40 }
  ],
  'CO2': [
    { concentration: '0-0.04', survival: 100 },
    { concentration: '0.04-1', survival: 90 },
    { concentration: '1-5', survival: 70 },
    { concentration: '5-10', survival: 40 },
    { concentration: '10+', survival: 10 }
  ],
  'NH3': [
    { concentration: '0-0.1', survival: 100 },
    { concentration: '0.1-1', survival: 80 },
    { concentration: '1-10', survival: 50 },
    { concentration: '10-50', survival: 20 },
    { concentration: '50+', survival: 5 }
  ],
  'C2H6': [
    { concentration: '0-0.01', survival: 100 },
    { concentration: '0.01-0.1', survival: 85 },
    { concentration: '0.1-1', survival: 60 },
    { concentration: '1-10', survival: 30 },
    { concentration: '10+', survival: 10 }
  ],
  'SO2': [
    { concentration: '0-0.001', survival: 100 },
    { concentration: '0.001-0.01', survival: 70 },
    { concentration: '0.01-0.1', survival: 40 },
    { concentration: '0.1-1', survival: 15 },
    { concentration: '1+', survival: 5 }
  ],
  'H2S': [
    { concentration: '0-0.001', survival: 100 },
    { concentration: '0.001-0.01', survival: 60 },
    { concentration: '0.01-0.1', survival: 30 },
    { concentration: '0.1-1', survival: 10 },
    { concentration: '1+', survival: 2 }
  ]
};

// Parse concentration range (from backend/Code.py)
function parseRange(rangeStr: string): [number, number] {
  try {
    if (rangeStr.includes('+')) {
      const base = parseFloat(rangeStr.replace('+', ''));
      return [base, Infinity];
    }
    const parts = rangeStr.replace('–', '-').split('-');
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  } catch {
    return [-Infinity, Infinity];
  }
}

// Get survival value based on concentration (from backend/Code.py)
function getSurvivalValue(chemName: string, value: number): number {
  const data = mockChemicalData[chemName];
  if (!data) return 0;

  for (const entry of data) {
    const [low, high] = parseRange(entry.concentration);
    if (low <= value && value < high) {
      return entry.survival;
    }
  }
  return 0;
}

// Generate biosignature report (from backend/Code.py)
export function generateBiosignatureReport(input: BiosignatureInput): BiosignatureReport {
  const temp = input.Temperature || 25;
  const report: BiosignatureReport = {};
  let total = 0;
  let count = 0;

  // Process each chemical
  for (const [chem, value] of Object.entries(input)) {
    if (chem !== 'Temperature' && value !== undefined) {
      const score = getSurvivalValue(chem, value);
      report[chem as keyof BiosignatureReport] = score;
      total += score;
      count += 1;
    }
  }

  // Handle temperature as physical parameter (from backend/Code.py)
  let tempScore: number;
  if (temp >= 0 && temp <= 40) {
    tempScore = 100;
  } else {
    tempScore = 50;
  }
  report.Temperature = tempScore;
  total += tempScore;
  count += 1;

  // Calculate final habitability score
  report['Habitability Score'] = Math.round(total / count * 100) / 100;
  
  return report;
}

// Generate realistic biosignature data for a planet based on its characteristics
export function generatePlanetBiosignatures(planet: {
  temperature: number;
  radius: number;
  mass: number;
  starType: string;
  inHabitableZone: boolean;
  habitabilityScore: number;
}): BiosignatureInput {
  const tempCelsius = planet.temperature - 273.15;
  
  // Base atmospheric composition estimates
  let h2 = 0.1 + Math.random() * 10; // ppm
  let o2 = 0; // Start with no oxygen
  let n2 = 60 + Math.random() * 30; // %
  let co2 = 0.04 + Math.random() * 5; // %
  let nh3 = 0.001 + Math.random() * 0.1; // ppm
  let c2h6 = 0.001 + Math.random() * 0.01; // ppm
  let so2 = 0.0001 + Math.random() * 0.001; // ppm
  let h2s = 0.0001 + Math.random() * 0.001; // ppm

  // Adjust based on planet characteristics
  if (planet.inHabitableZone && planet.habitabilityScore > 50) {
    // Potentially habitable planets might have oxygen
    o2 = Math.random() * 25; // Up to 25% oxygen
    
    // Better atmospheric balance
    n2 = 70 + Math.random() * 10;
    co2 = 0.04 + Math.random() * 2;
    
    // Possible biosignature gases
    if (Math.random() > 0.7) {
      nh3 += Math.random() * 0.5; // Possible biological NH3
    }
    if (Math.random() > 0.8) {
      c2h6 += Math.random() * 0.05; // Possible biological hydrocarbons
    }
  }

  // Temperature effects
  if (tempCelsius < 0) {
    // Cold planets - less atmospheric activity
    h2 *= 0.5;
    o2 *= 0.3;
    nh3 *= 0.2;
  } else if (tempCelsius > 100) {
    // Hot planets - more volcanic activity
    so2 *= 5;
    h2s *= 3;
    co2 *= 2;
    o2 *= 0.1; // Oxygen gets stripped away
  }

  // Star type effects
  if (planet.starType.startsWith('M')) {
    // M-dwarf planets - more reducing atmosphere
    h2 *= 2;
    o2 *= 0.5;
    h2s *= 1.5;
  }

  return {
    H2: Math.round(h2 * 100) / 100,
    O2: Math.round(o2 * 100) / 100,
    N2: Math.round(n2 * 100) / 100,
    CO2: Math.round(co2 * 100) / 100,
    NH3: Math.round(nh3 * 1000) / 1000,
    C2H6: Math.round(c2h6 * 1000) / 1000,
    SO2: Math.round(so2 * 10000) / 10000,
    H2S: Math.round(h2s * 10000) / 10000,
    Temperature: Math.round(tempCelsius * 10) / 10
  };
}

// Get interpretation of biosignature results
export function interpretBiosignatureResults(report: BiosignatureReport): {
  overall: string;
  details: string[];
  lifeIndicators: string[];
  concerns: string[];
} {
  const score = report['Habitability Score'];
  const details: string[] = [];
  const lifeIndicators: string[] = [];
  const concerns: string[] = [];

  // Overall assessment
  let overall: string;
  if (score >= 80) {
    overall = "Excellent conditions for life - Multiple favorable biosignatures detected";
  } else if (score >= 60) {
    overall = "Good potential for life - Several positive indicators present";
  } else if (score >= 40) {
    overall = "Marginal habitability - Mixed biosignature signals";
  } else {
    overall = "Challenging conditions for life - Limited favorable indicators";
  }

  // Analyze each component
  if (report.O2 && report.O2 > 15) {
    lifeIndicators.push(`High oxygen levels (${report.O2}%) suggest possible photosynthesis`);
  } else if (report.O2 && report.O2 > 5) {
    lifeIndicators.push(`Moderate oxygen levels (${report.O2}%) indicate potential biological activity`);
  }

  if (report.NH3 && report.NH3 > 0.1) {
    lifeIndicators.push(`Elevated ammonia (${report.NH3} ppm) could indicate biological processes`);
  }

  if (report.C2H6 && report.C2H6 > 0.01) {
    lifeIndicators.push(`Ethane presence (${report.C2H6} ppm) suggests possible organic chemistry`);
  }

  if (report.CO2 && report.CO2 > 10) {
    concerns.push(`Very high CO2 levels (${report.CO2}%) may indicate runaway greenhouse effect`);
  }

  if (report.SO2 && report.SO2 > 0.1) {
    concerns.push(`High sulfur dioxide (${report.SO2} ppm) suggests active volcanism`);
  }

  if (report.H2S && report.H2S > 0.1) {
    concerns.push(`Hydrogen sulfide presence (${report.H2S} ppm) indicates reducing conditions`);
  }

  if (report.Temperature && (report.Temperature < -50 || report.Temperature > 60)) {
    concerns.push(`Extreme temperature (${report.Temperature}°C) challenges life as we know it`);
  }

  // Add general details
  details.push(`Overall biosignature score: ${score}/100`);
  details.push(`Temperature assessment: ${report.Temperature}°C (${report.Temperature! >= 0 && report.Temperature! <= 40 ? 'Optimal' : 'Challenging'})`);
  
  if (report.N2) {
    details.push(`Nitrogen levels: ${report.N2}% (${report.N2 >= 50 && report.N2 <= 90 ? 'Good for atmosphere stability' : 'Suboptimal atmospheric buffer'})`);
  }

  return { overall, details, lifeIndicators, concerns };
}