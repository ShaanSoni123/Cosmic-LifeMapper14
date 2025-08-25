/**
 * Constellation Name Expander
 * Converts abbreviated constellation names to their full, proper names
 * to avoid misinterpretation and improve readability
 */

export interface ConstellationMapping {
  abbreviation: string;
  fullName: string;
  genitive: string;
  englishName: string;
}

// Comprehensive mapping of constellation abbreviations to full names
export const CONSTELLATION_MAPPINGS: ConstellationMapping[] = [
  // Common abbreviated constellations found in exoplanet names
  { abbreviation: 'And', fullName: 'Andromeda', genitive: 'Andromedae', englishName: 'The Chained Princess' },
  { abbreviation: 'Ant', fullName: 'Antlia', genitive: 'Antliae', englishName: 'The Air Pump' },
  { abbreviation: 'Aps', fullName: 'Apus', genitive: 'Apodis', englishName: 'The Bird of Paradise' },
  { abbreviation: 'Aqr', fullName: 'Aquarius', genitive: 'Aquarii', englishName: 'The Water Bearer' },
  { abbreviation: 'Aql', fullName: 'Aquila', genitive: 'Aquilae', englishName: 'The Eagle' },
  { abbreviation: 'Ara', fullName: 'Ara', genitive: 'Arae', englishName: 'The Altar' },
  { abbreviation: 'Ari', fullName: 'Aries', genitive: 'Arietis', englishName: 'The Ram' },
  { abbreviation: 'Aur', fullName: 'Auriga', genitive: 'Aurigae', englishName: 'The Charioteer' },
  { abbreviation: 'Boo', fullName: 'Boötes', genitive: 'Boötis', englishName: 'The Herdsman' },
  { abbreviation: 'Cae', fullName: 'Caelum', genitive: 'Caeli', englishName: 'The Chisel' },
  { abbreviation: 'Cam', fullName: 'Camelopardalis', genitive: 'Camelopardalis', englishName: 'The Giraffe' },
  { abbreviation: 'Cnc', fullName: 'Cancer', genitive: 'Cancri', englishName: 'The Crab' },
  { abbreviation: 'CVn', fullName: 'Canes Venatici', genitive: 'Canum Venaticorum', englishName: 'The Hunting Dogs' },
  { abbreviation: 'CMa', fullName: 'Canis Major', genitive: 'Canis Majoris', englishName: 'The Greater Dog' },
  { abbreviation: 'CMi', fullName: 'Canis Minor', genitive: 'Canis Minoris', englishName: 'The Lesser Dog' },
  { abbreviation: 'Cap', fullName: 'Capricornus', genitive: 'Capricorni', englishName: 'The Sea Goat' },
  { abbreviation: 'Car', fullName: 'Carina', genitive: 'Carinae', englishName: 'The Keel' },
  { abbreviation: 'Cas', fullName: 'Cassiopeia', genitive: 'Cassiopeiae', englishName: 'The Seated Queen' },
  { abbreviation: 'Cen', fullName: 'Centaurus', genitive: 'Centauri', englishName: 'The Centaur' },
  { abbreviation: 'Cep', fullName: 'Cepheus', genitive: 'Cephei', englishName: 'The King' },
  { abbreviation: 'Cet', fullName: 'Cetus', genitive: 'Ceti', englishName: 'The Sea Monster' },
  { abbreviation: 'Cha', fullName: 'Chamaeleon', genitive: 'Chamaeleontis', englishName: 'The Chameleon' },
  { abbreviation: 'Cir', fullName: 'Circinus', genitive: 'Circini', englishName: 'The Compass' },
  { abbreviation: 'Col', fullName: 'Columba', genitive: 'Columbae', englishName: 'The Dove' },
  { abbreviation: 'Com', fullName: 'Coma Berenices', genitive: 'Comae Berenices', englishName: 'Berenice\'s Hair' },
  { abbreviation: 'CrA', fullName: 'Corona Australis', genitive: 'Coronae Australis', englishName: 'The Southern Crown' },
  { abbreviation: 'CrB', fullName: 'Corona Borealis', genitive: 'Coronae Borealis', englishName: 'The Northern Crown' },
  { abbreviation: 'Crv', fullName: 'Corvus', genitive: 'Corvi', englishName: 'The Crow' },
  { abbreviation: 'Crt', fullName: 'Crater', genitive: 'Crateris', englishName: 'The Cup' },
  { abbreviation: 'Cru', fullName: 'Crux', genitive: 'Crucis', englishName: 'The Southern Cross' },
  { abbreviation: 'Cyg', fullName: 'Cygnus', genitive: 'Cygni', englishName: 'The Swan' },
  { abbreviation: 'Del', fullName: 'Delphinus', genitive: 'Delphini', englishName: 'The Dolphin' },
  { abbreviation: 'Dor', fullName: 'Dorado', genitive: 'Doradus', englishName: 'The Swordfish' },
  { abbreviation: 'Dra', fullName: 'Draco', genitive: 'Draconis', englishName: 'The Dragon' },
  { abbreviation: 'Equ', fullName: 'Equuleus', genitive: 'Equulei', englishName: 'The Little Horse' },
  { abbreviation: 'Eri', fullName: 'Eridanus', genitive: 'Eridani', englishName: 'The River' },
  { abbreviation: 'For', fullName: 'Fornax', genitive: 'Fornacis', englishName: 'The Furnace' },
  { abbreviation: 'Gem', fullName: 'Gemini', genitive: 'Geminorum', englishName: 'The Twins' },
  { abbreviation: 'Gru', fullName: 'Grus', genitive: 'Gruis', englishName: 'The Crane' },
  { abbreviation: 'Her', fullName: 'Hercules', genitive: 'Herculis', englishName: 'The Hero' },
  { abbreviation: 'Hor', fullName: 'Horologium', genitive: 'Horologii', englishName: 'The Clock' },
  { abbreviation: 'Hya', fullName: 'Hydra', genitive: 'Hydrae', englishName: 'The Sea Serpent' },
  { abbreviation: 'Hyi', fullName: 'Hydrus', genitive: 'Hydri', englishName: 'The Male Water Snake' },
  { abbreviation: 'Ind', fullName: 'Indus', genitive: 'Indi', englishName: 'The Indian' },
  { abbreviation: 'Lac', fullName: 'Lacerta', genitive: 'Lacertae', englishName: 'The Lizard' },
  { abbreviation: 'Leo', fullName: 'Leo', genitive: 'Leonis', englishName: 'The Lion' },
  { abbreviation: 'LMi', fullName: 'Leo Minor', genitive: 'Leonis Minoris', englishName: 'The Lesser Lion' },
  { abbreviation: 'Lep', fullName: 'Lepus', genitive: 'Leporis', englishName: 'The Hare' },
  { abbreviation: 'Lib', fullName: 'Libra', genitive: 'Librae', englishName: 'The Scales' },
  { abbreviation: 'Lup', fullName: 'Lupus', genitive: 'Lupi', englishName: 'The Wolf' },
  { abbreviation: 'Lyn', fullName: 'Lynx', genitive: 'Lyncis', englishName: 'The Lynx' },
  { abbreviation: 'Lyr', fullName: 'Lyra', genitive: 'Lyrae', englishName: 'The Lyre' },
  { abbreviation: 'Men', fullName: 'Mensa', genitive: 'Mensae', englishName: 'The Table Mountain' },
  { abbreviation: 'Mic', fullName: 'Microscopium', genitive: 'Microscopii', englishName: 'The Microscope' },
  { abbreviation: 'Mon', fullName: 'Monoceros', genitive: 'Monocerotis', englishName: 'The Unicorn' },
  { abbreviation: 'Mus', fullName: 'Musca', genitive: 'Muscae', englishName: 'The Fly' },
  { abbreviation: 'Nor', fullName: 'Norma', genitive: 'Normae', englishName: 'The Carpenter\'s Square' },
  { abbreviation: 'Oct', fullName: 'Octans', genitive: 'Octantis', englishName: 'The Octant' },
  { abbreviation: 'Oph', fullName: 'Ophiuchus', genitive: 'Ophiuchi', englishName: 'The Serpent Bearer' },
  { abbreviation: 'Ori', fullName: 'Orion', genitive: 'Orionis', englishName: 'The Hunter' },
  { abbreviation: 'Pav', fullName: 'Pavo', genitive: 'Pavonis', englishName: 'The Peacock' },
  { abbreviation: 'Peg', fullName: 'Pegasus', genitive: 'Pegasi', englishName: 'The Winged Horse' },
  { abbreviation: 'Per', fullName: 'Perseus', genitive: 'Persei', englishName: 'The Hero' },
  { abbreviation: 'Phe', fullName: 'Phoenix', genitive: 'Phoenicis', englishName: 'The Phoenix' },
  { abbreviation: 'Pic', fullName: 'Pictor', genitive: 'Pictoris', englishName: 'The Painter' },
  { abbreviation: 'Psc', fullName: 'Pisces', genitive: 'Piscium', englishName: 'The Fishes' },
  { abbreviation: 'PsA', fullName: 'Piscis Austrinus', genitive: 'Piscis Austrini', englishName: 'The Southern Fish' },
  { abbreviation: 'Pup', fullName: 'Puppis', genitive: 'Puppis', englishName: 'The Stern' },
  { abbreviation: 'Pyx', fullName: 'Pyxis', genitive: 'Pyxidis', englishName: 'The Compass' },
  { abbreviation: 'Ret', fullName: 'Reticulum', genitive: 'Reticuli', englishName: 'The Reticle' },
  { abbreviation: 'Sge', fullName: 'Sagitta', genitive: 'Sagittae', englishName: 'The Arrow' },
  { abbreviation: 'Sgr', fullName: 'Sagittarius', genitive: 'Sagittarii', englishName: 'The Archer' },
  { abbreviation: 'Sco', fullName: 'Scorpius', genitive: 'Scorpii', englishName: 'The Scorpion' },
  { abbreviation: 'Scl', fullName: 'Sculptor', genitive: 'Sculptoris', englishName: 'The Sculptor' },
  { abbreviation: 'Sct', fullName: 'Scutum', genitive: 'Scuti', englishName: 'The Shield' },
  { abbreviation: 'Ser', fullName: 'Serpens', genitive: 'Serpentis', englishName: 'The Serpent' },
  { abbreviation: 'Sex', fullName: 'Sextans', genitive: 'Sextantis', englishName: 'The Sextant' },
  { abbreviation: 'Tau', fullName: 'Taurus', genitive: 'Tauri', englishName: 'The Bull' },
  { abbreviation: 'Tel', fullName: 'Telescopium', genitive: 'Telescopii', englishName: 'The Telescope' },
  { abbreviation: 'Tri', fullName: 'Triangulum', genitive: 'Trianguli', englishName: 'The Triangle' },
  { abbreviation: 'TrA', fullName: 'Triangulum Australe', genitive: 'Trianguli Australis', englishName: 'The Southern Triangle' },
  { abbreviation: 'Tuc', fullName: 'Tucana', genitive: 'Tucanae', englishName: 'The Toucan' },
  { abbreviation: 'UMa', fullName: 'Ursa Major', genitive: 'Ursae Majoris', englishName: 'The Great Bear' },
  { abbreviation: 'UMi', fullName: 'Ursa Minor', genitive: 'Ursae Minoris', englishName: 'The Little Bear' },
  { abbreviation: 'Vel', fullName: 'Vela', genitive: 'Velorum', englishName: 'The Sails' },
  { abbreviation: 'Vir', fullName: 'Virgo', genitive: 'Virginis', englishName: 'The Maiden' },
  { abbreviation: 'Vol', fullName: 'Volans', genitive: 'Volantis', englishName: 'The Flying Fish' },
  { abbreviation: 'Vul', fullName: 'Vulpecula', genitive: 'Vulpeculae', englishName: 'The Little Fox' }
];

