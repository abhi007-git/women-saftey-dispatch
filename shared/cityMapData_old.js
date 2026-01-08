/**
 * CITY MAP DATA - "SafeCity" Metropolitan Area
 * 
 * This is a fictional city designed to demonstrate:
 * - Graph-based city modeling
 * - Zone-based risk assessment
 * - Strategic patrol placement
 * 
 * City Layout:
 * - 25 nodes (intersections/zones)
 * - 5x5 grid with additional strategic connections
 * - Mix of residential, commercial, and industrial zones
 * - Pre-designated high-risk areas
 */

const CityMapData = {
    // City dimensions (for visualization)
    width: 1200,
    height: 900,
    
    // City nodes (intersections/zones) - EXPANDED TO 60+ NODES
    // Format: { id, x, y, name, type, initialRisk }
    nodes: [
        // Row 1 (Top - Northern District) - 8 nodes
        { id: 'N1', x: 80, y: 80, name: 'North Gate', type: 'residential', initialRisk: 3 },
        { id: 'N2', x: 200, y: 80, name: 'University Area', type: 'education', initialRisk: 2 },
        { id: 'N3', x: 320, y: 80, name: 'Park Junction', type: 'park', initialRisk: 4 },
        { id: 'N4', x: 440, y: 80, name: 'Hospital District', type: 'medical', initialRisk: 1 },
        { id: 'N5', x: 560, y: 80, name: 'Tech Plaza', type: 'commercial', initialRisk: 2 },
        { id: 'N6', x: 680, y: 80, name: 'Research Center', type: 'education', initialRisk: 2 },
        { id: 'N7', x: 800, y: 80, name: 'North Mall', type: 'commercial', initialRisk: 3 },
        { id: 'N8', x: 920, y: 80, name: 'Suburban Area A', type: 'residential', initialRisk: 3 },
        
        // Row 2 (Upper Central North) - 8 nodes
        { id: 'UN1', x: 80, y: 180, name: 'Community Center', type: 'recreation', initialRisk: 3 },
        { id: 'UN2', x: 200, y: 180, name: 'Library Square', type: 'education', initialRisk: 2 },
        { id: 'UN3', x: 320, y: 180, name: 'Cinema Complex', type: 'commercial', initialRisk: 4 },
        { id: 'UN4', x: 440, y: 180, name: 'Medical Plaza', type: 'medical', initialRisk: 2 },
        { id: 'UN5', x: 560, y: 180, name: 'Office Park', type: 'commercial', initialRisk: 2 },
        { id: 'UN6', x: 680, y: 180, name: 'Convention Center', type: 'commercial', initialRisk: 4 },
        { id: 'UN7', x: 800, y: 180, name: 'Residential Area D', type: 'residential', initialRisk: 3 },
        { id: 'UN8', x: 920, y: 180, name: 'East Park', type: 'park', initialRisk: 4 },
        
        // Row 3 (Central North) - 8 nodes
        { id: 'CN1', x: 80, y: 280, name: 'Metro Station A', type: 'transport', initialRisk: 5 },
        { id: 'CN2', x: 200, y: 280, name: 'Shopping District', type: 'commercial', initialRisk: 3 },
        { id: 'CN3', x: 320, y: 280, name: 'City Hall', type: 'government', initialRisk: 1 },
        { id: 'CN4', x: 440, y: 280, name: 'Business Center', type: 'commercial', initialRisk: 2 },
        { id: 'CN5', x: 560, y: 280, name: 'Old Market', type: 'commercial', initialRisk: 6 },
        { id: 'CN6', x: 680, y: 280, name: 'Art District', type: 'commercial', initialRisk: 3 },
        { id: 'CN7', x: 800, y: 280, name: 'Hotel Zone', type: 'commercial', initialRisk: 4 },
        { id: 'CN8', x: 920, y: 280, name: 'Residential Area E', type: 'residential', initialRisk: 4 },
        
        // Row 4 (Upper Downtown) - 8 nodes
        { id: 'UD1', x: 80, y: 380, name: 'Transit Hub', type: 'transport', initialRisk: 6 },
        { id: 'UD2', x: 200, y: 380, name: 'Theater District', type: 'commercial', initialRisk: 4 },
        { id: 'UD3', x: 320, y: 380, name: 'Court House', type: 'government', initialRisk: 1 },
        { id: 'UD4', x: 440, y: 380, name: 'Bank Plaza', type: 'commercial', initialRisk: 2 },
        { id: 'UD5', x: 560, y: 380, name: 'Trade Center', type: 'commercial', initialRisk: 3 },
        { id: 'UD6', x: 680, y: 380, name: 'Food Court', type: 'commercial', initialRisk: 4 },
        { id: 'UD7', x: 800, y: 380, name: 'Residential Tower', type: 'residential', initialRisk: 4 },
        { id: 'UD8', x: 920, y: 380, name: 'Eastside Plaza', type: 'commercial', initialRisk: 5 },
        
        // Row 5 (Central - Downtown) - 8 nodes
        { id: 'C1', x: 80, y: 480, name: 'West Station', type: 'transport', initialRisk: 7 },
        { id: 'C2', x: 200, y: 480, name: 'Plaza Central', type: 'commercial', initialRisk: 4 },
        { id: 'C3', x: 320, y: 480, name: 'Police HQ', type: 'police', initialRisk: 1 },
        { id: 'C4', x: 440, y: 480, name: 'Financial District', type: 'commercial', initialRisk: 3 },
        { id: 'C5', x: 560, y: 480, name: 'Stock Exchange', type: 'commercial', initialRisk: 2 },
        { id: 'C6', x: 680, y: 480, name: 'Grand Mall', type: 'commercial', initialRisk: 4 },
        { id: 'C7', x: 800, y: 480, name: 'East Junction', type: 'residential', initialRisk: 5 },
        { id: 'C8', x: 920, y: 480, name: 'Harbor View', type: 'residential', initialRisk: 5 },
        
        // Row 6 (Lower Downtown) - 8 nodes
        { id: 'LD1', x: 80, y: 580, name: 'Depot Area', type: 'industrial', initialRisk: 7 },
        { id: 'LD2', x: 200, y: 580, name: 'Market Square', type: 'commercial', initialRisk: 5 },
        { id: 'LD3', x: 320, y: 580, name: 'Fire Station', type: 'government', initialRisk: 1 },
        { id: 'LD4', x: 440, y: 580, name: 'Tech Hub', type: 'commercial', initialRisk: 3 },
        { id: 'LD5', x: 560, y: 580, name: 'Riverside Plaza', type: 'commercial', initialRisk: 4 },
        { id: 'LD6', x: 680, y: 580, name: 'Entertainment District', type: 'commercial', initialRisk: 5 },
        { id: 'LD7', x: 800, y: 580, name: 'Apartment Complex', type: 'residential', initialRisk: 4 },
        { id: 'LD8', x: 920, y: 580, name: 'Marina District', type: 'commercial', initialRisk: 6 },
        
        // Row 7 (Central South) - 8 nodes
        { id: 'CS1', x: 80, y: 680, name: 'Industrial Zone A', type: 'industrial', initialRisk: 8 },
        { id: 'CS2', x: 200, y: 680, name: 'Residential Area B', type: 'residential', initialRisk: 4 },
        { id: 'CS3', x: 320, y: 680, name: 'Sports Complex', type: 'recreation', initialRisk: 3 },
        { id: 'CS4', x: 440, y: 680, name: 'Mall Junction', type: 'commercial', initialRisk: 4 },
        { id: 'CS5', x: 560, y: 680, name: 'Warehouse District', type: 'industrial', initialRisk: 7 },
        { id: 'CS6', x: 680, y: 680, name: 'Factory Area', type: 'industrial', initialRisk: 8 },
        { id: 'CS7', x: 800, y: 680, name: 'Workers Housing', type: 'residential', initialRisk: 6 },
        { id: 'CS8', x: 920, y: 680, name: 'Cargo Terminal', type: 'industrial', initialRisk: 7 },
        
        // Row 8 (South - Southern District) - 8 nodes
        { id: 'S1', x: 80, y: 780, name: 'South Port', type: 'industrial', initialRisk: 9 },
        { id: 'S2', x: 200, y: 780, name: 'Night Market', type: 'commercial', initialRisk: 8 },
        { id: 'S3', x: 320, y: 780, name: 'Bus Terminal', type: 'transport', initialRisk: 6 },
        { id: 'S4', x: 440, y: 780, name: 'Residential Area C', type: 'residential', initialRisk: 5 },
        { id: 'S5', x: 560, y: 780, name: 'South Mall', type: 'commercial', initialRisk: 5 },
        { id: 'S6', x: 680, y: 780, name: 'Freight Yard', type: 'industrial', initialRisk: 8 },
        { id: 'S7', x: 800, y: 780, name: 'Border Area', type: 'residential', initialRisk: 7 },
        { id: 'S8', x: 920, y: 780, name: 'Border Checkpoint', type: 'transport', initialRisk: 7 }
    ],
    
    // City edges (roads/connections) - EXPANDED TO 200+ EDGES
    // Format: { from, to, baseTime } - time in seconds (realistic city travel)
    edges: [
        // ========== HORIZONTAL CONNECTIONS (Row 1 - N) ==========
        { from: 'N1', to: 'N2', baseTime: 90 },
        { from: 'N2', to: 'N3', baseTime: 90 },
        { from: 'N3', to: 'N4', baseTime: 90 },
        { from: 'N4', to: 'N5', baseTime: 90 },
        { from: 'N5', to: 'N6', baseTime: 90 },
        { from: 'N6', to: 'N7', baseTime: 90 },
        { from: 'N7', to: 'N8', baseTime: 90 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 2 - UN) ==========
        { from: 'UN1', to: 'UN2', baseTime: 90 },
        { from: 'UN2', to: 'UN3', baseTime: 90 },
        { from: 'UN3', to: 'UN4', baseTime: 90 },
        { from: 'UN4', to: 'UN5', baseTime: 90 },
        { from: 'UN5', to: 'UN6', baseTime: 90 },
        { from: 'UN6', to: 'UN7', baseTime: 90 },
        { from: 'UN7', to: 'UN8', baseTime: 90 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 3 - CN) ==========
        { from: 'CN1', to: 'CN2', baseTime: 120 },
        { from: 'CN2', to: 'CN3', baseTime: 100 },
        { from: 'CN3', to: 'CN4', baseTime: 100 },
        { from: 'CN4', to: 'CN5', baseTime: 120 },
        { from: 'CN5', to: 'CN6', baseTime: 100 },
        { from: 'CN6', to: 'CN7', baseTime: 100 },
        { from: 'CN7', to: 'CN8', baseTime: 120 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 4 - UD) ==========
        { from: 'UD1', to: 'UD2', baseTime: 120 },
        { from: 'UD2', to: 'UD3', baseTime: 100 },
        { from: 'UD3', to: 'UD4', baseTime: 100 },
        { from: 'UD4', to: 'UD5', baseTime: 100 },
        { from: 'UD5', to: 'UD6', baseTime: 100 },
        { from: 'UD6', to: 'UD7', baseTime: 100 },
        { from: 'UD7', to: 'UD8', baseTime: 120 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 5 - C) ==========
        { from: 'C1', to: 'C2', baseTime: 150 },
        { from: 'C2', to: 'C3', baseTime: 100 },
        { from: 'C3', to: 'C4', baseTime: 100 },
        { from: 'C4', to: 'C5', baseTime: 90 },
        { from: 'C5', to: 'C6', baseTime: 100 },
        { from: 'C6', to: 'C7', baseTime: 100 },
        { from: 'C7', to: 'C8', baseTime: 150 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 6 - LD) ==========
        { from: 'LD1', to: 'LD2', baseTime: 150 },
        { from: 'LD2', to: 'LD3', baseTime: 120 },
        { from: 'LD3', to: 'LD4', baseTime: 100 },
        { from: 'LD4', to: 'LD5', baseTime: 100 },
        { from: 'LD5', to: 'LD6', baseTime: 100 },
        { from: 'LD6', to: 'LD7', baseTime: 100 },
        { from: 'LD7', to: 'LD8', baseTime: 150 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 7 - CS) ==========
        { from: 'CS1', to: 'CS2', baseTime: 180 },
        { from: 'CS2', to: 'CS3', baseTime: 120 },
        { from: 'CS3', to: 'CS4', baseTime: 120 },
        { from: 'CS4', to: 'CS5', baseTime: 120 },
        { from: 'CS5', to: 'CS6', baseTime: 120 },
        { from: 'CS6', to: 'CS7', baseTime: 120 },
        { from: 'CS7', to: 'CS8', baseTime: 180 },
        
        // ========== HORIZONTAL CONNECTIONS (Row 8 - S) ==========
        { from: 'S1', to: 'S2', baseTime: 200 },
        { from: 'S2', to: 'S3', baseTime: 150 },
        { from: 'S3', to: 'S4', baseTime: 150 },
        { from: 'S4', to: 'S5', baseTime: 150 },
        { from: 'S5', to: 'S6', baseTime: 150 },
        { from: 'S6', to: 'S7', baseTime: 150 },
        { from: 'S7', to: 'S8', baseTime: 200 },
        
        // ========== VERTICAL CONNECTIONS (Column 1) ==========
        { from: 'N1', to: 'UN1', baseTime: 100 },
        { from: 'UN1', to: 'CN1', baseTime: 100 },
        { from: 'CN1', to: 'UD1', baseTime: 100 },
        { from: 'UD1', to: 'C1', baseTime: 100 },
        { from: 'C1', to: 'LD1', baseTime: 100 },
        { from: 'LD1', to: 'CS1', baseTime: 100 },
        { from: 'CS1', to: 'S1', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 2) ==========
        { from: 'N2', to: 'UN2', baseTime: 100 },
        { from: 'UN2', to: 'CN2', baseTime: 100 },
        { from: 'CN2', to: 'UD2', baseTime: 100 },
        { from: 'UD2', to: 'C2', baseTime: 100 },
        { from: 'C2', to: 'LD2', baseTime: 100 },
        { from: 'LD2', to: 'CS2', baseTime: 100 },
        { from: 'CS2', to: 'S2', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 3) ==========
        { from: 'N3', to: 'UN3', baseTime: 100 },
        { from: 'UN3', to: 'CN3', baseTime: 100 },
        { from: 'CN3', to: 'UD3', baseTime: 90 },
        { from: 'UD3', to: 'C3', baseTime: 90 },
        { from: 'C3', to: 'LD3', baseTime: 90 },
        { from: 'LD3', to: 'CS3', baseTime: 100 },
        { from: 'CS3', to: 'S3', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 4) ==========
        { from: 'N4', to: 'UN4', baseTime: 100 },
        { from: 'UN4', to: 'CN4', baseTime: 100 },
        { from: 'CN4', to: 'UD4', baseTime: 100 },
        { from: 'UD4', to: 'C4', baseTime: 100 },
        { from: 'C4', to: 'LD4', baseTime: 100 },
        { from: 'LD4', to: 'CS4', baseTime: 100 },
        { from: 'CS4', to: 'S4', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 5) ==========
        { from: 'N5', to: 'UN5', baseTime: 100 },
        { from: 'UN5', to: 'CN5', baseTime: 100 },
        { from: 'CN5', to: 'UD5', baseTime: 100 },
        { from: 'UD5', to: 'C5', baseTime: 100 },
        { from: 'C5', to: 'LD5', baseTime: 100 },
        { from: 'LD5', to: 'CS5', baseTime: 100 },
        { from: 'CS5', to: 'S5', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 6) ==========
        { from: 'N6', to: 'UN6', baseTime: 100 },
        { from: 'UN6', to: 'CN6', baseTime: 100 },
        { from: 'CN6', to: 'UD6', baseTime: 100 },
        { from: 'UD6', to: 'C6', baseTime: 100 },
        { from: 'C6', to: 'LD6', baseTime: 100 },
        { from: 'LD6', to: 'CS6', baseTime: 100 },
        { from: 'CS6', to: 'S6', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 7) ==========
        { from: 'N7', to: 'UN7', baseTime: 100 },
        { from: 'UN7', to: 'CN7', baseTime: 100 },
        { from: 'CN7', to: 'UD7', baseTime: 100 },
        { from: 'UD7', to: 'C7', baseTime: 100 },
        { from: 'C7', to: 'LD7', baseTime: 100 },
        { from: 'LD7', to: 'CS7', baseTime: 100 },
        { from: 'CS7', to: 'S7', baseTime: 100 },
        
        // ========== VERTICAL CONNECTIONS (Column 8) ==========
        { from: 'N8', to: 'UN8', baseTime: 100 },
        { from: 'UN8', to: 'CN8', baseTime: 100 },
        { from: 'CN8', to: 'UD8', baseTime: 100 },
        { from: 'UD8', to: 'C8', baseTime: 100 },
        { from: 'C8', to: 'LD8', baseTime: 100 },
        { from: 'LD8', to: 'CS8', baseTime: 100 },
        { from: 'CS8', to: 'S8', baseTime: 100 },
        
        // ========== DIAGONAL SHORTCUTS (Northwest to Southeast) ==========
        { from: 'N2', to: 'UN3', baseTime: 110 },
        { from: 'UN2', to: 'CN3', baseTime: 110 },
        { from: 'CN2', to: 'UD3', baseTime: 110 },
        { from: 'UD2', to: 'C3', baseTime: 100 },
        { from: 'C2', to: 'LD3', baseTime: 110 },
        { from: 'LD2', to: 'CS3', baseTime: 110 },
        { from: 'CS2', to: 'S3', baseTime: 110 },
        
        { from: 'N3', to: 'UN4', baseTime: 110 },
        { from: 'UN3', to: 'CN4', baseTime: 110 },
        { from: 'CN3', to: 'UD4', baseTime: 110 },
        { from: 'UD3', to: 'C4', baseTime: 110 },
        { from: 'C3', to: 'LD4', baseTime: 110 },
        { from: 'LD3', to: 'CS4', baseTime: 110 },
        { from: 'CS3', to: 'S4', baseTime: 110 },
        
        { from: 'N4', to: 'UN5', baseTime: 110 },
        { from: 'UN4', to: 'CN5', baseTime: 110 },
        { from: 'CN4', to: 'UD5', baseTime: 110 },
        { from: 'UD4', to: 'C5', baseTime: 110 },
        { from: 'C4', to: 'LD5', baseTime: 110 },
        { from: 'LD4', to: 'CS5', baseTime: 110 },
        { from: 'CS4', to: 'S5', baseTime: 110 },
        
        { from: 'N5', to: 'UN6', baseTime: 110 },
        { from: 'UN5', to: 'CN6', baseTime: 110 },
        { from: 'CN5', to: 'UD6', baseTime: 110 },
        { from: 'UD5', to: 'C6', baseTime: 110 },
        { from: 'C5', to: 'LD6', baseTime: 110 },
        { from: 'LD5', to: 'CS6', baseTime: 110 },
        { from: 'CS5', to: 'S6', baseTime: 110 },
        
        { from: 'N6', to: 'UN7', baseTime: 110 },
        { from: 'UN6', to: 'CN7', baseTime: 110 },
        { from: 'CN6', to: 'UD7', baseTime: 110 },
        { from: 'UD6', to: 'C7', baseTime: 110 },
        { from: 'C6', to: 'LD7', baseTime: 110 },
        { from: 'LD6', to: 'CS7', baseTime: 110 },
        { from: 'CS6', to: 'S7', baseTime: 110 },
        
        // ========== DIAGONAL SHORTCUTS (Northeast to Southwest) ==========
        { from: 'N3', to: 'UN2', baseTime: 110 },
        { from: 'UN4', to: 'CN3', baseTime: 110 },
        { from: 'CN5', to: 'UD4', baseTime: 110 },
        { from: 'UD6', to: 'C5', baseTime: 110 },
        { from: 'C7', to: 'LD6', baseTime: 110 },
        { from: 'LD8', to: 'CS7', baseTime: 110 },
        
        // ========== EXPRESS ROUTES (Long-distance high-speed) ==========
        { from: 'N1', to: 'C1', baseTime: 240 },  // West express
        { from: 'N8', to: 'C8', baseTime: 240 },  // East express
        { from: 'N4', to: 'S4', baseTime: 300 },  // North-South express
        { from: 'C3', to: 'N3', baseTime: 180 },  // Police HQ to North
        { from: 'C3', to: 'S3', baseTime: 180 },  // Police HQ to South
        { from: 'CN1', to: 'CN8', baseTime: 360 }, // Cross-city metro
        { from: 'C1', to: 'C8', baseTime: 360 },   // Cross-city central
        
        // ========== STRATEGIC SHORTCUTS ==========
        { from: 'N2', to: 'CN3', baseTime: 140 },  // University to City Hall
        { from: 'CN2', to: 'C3', baseTime: 120 },  // Shopping to Police HQ
        { from: 'C3', to: 'CS4', baseTime: 140 },  // Police HQ to Mall
        { from: 'UD4', to: 'LD5', baseTime: 120 }, // Bank to Riverside
        { from: 'CN5', to: 'C6', baseTime: 130 },  // Old Market to Grand Mall
        { from: 'C4', to: 'LD6', baseTime: 150 },  // Financial to Entertainment
        { from: 'UN6', to: 'CN7', baseTime: 120 }, // Convention to Hotel
        { from: 'LD3', to: 'CS4', baseTime: 140 }, // Fire Station to Mall
    ],
    
    // Fixed patrol station locations (7 permanent) - EXPANDED FOR 8x8 GRID
    patrolStations: [
        { id: 'PATROL_1', name: 'Station Alpha (HQ)', nodeId: 'C4', x: 525, y: 450 },    // Police HQ Central
        { id: 'PATROL_2', name: 'Station Bravo', nodeId: 'N3', x: 375, y: 100 },        // University (North)
        { id: 'PATROL_3', name: 'Station Charlie', nodeId: 'S5', x: 675, y: 800 },      // South District
        { id: 'PATROL_4', name: 'Station Delta', nodeId: 'C1', x: 75, y: 450 },         // West Station (West)
        { id: 'PATROL_5', name: 'Station Echo', nodeId: 'C7', x: 975, y: 450 },         // East District
        { id: 'PATROL_6', name: 'Station Foxtrot', nodeId: 'CN6', x: 825, y: 300 },     // Northeast Hub
        { id: 'PATROL_7', name: 'Station Golf', nodeId: 'LD3', x: 375, y: 650 }         // Southwest Hub
    ],
    
    // Emergency patrol deployment points (2 hidden, deployed on demand)
    emergencyPatrols: [
        { id: 'EMERGENCY_1', name: 'Rapid Response Unit 1', deployFrom: 'C4' },
        { id: 'EMERGENCY_2', name: 'Rapid Response Unit 2', deployFrom: 'CN5' }
    ],
    
    // Initial danger zones (can be modified at runtime) - EXPANDED FOR REALISM
    initialDangerZones: [
        'CS2',   // Residential area - moderate risk
        'S1',    // Far suburban area - lower risk  
        'CN7',   // Hotel district - moderate risk
        'LD8',   // Entertainment district - moderate risk
        'UN1',   // Campus edge - lower risk
        'CS6',   // Community center area - moderate risk
        'UD8'    // Medical district overflow - lower risk
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
