/**
 * CITY MAP DATA - "SafeCity" Metropolitan Area - EXPANDED 10x10 GRID
 * 
 * This is a fictional city designed to demonstrate:
 * - Graph-based city modeling with complex routing
 * - Zone-based risk assessment
 * - Strategic patrol placement
 * - Advanced Dijkstra pathfinding with multiple route options
 * 
 * City Layout:
 * - 100 nodes (intersections/zones) in 10x10 grid
 * - 351 edges with horizontal, vertical, diagonal, and express routes
 * - Mix of residential, commercial, industrial, medical, education zones
 * - Pre-designated high-risk areas for realistic scenarios
 */

const CityMapData = {
    // Map dimensions - EXPANDED
    mapWidth: 1400,
    mapHeight: 1100,
    
    // City nodes (intersections/zones) - 100 NODES IN 10x10 GRID
    // Format: { id, name, type, x, y }
    nodes: [
      // Row 1 - North (N1-N10)
      { id: 'N1', name: 'Northwood Park', type: 'park', x: 70, y: 55 },
      { id: 'N2', name: 'Highland Residential', type: 'residential', x: 210, y: 55 },
      { id: 'N3', name: 'Maple Heights', type: 'residential', x: 350, y: 55 },
      { id: 'N4', name: 'North Point Mall', type: 'commercial', x: 490, y: 55 },
      { id: 'N5', name: 'Summit Ridge', type: 'residential', x: 630, y: 55 },
      { id: 'N6', name: 'Evergreen District', type: 'residential', x: 770, y: 55 },
      { id: 'N7', name: 'Northgate Plaza', type: 'commercial', x: 910, y: 55 },
      { id: 'N8', name: 'Hillside Estates', type: 'residential', x: 1050, y: 55 },
      { id: 'N9', name: 'Pinecrest Village', type: 'residential', x: 1190, y: 55 },
      { id: 'N10', name: 'North Tech Park', type: 'industrial', x: 1330, y: 55 },

      // Row 2 - Upper North (UN1-UN10)
      { id: 'UN1', name: 'Riverside Gardens', type: 'recreation', x: 70, y: 165 },
      { id: 'UN2', name: 'Oakwood Residential', type: 'residential', x: 210, y: 165 },
      { id: 'UN3', name: 'University District', type: 'education', x: 350, y: 165 },
      { id: 'UN4', name: 'Student Quarter', type: 'residential', x: 490, y: 165 },
      { id: 'UN5', name: 'North Memorial Hospital', type: 'medical', x: 630, y: 165 },
      { id: 'UN6', name: 'Medical Plaza', type: 'medical', x: 770, y: 165 },
      { id: 'UN7', name: 'Parkview Homes', type: 'residential', x: 910, y: 165 },
      { id: 'UN8', name: 'Cedar Heights', type: 'residential', x: 1050, y: 165 },
      { id: 'UN9', name: 'Lakeside Commercial', type: 'commercial', x: 1190, y: 165 },
      { id: 'UN10', name: 'Northeast Industrial', type: 'industrial', x: 1330, y: 165 },

      // Row 3 - Central North (CN1-CN10)
      { id: 'CN1', name: 'West Park', type: 'park', x: 70, y: 275 },
      { id: 'CN2', name: 'Elmwood District', type: 'residential', x: 210, y: 275 },
      { id: 'CN3', name: 'City College', type: 'education', x: 350, y: 275 },
      { id: 'CN4', name: 'North Station', type: 'transport', x: 490, y: 275 },
      { id: 'CN5', name: 'Uptown Shopping', type: 'commercial', x: 630, y: 275 },
      { id: 'CN6', name: 'Business District North', type: 'commercial', x: 770, y: 275 },
      { id: 'CN7', name: 'Heritage Square', type: 'commercial', x: 910, y: 275 },
      { id: 'CN8', name: 'East Gate Mall', type: 'commercial', x: 1050, y: 275 },
      { id: 'CN9', name: 'Warehouse District', type: 'industrial', x: 1190, y: 275 },
      { id: 'CN10', name: 'Port Authority', type: 'transport', x: 1330, y: 275 },

      // Row 4 - Upper Central North (UCN1-UCN10)
      { id: 'UCN1', name: 'Westside Gardens', type: 'residential', x: 70, y: 385 },
      { id: 'UCN2', name: 'North Police HQ', type: 'police', x: 210, y: 385 },
      { id: 'UCN3', name: 'Arts District', type: 'recreation', x: 350, y: 385 },
      { id: 'UCN4', name: 'Theater Quarter', type: 'recreation', x: 490, y: 385 },
      { id: 'UCN5', name: 'Financial Plaza', type: 'commercial', x: 630, y: 385 },
      { id: 'UCN6', name: 'Corporate Center', type: 'commercial', x: 770, y: 385 },
      { id: 'UCN7', name: 'Tech Campus', type: 'commercial', x: 910, y: 385 },
      { id: 'UCN8', name: 'Innovation Hub', type: 'education', x: 1050, y: 385 },
      { id: 'UCN9', name: 'Manufacturing Zone', type: 'industrial', x: 1190, y: 385 },
      { id: 'UCN10', name: 'East Industrial Park', type: 'industrial', x: 1330, y: 385 },

      // Row 5 - Mid North (MN1-MN10)
      { id: 'MN1', name: 'Liberty Park', type: 'park', x: 70, y: 495 },
      { id: 'MN2', name: 'Midtown West', type: 'residential', x: 210, y: 495 },
      { id: 'MN3', name: 'Central Library', type: 'government', x: 350, y: 495 },
      { id: 'MN4', name: 'City Museum', type: 'recreation', x: 490, y: 495 },
      { id: 'MN5', name: 'Grand Central Plaza', type: 'commercial', x: 630, y: 495 },
      { id: 'MN6', name: 'Metropolitan Mall', type: 'commercial', x: 770, y: 495 },
      { id: 'MN7', name: 'Convention Center', type: 'commercial', x: 910, y: 495 },
      { id: 'MN8', name: 'Midtown East', type: 'residential', x: 1050, y: 495 },
      { id: 'MN9', name: 'Logistics Center', type: 'transport', x: 1190, y: 495 },
      { id: 'MN10', name: 'Distribution Hub', type: 'industrial', x: 1330, y: 495 },

      // Row 6 - Center (C1-C10)
      { id: 'C1', name: 'Victory Stadium', type: 'recreation', x: 70, y: 605 },
      { id: 'C2', name: 'Downtown West', type: 'commercial', x: 210, y: 605 },
      { id: 'C3', name: 'City Hall', type: 'government', x: 350, y: 605 },
      { id: 'C4', name: 'Central Station', type: 'transport', x: 490, y: 605 },
      { id: 'C5', name: 'Downtown Core', type: 'commercial', x: 630, y: 605 },
      { id: 'C6', name: 'Central Hospital', type: 'medical', x: 770, y: 605 },
      { id: 'C7', name: 'Central Police Station', type: 'police', x: 910, y: 605 },
      { id: 'C8', name: 'Downtown East', type: 'commercial', x: 1050, y: 605 },
      { id: 'C9', name: 'Exchange District', type: 'commercial', x: 1190, y: 605 },
      { id: 'C10', name: 'Trade Center', type: 'commercial', x: 1330, y: 605 },

      // Row 7 - Mid South (MS1-MS10)
      { id: 'MS1', name: 'Sports Complex', type: 'recreation', x: 70, y: 715 },
      { id: 'MS2', name: 'Southgate Residential', type: 'residential', x: 210, y: 715 },
      { id: 'MS3', name: 'County Courthouse', type: 'government', x: 350, y: 715 },
      { id: 'MS4', name: 'Civic Center', type: 'government', x: 490, y: 715 },
      { id: 'MS5', name: 'Market Square', type: 'commercial', x: 630, y: 715 },
      { id: 'MS6', name: 'Shopping District', type: 'commercial', x: 770, y: 715 },
      { id: 'MS7', name: 'Southside Mall', type: 'commercial', x: 910, y: 715 },
      { id: 'MS8', name: 'Eastwood Homes', type: 'residential', x: 1050, y: 715 },
      { id: 'MS9', name: 'East Clinic', type: 'medical', x: 1190, y: 715 },
      { id: 'MS10', name: 'Harbor District', type: 'transport', x: 1330, y: 715 },

      // Row 8 - Lower Central South (LCS1-LCS10)
      { id: 'LCS1', name: 'Southwest Park', type: 'park', x: 70, y: 825 },
      { id: 'LCS2', name: 'Willow Creek', type: 'residential', x: 210, y: 825 },
      { id: 'LCS3', name: 'South Police Precinct', type: 'police', x: 350, y: 825 },
      { id: 'LCS4', name: 'Transit Hub South', type: 'transport', x: 490, y: 825 },
      { id: 'LCS5', name: 'Southview Commercial', type: 'commercial', x: 630, y: 825 },
      { id: 'LCS6', name: 'Community Hospital', type: 'medical', x: 770, y: 825 },
      { id: 'LCS7', name: 'South High School', type: 'education', x: 910, y: 825 },
      { id: 'LCS8', name: 'Fairview District', type: 'residential', x: 1050, y: 825 },
      { id: 'LCS9', name: 'Southeast Plaza', type: 'commercial', x: 1190, y: 825 },
      { id: 'LCS10', name: 'Marine Terminal', type: 'transport', x: 1330, y: 825 },

      // Row 9 - Central South (CS1-CS10)
      { id: 'CS1', name: 'Sunset Beach', type: 'recreation', x: 70, y: 935 },
      { id: 'CS2', name: 'Bayview Estates', type: 'residential', x: 210, y: 935 },
      { id: 'CS3', name: 'Riverside Residential', type: 'residential', x: 350, y: 935 },
      { id: 'CS4', name: 'South Station', type: 'transport', x: 490, y: 935 },
      { id: 'CS5', name: 'Southland Mall', type: 'commercial', x: 630, y: 935 },
      { id: 'CS6', name: 'Garden District', type: 'residential', x: 770, y: 935 },
      { id: 'CS7', name: 'South College', type: 'education', x: 910, y: 935 },
      { id: 'CS8', name: 'Meadowbrook', type: 'residential', x: 1050, y: 935 },
      { id: 'CS9', name: 'South Medical Center', type: 'medical', x: 1190, y: 935 },
      { id: 'CS10', name: 'Airport Approach', type: 'transport', x: 1330, y: 935 },

      // Row 10 - South (S1-S10)
      { id: 'S1', name: 'Coastal Park', type: 'park', x: 70, y: 1045 },
      { id: 'S2', name: 'South Beach', type: 'recreation', x: 210, y: 1045 },
      { id: 'S3', name: 'Southwood Village', type: 'residential', x: 350, y: 1045 },
      { id: 'S4', name: 'Airport District', type: 'transport', x: 490, y: 1045 },
      { id: 'S5', name: 'International Airport', type: 'transport', x: 630, y: 1045 },
      { id: 'S6', name: 'Aviation Plaza', type: 'commercial', x: 770, y: 1045 },
      { id: 'S7', name: 'South Industrial', type: 'industrial', x: 910, y: 1045 },
      { id: 'S8', name: 'Southern Heights', type: 'residential', x: 1050, y: 1045 },
      { id: 'S9', name: 'Southport', type: 'transport', x: 1190, y: 1045 },
      { id: 'S10', name: 'South Industrial Zone', type: 'industrial', x: 1330, y: 1045 }
    ],
    
    // City edges (roads/connections) - 351 COMPREHENSIVE EDGES
    // Format: { from, to, baseTime } - time in seconds (realistic city travel)
    edges: [
      // ========== HORIZONTAL CONNECTIONS ==========
      // Row 1 (N)
      { from: 'N1', to: 'N2', baseTime: 1 },
      { from: 'N2', to: 'N3', baseTime: 1 },
      { from: 'N3', to: 'N4', baseTime: 1 },
      { from: 'N4', to: 'N5', baseTime: 1 },
      { from: 'N5', to: 'N6', baseTime: 1 },
      { from: 'N6', to: 'N7', baseTime: 1 },
      { from: 'N7', to: 'N8', baseTime: 1 },
      { from: 'N8', to: 'N9', baseTime: 1 },
      { from: 'N9', to: 'N10', baseTime: 1 },

      // Row 2 (UN)
      { from: 'UN1', to: 'UN2', baseTime: 1 },
      { from: 'UN2', to: 'UN3', baseTime: 1 },
      { from: 'UN3', to: 'UN4', baseTime: 1 },
      { from: 'UN4', to: 'UN5', baseTime: 1 },
      { from: 'UN5', to: 'UN6', baseTime: 1 },
      { from: 'UN6', to: 'UN7', baseTime: 1 },
      { from: 'UN7', to: 'UN8', baseTime: 1 },
      { from: 'UN8', to: 'UN9', baseTime: 1 },
      { from: 'UN9', to: 'UN10', baseTime: 1 },

      // Row 3 (CN)
      { from: 'CN1', to: 'CN2', baseTime: 1 },
      { from: 'CN2', to: 'CN3', baseTime: 1 },
      { from: 'CN3', to: 'CN4', baseTime: 1 },
      { from: 'CN4', to: 'CN5', baseTime: 1 },
      { from: 'CN5', to: 'CN6', baseTime: 1 },
      { from: 'CN6', to: 'CN7', baseTime: 1 },
      { from: 'CN7', to: 'CN8', baseTime: 1 },
      { from: 'CN8', to: 'CN9', baseTime: 1 },
      { from: 'CN9', to: 'CN10', baseTime: 1 },

      // Row 4 (UCN)
      { from: 'UCN1', to: 'UCN2', baseTime: 1 },
      { from: 'UCN2', to: 'UCN3', baseTime: 1 },
      { from: 'UCN3', to: 'UCN4', baseTime: 1 },
      { from: 'UCN4', to: 'UCN5', baseTime: 1 },
      { from: 'UCN5', to: 'UCN6', baseTime: 1 },
      { from: 'UCN6', to: 'UCN7', baseTime: 1 },
      { from: 'UCN7', to: 'UCN8', baseTime: 1 },
      { from: 'UCN8', to: 'UCN9', baseTime: 1 },
      { from: 'UCN9', to: 'UCN10', baseTime: 1 },

      // Row 5 (MN)
      { from: 'MN1', to: 'MN2', baseTime: 1 },
      { from: 'MN2', to: 'MN3', baseTime: 1 },
      { from: 'MN3', to: 'MN4', baseTime: 1 },
      { from: 'MN4', to: 'MN5', baseTime: 1 },
      { from: 'MN5', to: 'MN6', baseTime: 1 },
      { from: 'MN6', to: 'MN7', baseTime: 1 },
      { from: 'MN7', to: 'MN8', baseTime: 1 },
      { from: 'MN8', to: 'MN9', baseTime: 1 },
      { from: 'MN9', to: 'MN10', baseTime: 1 },

      // Row 6 (C) - Downtown core
      { from: 'C1', to: 'C2', baseTime: 1 },
      { from: 'C2', to: 'C3', baseTime: 1 },
      { from: 'C3', to: 'C4', baseTime: 1 },
      { from: 'C4', to: 'C5', baseTime: 1 },
      { from: 'C5', to: 'C6', baseTime: 1 },
      { from: 'C6', to: 'C7', baseTime: 1 },
      { from: 'C7', to: 'C8', baseTime: 1 },
      { from: 'C8', to: 'C9', baseTime: 1 },
      { from: 'C9', to: 'C10', baseTime: 1 },

      // Row 7 (MS)
      { from: 'MS1', to: 'MS2', baseTime: 1 },
      { from: 'MS2', to: 'MS3', baseTime: 1 },
      { from: 'MS3', to: 'MS4', baseTime: 1 },
      { from: 'MS4', to: 'MS5', baseTime: 1 },
      { from: 'MS5', to: 'MS6', baseTime: 1 },
      { from: 'MS6', to: 'MS7', baseTime: 1 },
      { from: 'MS7', to: 'MS8', baseTime: 1 },
      { from: 'MS8', to: 'MS9', baseTime: 1 },
      { from: 'MS9', to: 'MS10', baseTime: 1 },

      // Row 8 (LCS)
      { from: 'LCS1', to: 'LCS2', baseTime: 1 },
      { from: 'LCS2', to: 'LCS3', baseTime: 1 },
      { from: 'LCS3', to: 'LCS4', baseTime: 1 },
      { from: 'LCS4', to: 'LCS5', baseTime: 1 },
      { from: 'LCS5', to: 'LCS6', baseTime: 1 },
      { from: 'LCS6', to: 'LCS7', baseTime: 1 },
      { from: 'LCS7', to: 'LCS8', baseTime: 1 },
      { from: 'LCS8', to: 'LCS9', baseTime: 1 },
      { from: 'LCS9', to: 'LCS10', baseTime: 1 },

      // Row 9 (CS)
      { from: 'CS1', to: 'CS2', baseTime: 1 },
      { from: 'CS2', to: 'CS3', baseTime: 1 },
      { from: 'CS3', to: 'CS4', baseTime: 1 },
      { from: 'CS4', to: 'CS5', baseTime: 1 },
      { from: 'CS5', to: 'CS6', baseTime: 1 },
      { from: 'CS6', to: 'CS7', baseTime: 1 },
      { from: 'CS7', to: 'CS8', baseTime: 1 },
      { from: 'CS8', to: 'CS9', baseTime: 1 },
      { from: 'CS9', to: 'CS10', baseTime: 1 },

      // Row 10 (S)
      { from: 'S1', to: 'S2', baseTime: 1 },
      { from: 'S2', to: 'S3', baseTime: 1 },
      { from: 'S3', to: 'S4', baseTime: 1 },
      { from: 'S4', to: 'S5', baseTime: 1 },
      { from: 'S5', to: 'S6', baseTime: 1 },
      { from: 'S6', to: 'S7', baseTime: 1 },
      { from: 'S7', to: 'S8', baseTime: 1 },
      { from: 'S8', to: 'S9', baseTime: 1 },
      { from: 'S9', to: 'S10', baseTime: 1 },

      // ========== VERTICAL CONNECTIONS ==========
      // Column 1
      { from: 'N1', to: 'UN1', baseTime: 1 },
      { from: 'UN1', to: 'CN1', baseTime: 1 },
      { from: 'CN1', to: 'UCN1', baseTime: 1 },
      { from: 'UCN1', to: 'MN1', baseTime: 1 },
      { from: 'MN1', to: 'C1', baseTime: 1 },
      { from: 'C1', to: 'MS1', baseTime: 1 },
      { from: 'MS1', to: 'LCS1', baseTime: 1 },
      { from: 'LCS1', to: 'CS1', baseTime: 1 },
      { from: 'CS1', to: 'S1', baseTime: 1 },

      // Column 2
      { from: 'N2', to: 'UN2', baseTime: 1 },
      { from: 'UN2', to: 'CN2', baseTime: 1 },
      { from: 'CN2', to: 'UCN2', baseTime: 1 },
      { from: 'UCN2', to: 'MN2', baseTime: 1 },
      { from: 'MN2', to: 'C2', baseTime: 1 },
      { from: 'C2', to: 'MS2', baseTime: 1 },
      { from: 'MS2', to: 'LCS2', baseTime: 1 },
      { from: 'LCS2', to: 'CS2', baseTime: 1 },
      { from: 'CS2', to: 'S2', baseTime: 1 },

      // Column 3
      { from: 'N3', to: 'UN3', baseTime: 1 },
      { from: 'UN3', to: 'CN3', baseTime: 1 },
      { from: 'CN3', to: 'UCN3', baseTime: 1 },
      { from: 'UCN3', to: 'MN3', baseTime: 1 },
      { from: 'MN3', to: 'C3', baseTime: 1 },
      { from: 'C3', to: 'MS3', baseTime: 1 },
      { from: 'MS3', to: 'LCS3', baseTime: 1 },
      { from: 'LCS3', to: 'CS3', baseTime: 1 },
      { from: 'CS3', to: 'S3', baseTime: 1 },

      // Column 4
      { from: 'N4', to: 'UN4', baseTime: 1 },
      { from: 'UN4', to: 'CN4', baseTime: 1 },
      { from: 'CN4', to: 'UCN4', baseTime: 1 },
      { from: 'UCN4', to: 'MN4', baseTime: 1 },
      { from: 'MN4', to: 'C4', baseTime: 1 },
      { from: 'C4', to: 'MS4', baseTime: 1 },
      { from: 'MS4', to: 'LCS4', baseTime: 1 },
      { from: 'LCS4', to: 'CS4', baseTime: 1 },
      { from: 'CS4', to: 'S4', baseTime: 1 },

      // Column 5
      { from: 'N5', to: 'UN5', baseTime: 1 },
      { from: 'UN5', to: 'CN5', baseTime: 1 },
      { from: 'CN5', to: 'UCN5', baseTime: 1 },
      { from: 'UCN5', to: 'MN5', baseTime: 1 },
      { from: 'MN5', to: 'C5', baseTime: 1 },
      { from: 'C5', to: 'MS5', baseTime: 1 },
      { from: 'MS5', to: 'LCS5', baseTime: 1 },
      { from: 'LCS5', to: 'CS5', baseTime: 1 },
      { from: 'CS5', to: 'S5', baseTime: 1 },

      // Column 6
      { from: 'N6', to: 'UN6', baseTime: 1 },
      { from: 'UN6', to: 'CN6', baseTime: 1 },
      { from: 'CN6', to: 'UCN6', baseTime: 1 },
      { from: 'UCN6', to: 'MN6', baseTime: 1 },
      { from: 'MN6', to: 'C6', baseTime: 1 },
      { from: 'C6', to: 'MS6', baseTime: 1 },
      { from: 'MS6', to: 'LCS6', baseTime: 1 },
      { from: 'LCS6', to: 'CS6', baseTime: 1 },
      { from: 'CS6', to: 'S6', baseTime: 1 },

      // Column 7
      { from: 'N7', to: 'UN7', baseTime: 1 },
      { from: 'UN7', to: 'CN7', baseTime: 1 },
      { from: 'CN7', to: 'UCN7', baseTime: 1 },
      { from: 'UCN7', to: 'MN7', baseTime: 1 },
      { from: 'MN7', to: 'C7', baseTime: 1 },
      { from: 'C7', to: 'MS7', baseTime: 1 },
      { from: 'MS7', to: 'LCS7', baseTime: 1 },
      { from: 'LCS7', to: 'CS7', baseTime: 1 },
      { from: 'CS7', to: 'S7', baseTime: 1 },

      // Column 8
      { from: 'N8', to: 'UN8', baseTime: 1 },
      { from: 'UN8', to: 'CN8', baseTime: 1 },
      { from: 'CN8', to: 'UCN8', baseTime: 1 },
      { from: 'UCN8', to: 'MN8', baseTime: 1 },
      { from: 'MN8', to: 'C8', baseTime: 1 },
      { from: 'C8', to: 'MS8', baseTime: 1 },
      { from: 'MS8', to: 'LCS8', baseTime: 1 },
      { from: 'LCS8', to: 'CS8', baseTime: 1 },
      { from: 'CS8', to: 'S8', baseTime: 1 },

      // Column 9
      { from: 'N9', to: 'UN9', baseTime: 1 },
      { from: 'UN9', to: 'CN9', baseTime: 1 },
      { from: 'CN9', to: 'UCN9', baseTime: 1 },
      { from: 'UCN9', to: 'MN9', baseTime: 1 },
      { from: 'MN9', to: 'C9', baseTime: 1 },
      { from: 'C9', to: 'MS9', baseTime: 1 },
      { from: 'MS9', to: 'LCS9', baseTime: 1 },
      { from: 'LCS9', to: 'CS9', baseTime: 1 },
      { from: 'CS9', to: 'S9', baseTime: 1 },

      // Column 10
      { from: 'N10', to: 'UN10', baseTime: 1 },
      { from: 'UN10', to: 'CN10', baseTime: 1 },
      { from: 'CN10', to: 'UCN10', baseTime: 1 },
      { from: 'UCN10', to: 'MN10', baseTime: 1 },
      { from: 'MN10', to: 'C10', baseTime: 1 },
      { from: 'C10', to: 'MS10', baseTime: 1 },
      { from: 'MS10', to: 'LCS10', baseTime: 1 },
      { from: 'LCS10', to: 'CS10', baseTime: 1 },
      { from: 'CS10', to: 'S10', baseTime: 1 },

      // ========== DIAGONAL SHORTCUTS ==========
      // NW to SE diagonals
      { from: 'N1', to: 'UN2', baseTime: 1 },
      { from: 'UN2', to: 'CN3', baseTime: 1 },
      { from: 'CN3', to: 'UCN4', baseTime: 1 },
      { from: 'UCN4', to: 'MN5', baseTime: 1 },
      { from: 'MN5', to: 'C6', baseTime: 1 },
      { from: 'C6', to: 'MS7', baseTime: 1 },
      { from: 'MS7', to: 'LCS8', baseTime: 1 },
      { from: 'LCS8', to: 'CS9', baseTime: 1 },
      { from: 'CS9', to: 'S10', baseTime: 1 },

      // NE to SW diagonals
      { from: 'N10', to: 'UN9', baseTime: 1 },
      { from: 'UN9', to: 'CN8', baseTime: 1 },
      { from: 'CN8', to: 'UCN7', baseTime: 1 },
      { from: 'UCN7', to: 'MN6', baseTime: 1 },
      { from: 'MN6', to: 'C5', baseTime: 1 },
      { from: 'C5', to: 'MS4', baseTime: 1 },
      { from: 'MS4', to: 'LCS3', baseTime: 1 },
      { from: 'LCS3', to: 'CS2', baseTime: 1 },
      { from: 'CS2', to: 'S1', baseTime: 1 },

      // Additional diagonals
      { from: 'N4', to: 'UN5', baseTime: 1 },
      { from: 'UN5', to: 'CN6', baseTime: 1 },
      { from: 'CN6', to: 'UCN7', baseTime: 1 },
      { from: 'N7', to: 'UN6', baseTime: 1 },
      { from: 'UN6', to: 'CN5', baseTime: 1 },
      { from: 'CN4', to: 'UCN5', baseTime: 1 },
      { from: 'UCN5', to: 'MN6', baseTime: 1 },
      { from: 'MN4', to: 'C5', baseTime: 1 },
      { from: 'C4', to: 'MS5', baseTime: 1 },
      { from: 'MS5', to: 'LCS6', baseTime: 1 },
      { from: 'LCS6', to: 'CS7', baseTime: 1 },
      { from: 'CS5', to: 'S6', baseTime: 1 },

      // ========== EXPRESS ROUTES ==========
      // North to South corridors
      { from: 'N4', to: 'CN4', baseTime: 1 },
      { from: 'CN4', to: 'C4', baseTime: 1 },
      { from: 'C4', to: 'CS4', baseTime: 1 },
      { from: 'CS4', to: 'S4', baseTime: 1 },
      { from: 'N5', to: 'MN5', baseTime: 1 },
      { from: 'MN5', to: 'CS5', baseTime: 1 },
      { from: 'UN6', to: 'C6', baseTime: 1 },
      { from: 'C6', to: 'LCS6', baseTime: 1 },
      { from: 'LCS6', to: 'S6', baseTime: 1 },

      // East to West corridors  
      { from: 'N1', to: 'N4', baseTime: 1 },
      { from: 'N4', to: 'N7', baseTime: 1 },
      { from: 'N7', to: 'N10', baseTime: 1 },
      { from: 'CN1', to: 'CN5', baseTime: 1 },
      { from: 'CN5', to: 'CN10', baseTime: 1 },
      { from: 'C1', to: 'C4', baseTime: 1 },
      { from: 'C4', to: 'C7', baseTime: 1 },
      { from: 'C7', to: 'C10', baseTime: 1 },
      { from: 'S1', to: 'S5', baseTime: 1 },
      { from: 'S5', to: 'S10', baseTime: 1 },

      // Diagonal express
      { from: 'N1', to: 'C5', baseTime: 1 },
      { from: 'C5', to: 'S10', baseTime: 1 },
      { from: 'N10', to: 'C6', baseTime: 1 },
      { from: 'C6', to: 'S1', baseTime: 1 },
      { from: 'N1', to: 'MN5', baseTime: 1 },
      { from: 'MN5', to: 'S9', baseTime: 1 },
      { from: 'N10', to: 'MN6', baseTime: 1 },
      { from: 'MN6', to: 'S2', baseTime: 1 },

      // Hospital network
      { from: 'UN5', to: 'C6', baseTime: 1 },
      { from: 'C6', to: 'LCS6', baseTime: 1 },
      { from: 'LCS6', to: 'CS9', baseTime: 1 },
      { from: 'UN5', to: 'UN6', baseTime: 1 },
      { from: 'UN6', to: 'LCS6', baseTime: 1 },
      { from: 'MS9', to: 'CS9', baseTime: 1 },

      // Police network
      { from: 'UCN2', to: 'C7', baseTime: 1 },
      { from: 'C7', to: 'LCS3', baseTime: 1 },
      { from: 'UCN2', to: 'LCS3', baseTime: 1 },

      // Transportation hubs
      { from: 'CN4', to: 'C4', baseTime: 1 },
      { from: 'C4', to: 'LCS4', baseTime: 1 },
      { from: 'LCS4', to: 'CS4', baseTime: 1 },
      { from: 'CS4', to: 'S5', baseTime: 1 },
      { from: 'CN10', to: 'MS10', baseTime: 1 },
      { from: 'MS10', to: 'LCS10', baseTime: 1 },
      { from: 'LCS10', to: 'CS10', baseTime: 1 },
      { from: 'CN4', to: 'CN10', baseTime: 1 },
      { from: 'MN9', to: 'MS10', baseTime: 1 },

      // Education connections
      { from: 'UN3', to: 'CN3', baseTime: 1 },
      { from: 'CN3', to: 'UCN8', baseTime: 1 },
      { from: 'UCN8', to: 'LCS7', baseTime: 1 },
      { from: 'LCS7', to: 'CS7', baseTime: 1 },

      // Commercial corridors
      { from: 'N4', to: 'CN5', baseTime: 1 },
      { from: 'CN5', to: 'MN5', baseTime: 1 },
      { from: 'MN6', to: 'MS6', baseTime: 1 },
      { from: 'CN7', to: 'C8', baseTime: 1 },
      { from: 'UCN5', to: 'C5', baseTime: 1 },
      { from: 'C5', to: 'MS5', baseTime: 1 },
      { from: 'MN7', to: 'MS7', baseTime: 1 },
      { from: 'UN9', to: 'MN9', baseTime: 1 },

      // Industrial zones
      { from: 'N10', to: 'UCN10', baseTime: 1 },
      { from: 'UCN9', to: 'MN10', baseTime: 1 },
      { from: 'MN10', to: 'C10', baseTime: 1 },
      { from: 'CN9', to: 'UCN10', baseTime: 1 },
      { from: 'CN9', to: 'MN9', baseTime: 1 },
      { from: 'S7', to: 'S10', baseTime: 1 },

      // Residential shortcuts
      { from: 'N2', to: 'CN5', baseTime: 1 },
      { from: 'N8', to: 'CN7', baseTime: 1 },
      { from: 'CS2', to: 'CS5', baseTime: 1 },
      { from: 'CS6', to: 'CS8', baseTime: 1 },
      { from: 'S3', to: 'S6', baseTime: 1 },
      { from: 'S8', to: 'S10', baseTime: 1 },

      // Parks network
      { from: 'N1', to: 'CN1', baseTime: 1 },
      { from: 'CN1', to: 'MN1', baseTime: 1 },
      { from: 'MN1', to: 'MS1', baseTime: 1 },
      { from: 'MS1', to: 'CS1', baseTime: 1 },
      { from: 'UN1', to: 'UCN3', baseTime: 1 },
      { from: 'UCN3', to: 'MN4', baseTime: 1 },
      { from: 'C1', to: 'LCS1', baseTime: 1 },
      { from: 'LCS1', to: 'S1', baseTime: 1 },

      // Government facilities
      { from: 'CN3', to: 'C3', baseTime: 1 },
      { from: 'C3', to: 'MS3', baseTime: 1 },
      { from: 'MS3', to: 'MS4', baseTime: 1 },
      { from: 'MN3', to: 'MS4', baseTime: 1 },

      // Additional strategic routes
      { from: 'N2', to: 'CN4', baseTime: 1 },
      { from: 'N6', to: 'UCN8', baseTime: 1 },
      { from: 'UN4', to: 'MN6', baseTime: 1 },
      { from: 'CN2', to: 'C4', baseTime: 1 },
      { from: 'UCN6', to: 'MS8', baseTime: 1 },
      { from: 'MN2', to: 'LCS4', baseTime: 1 },
      { from: 'C2', to: 'CS5', baseTime: 1 },
      { from: 'MS2', to: 'S4', baseTime: 1 },
      { from: 'UN7', to: 'MN9', baseTime: 1 },
      { from: 'CN8', to: 'C10', baseTime: 1 },
      { from: 'UCN4', to: 'MS6', baseTime: 1 },
      { from: 'MN8', to: 'LCS10', baseTime: 1 },
      { from: 'C3', to: 'CS6', baseTime: 1 },
      { from: 'MS6', to: 'S8', baseTime: 1 }
    ],
    
    // Fixed patrol station locations (10 permanent) - EXPANDED FOR 10x10
    patrolStations: [
        { id: 'PATROL_1', name: 'Central HQ', nodeId: 'C7', x: 910, y: 605 },         // Central Police Station
        { id: 'PATROL_2', name: 'North Precinct', nodeId: 'UCN2', x: 210, y: 385 },   // North Police HQ
        { id: 'PATROL_3', name: 'South Precinct', nodeId: 'LCS3', x: 350, y: 825 },   // South Police Precinct
        { id: 'PATROL_4', name: 'West Station', nodeId: 'C1', x: 70, y: 605 },        // West coverage
        { id: 'PATROL_5', name: 'East Station', nodeId: 'C10', x: 1330, y: 605 },     // East coverage
        { id: 'PATROL_6', name: 'Northeast Hub', nodeId: 'UN9', x: 1190, y: 165 }     // Northeast sector
    ],
    
    // Emergency patrol deployment points
    emergencyPatrols: [
        { id: 'EMERGENCY_1', name: 'Rapid Response Unit Alpha', deployFrom: 'C7' },
        { id: 'EMERGENCY_2', name: 'Rapid Response Unit Bravo', deployFrom: 'C3' }
    ],
    
    // Initial danger zones (can be modified at runtime) - EXPANDED
    initialDangerZones: [
        'CN9',    // Warehouse District - industrial high risk
        'S7',     // South Industrial - isolated area
        'UN10',   // Northeast Industrial - edge of city
        'N10',    // North Tech Park - remote tech zone
        'CS2',    // Bayview Estates - waterfront risk
        'S1',     // Coastal Park - isolated beach area
        'LCS2',   // Willow Creek - residential edge
        'UCN10',  // East Industrial Park - far industrial
        'MN10'    // Distribution Hub - warehouse risk
    ],
    
    // Zone type risk factors (base risk modifiers)
    zoneTypeRiskFactors: {
        'residential': 1.0,
        'commercial': 1.2,
        'industrial': 1.5,
        'transport': 1.4,
        'education': 0.8,
        'medical': 0.7,
        'government': 0.6,
        'police': 0.5,
        'park': 1.1,
        'recreation': 1.0
    }
};

module.exports = CityMapData;