/**
 * Expands abbreviated constellation names to their full names
 * @param planetName - The planet name (e.g., "11 Com b", "24 Sex b")
 * @returns The expanded planet name with full constellation names
 */
export function expandConstellationName(planetName: string): string {
  if (!planetName) return planetName;
  
  // Split the planet name into parts
  const parts = planetName.split(' ');
  
  // Look for constellation abbreviations in the name
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Find matching constellation abbreviation
    const constellation = CONSTELLATION_MAPPINGS.find(
      c => c.abbreviation.toLowerCase() === part.toLowerCase()
    );
    
    if (constellation) {
      // Replace the abbreviation with the full name
      parts[i] = constellation.fullName;
    }
  }
  
  return parts.join(' ');
}

/**
 * Gets constellation information for a planet name
 * @param planetName - The planet name
 * @returns Constellation information or null if not found
 */
export function getConstellationInfo(planetName: string): ConstellationMapping | null {
  if (!planetName) return null;
  
  const parts = planetName.split(' ');
  
  for (const part of parts) {
    const constellation = CONSTELLATION_MAPPINGS.find(
      c => c.abbreviation.toLowerCase() === part.toLowerCase()
    );
    
    if (constellation) {
      return constellation;
    }
  }
  
  return null;
}

/**
 * Formats planet name with expanded constellation and additional info
 * @param planetName - The original planet name
 * @returns Formatted planet name with constellation info
 */
export function formatPlanetNameWithConstellation(planetName: string): {
  displayName: string;
  constellationInfo: string | null;
  fullName: string;
} {
  const expandedName = expandConstellationName(planetName);
  const constellationInfo = getConstellationInfo(planetName);
  
  return {
    displayName: expandedName,
    constellationInfo: constellationInfo ? `${constellationInfo.fullName} (${constellationInfo.englishName})` : null,
    fullName: expandedName
  };
}

/**
 * Example usage and testing
 */
export const EXAMPLE_EXPANSIONS = [
  '11 Com b',
  '24 Sex b', 
  '11 UMi b',
  '14 And b',
  '14 Her b',
  '17 Sco b',
  '16 Cyg B b',
  '18 Del'
].map(name => ({
  original: name,
  expanded: expandConstellationName(name),
  constellation: getConstellationInfo(name)
}));
