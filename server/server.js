/**
 * EMERGENCY DISPATCH SIMULATION SERVER
 * 
 * This is the central nervous system of the simulation
 * All intelligence and decision-making happens here
 * 
 * Architecture:
 * 1. Express HTTP server for static files
 * 2. WebSocket server for real-time communication
 * 3. Data Structure engine (Hash Table, Priority Queue, Graph)
 * 4. Patrol management system
 * 5. Emergency dispatch logic
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// ==================================================
// PERSISTENCE PATHS
// ==================================================

const PERSISTENCE_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(PERSISTENCE_DIR, 'resolution_history.json');
const ZONES_FILE = path.join(PERSISTENCE_DIR, 'zone_intelligence.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(PERSISTENCE_DIR)) {
    fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
    console.log('📁 Created data directory for persistence');
}

// ==================================================
// SYSTEM CONSTANTS (NO MAGIC NUMBERS)
// ==================================================

// Emergency States - SINGLE SOURCE OF TRUTH
const EMERGENCY_STATE = {
    PENDING: 'PENDING',         // Alert received, awaiting patrol assignment
    ASSIGNED: 'ASSIGNED',       // Patrol assigned, preparing to move
    RESPONDING: 'RESPONDING',   // Patrol en route to location
    ENGAGED: 'ENGAGED',         // Patrol at scene, handling emergency
    RESOLVED: 'RESOLVED'        // Emergency successfully handled
};

// Patrol States - SINGLE SOURCE OF TRUTH
const PATROL_STATE = {
    IDLE: 'IDLE',               // Available at station
    EN_ROUTE: 'EN_ROUTE',       // Moving toward emergency
    ENGAGED: 'ENGAGED',         // At emergency scene
    RETURNING: 'RETURNING'      // Returning to home station
};

// Timing Constants (all in seconds)
const TIMING = {
    PATROL_MOVEMENT_SPEED: 0.3,    // Seconds per map update (slower for visibility)
    RESOLUTION_TIME: 1,            // Minimum time to reach emergency (1 second delay)
    RETURN_TIME: 2,                // Time to return to station
    PRIORITY_RECALC_INTERVAL: 1,   // How often to recalculate priorities
    RISK_DECAY_INTERVAL: 60,       // How often zone risks decay
    BROADCAST_INTERVAL: 0.05       // Real-time update frequency (20 FPS)
};

// Deployment Thresholds
const DEPLOYMENT = {
    EMERGENCY_UNIT_PRIORITY_THRESHOLD: 2,  // Deploy if 2+ high priority alerts waiting
    EMERGENCY_UNIT_QUEUE_THRESHOLD: 5      // Deploy if 5+ total alerts waiting
};

// Resolution History (for showing DSA usage)
const resolutionHistory = [];
const MAX_HISTORY = 50; // Keep last 50 resolutions

// Import DSA components
const ZoneIntelligenceHashTable = require('./dsa/HashTable');
const EmergencyPriorityQueue = require('./dsa/PriorityQueue');
const CityGraph = require('./dsa/Graph');
const DijkstraPathFinder = require('./dsa/Dijkstra');

// Import city map data
const CityMapData = require('../shared/cityMapData');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use('/desktop', express.static(path.join(__dirname, '../desktop')));
app.use('/mobile', express.static(path.join(__dirname, '../mobile')));
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// ==================================================
// DATA STRUCTURE INITIALIZATION
// ==================================================

console.log('=== Initializing Emergency Dispatch System ===');

// 1. Initialize Zone Intelligence Hash Table
const zoneIntelligence = new ZoneIntelligenceHashTable(50);
console.log('✓ Hash Table initialized (Zone Intelligence)');

// 2. Initialize Priority Queue
const emergencyQueue = new EmergencyPriorityQueue();
console.log('✓ Priority Queue initialized (Emergency Ordering)');

// 3. Initialize City Graph
const cityGraph = new CityGraph();
console.log('✓ Graph initialized (City Network)');

// 4. Load city map data into graph
CityMapData.nodes.forEach(node => {
    cityGraph.addNode(node.id, {
        x: node.x,
        y: node.y,
        name: node.name,
        type: node.type
    });
    
    // Initialize zone intelligence
    zoneIntelligence.set(node.id, {
        risk_level: node.initialRisk || 5,
        past_incident_count: 0,
        dominant_distress_type: 'unknown',
        average_response_time: 0,
        recent_incidents: [],
        zone_type: node.type
    });
});

CityMapData.edges.forEach(edge => {
    cityGraph.addEdge(edge.from, edge.to, edge.baseTime, true);
});

// Set initial danger zones
CityMapData.initialDangerZones.forEach(zoneId => {
    cityGraph.setDangerZone(zoneId, true);
});

console.log(`✓ City map loaded: ${CityMapData.nodes.length} nodes, ${CityMapData.edges.length} edges`);

// 5. Initialize Dijkstra Path Finder
const pathFinder = new DijkstraPathFinder(cityGraph);
console.log('✓ Dijkstra path finder initialized');

// ==================================================
// PERSISTENCE FUNCTIONS
// ==================================================

/**
 * Load persisted data from disk
 */
function loadPersistedData() {
    // Load resolution history
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            const loaded = JSON.parse(data);
            resolutionHistory.push(...loaded);
            console.log(`📂 Loaded ${resolutionHistory.length} resolution records from disk`);
        } catch (error) {
            console.error('⚠️ Error loading history:', error.message);
        }
    }
    
    // Load zone intelligence
    if (fs.existsSync(ZONES_FILE)) {
        try {
            const data = fs.readFileSync(ZONES_FILE, 'utf8');
            const zoneData = JSON.parse(data);
            
            // Restore zone data to hash table
            for (let zoneId in zoneData) {
                zoneIntelligence.set(zoneId, zoneData[zoneId]);
            }
            console.log(`📂 Loaded zone intelligence for ${Object.keys(zoneData).length} zones from disk`);
        } catch (error) {
            console.error('⚠️ Error loading zones:', error.message);
        }
    }
}

/**
 * Save data to disk (called periodically and on resolution)
 */
function saveDataToDisk() {
    try {
        // Save resolution history
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(resolutionHistory, null, 2));
        
        // Save zone intelligence
        const allZones = zoneIntelligence.getAllZones();
        const zoneData = {};
        allZones.forEach(zone => {
            zoneData[zone.zoneId] = {
                risk_level: zone.risk_level,
                past_incident_count: zone.past_incident_count,
                dominant_distress_type: zone.dominant_distress_type,
                average_response_time: zone.average_response_time,
                recent_incidents: zone.recent_incidents,
                distress_type_count: zone.distress_type_count
            };
        });
        fs.writeFileSync(ZONES_FILE, JSON.stringify(zoneData, null, 2));
        
        console.log(`💾 Data saved: ${resolutionHistory.length} resolutions, ${allZones.length} zones`);
    } catch (error) {
        console.error('⚠️ Error saving data:', error.message);
    }
}

// Load persisted data on startup
loadPersistedData();

// Auto-save every 30 seconds
setInterval(() => {
    saveDataToDisk();
}, 30000);

// Save on server shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    saveDataToDisk();
    console.log('✓ Data saved successfully');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server shutting down...');
    saveDataToDisk();
    console.log('✓ Data saved successfully');
    process.exit(0);
});

// ==================================================
// PATROL MANAGEMENT SYSTEM
// ==================================================

class PatrolManager {
    constructor() {
        this.patrols = new Map();
        this.emergencyPatrols = new Map();
        this.nextEmergencyId = 1;
        
        // Initialize fixed patrol stations
        CityMapData.patrolStations.forEach(station => {
            this.patrols.set(station.id, {
                id: station.id,
                name: station.name,
                currentLocation: station.nodeId,
                homeStation: station.nodeId,
                state: PATROL_STATE.IDLE,
                assignedEmergency: null,
                path: [],
                pathProgress: 0,
                eta: 0,
                lastStateChange: Date.now()
            });
        });
        
        console.log(`✓ ${this.patrols.size} patrol units initialized (instant response mode)`);
    }
    
    /**
     * Find best available patrol for emergency
     * Considers: distance (PRIMARY), current state
     * NEAREST AVAILABLE PATROL gets priority
     */
    findBestPatrol(emergencyLocation) {
        let bestPatrol = null;
        let bestScore = Infinity;
        
        for (let [patrolId, patrol] of this.patrols) {
            // Skip if already engaged or en route
            if (patrol.state === PATROL_STATE.ENGAGED || patrol.state === PATROL_STATE.EN_ROUTE) {
                continue;
            }
            
            // Calculate path to emergency using Dijkstra
            const route = pathFinder.findSafestPath(patrol.currentLocation, emergencyLocation);
            
            if (route.totalTime === -1) continue; // No path available
            
            // Score = travel time (PRIMARY) + small state penalty
            // IDLE patrols preferred, but distance is most important
            const statePenalty = patrol.state === PATROL_STATE.RETURNING ? 10 : 0;
            const score = route.totalTime + statePenalty;
            
            if (score < bestScore) {
                bestScore = score;
                bestPatrol = {
                    patrolId: patrolId,
                    patrol: patrol,
                    route: route
                };
            }
        }
        
        return bestPatrol;
    }
    
    /**
     * Deploy emergency patrol (hidden units)
     */
    deployEmergencyPatrol(emergencyLocation) {
        if (this.emergencyPatrols.size >= 2) {
            return null; // All emergency units deployed
        }
        
        const emergencyUnit = CityMapData.emergencyPatrols[this.emergencyPatrols.size];
        const patrolId = `${emergencyUnit.id}_${this.nextEmergencyId++}`;
        
        const route = pathFinder.findSafestPath(emergencyUnit.deployFrom, emergencyLocation);
        
        if (route.totalTime === -1) return null;
        
        const patrol = {
            id: patrolId,
            name: emergencyUnit.name,
            currentLocation: emergencyUnit.deployFrom,
            homeStation: emergencyUnit.deployFrom,
            state: 'EN_ROUTE',
            assignedEmergency: null,
            path: route.path,
            pathProgress: 0,
            eta: route.totalTime,
            lastStateChange: Date.now(),
            isEmergencyUnit: true
        };
        
        this.emergencyPatrols.set(patrolId, patrol);
        
        console.log(`⚠️  Emergency unit deployed: ${patrolId}`);
        
        return { patrolId, patrol, route };
    }
    
    /**
     * Assign patrol to emergency
     */
    assignPatrol(patrolId, emergency, route) {
        const patrol = this.patrols.get(patrolId) || this.emergencyPatrols.get(patrolId);
        
        if (!patrol) return false;
        
        patrol.state = PATROL_STATE.EN_ROUTE;
        patrol.assignedEmergency = emergency.id;
        patrol.path = route.path;
        patrol.pathProgress = 0;
        patrol.eta = route.totalTime + 1; // Add 1 second minimum delay to travel time
        patrol.lastStateChange = Date.now();
        
        return true;
    }
    
    /**
     * Update patrol movement (called periodically)
     */
    updatePatrolMovement() {
        const movementSpeed = TIMING.PATROL_MOVEMENT_SPEED;
        
        for (let patrol of [...this.patrols.values(), ...this.emergencyPatrols.values()]) {
            if (patrol.state === PATROL_STATE.EN_ROUTE && patrol.path.length > 0) {
                // Smooth movement - move 1 node at a time
                const nodesPerUpdate = 1;
                
                patrol.pathProgress += nodesPerUpdate;
                patrol.eta = Math.max(0, patrol.eta - movementSpeed);
                
                // Jump directly to node position
                const currentIndex = Math.min(patrol.pathProgress, patrol.path.length - 1);
                patrol.currentLocation = patrol.path[currentIndex].nodeId;
                
                // Calculate time elapsed since assignment
                const timeElapsed = (Date.now() - patrol.lastStateChange) / 1000;
                
                // Reached destination ONLY if: reached last node AND at least 3 seconds have passed
                const reachedLastNode = currentIndex >= patrol.path.length - 1;
                const minTimeElapsed = timeElapsed >= TIMING.RESOLUTION_TIME;
                
                if (reachedLastNode && minTimeElapsed) {
                    patrol.state = PATROL_STATE.ENGAGED;
                    patrol.pathProgress = 0;
                    patrol.engagedAt = Date.now(); // Track when engaged
                    patrol.currentLocation = patrol.path[patrol.path.length - 1].nodeId;
                }
            }
        }
    }
    
    /**
     * Complete patrol assignment (emergency resolved)
     */
    completeAssignment(patrolId) {
        const patrol = this.patrols.get(patrolId) || this.emergencyPatrols.get(patrolId);
        
        if (!patrol) return;
        
        if (patrol.isEmergencyUnit) {
            // Emergency units are removed after mission
            this.emergencyPatrols.delete(patrolId);
            console.log(`✓ Emergency unit ${patrolId} mission complete, returning to base`);
        } else {
            // Regular patrols stay IDLE at current location ready for next emergency
            // They do NOT return to station until all emergencies are cleared
            patrol.state = PATROL_STATE.IDLE;
            patrol.assignedEmergency = null;
            patrol.path = [];
            patrol.lastStateChange = Date.now();
            console.log(`✓ ${patrolId} saved emergency, now IDLE at node ${patrol.currentLocation} ready for next call`);
        }
    }
    
    /**
     * Get all patrol statuses
     */
    getAllPatrolStatuses() {
        const statuses = [];
        
        for (let patrol of this.patrols.values()) {
            statuses.push(this._getPatrolStatus(patrol));
        }
        
        for (let patrol of this.emergencyPatrols.values()) {
            statuses.push(this._getPatrolStatus(patrol));
        }
        
        return statuses;
    }
    
    _getPatrolStatus(patrol) {
        const node = cityGraph.getNode(patrol.currentLocation);
        
        return {
            id: patrol.id,
            name: patrol.name,
            state: patrol.state,
            currentLocation: patrol.currentLocation,
            locationName: node?.name || patrol.currentLocation,
            x: node?.x || 0,
            y: node?.y || 0,
            assignedEmergency: patrol.assignedEmergency,
            eta: patrol.eta,
            path: patrol.path,
            isEmergencyUnit: patrol.isEmergencyUnit || false
        };
    }
}

const patrolManager = new PatrolManager();

// ==================================================
// EMERGENCY HANDLING LOGIC
// ==================================================

let emergencyIdCounter = 1;
const activeEmergencies = new Map();

/**
 * Handle new emergency alert
 * This is the core dispatch logic
 */
function handleEmergencyAlert(alertData) {
    const emergency = {
        id: `EMG_${emergencyIdCounter++}`,
        timestamp: Date.now(),
        location: alertData.location,
        nodeId: alertData.nodeId,
        distress_type: alertData.distress_type,
        description: alertData.description || '',
        status: EMERGENCY_STATE.PENDING,
        assignedPatrol: null,
        responseTime: null
    };
    
    // Get zone intelligence
    const zoneData = zoneIntelligence.get(emergency.nodeId);
    emergency.zone_risk_level = zoneData.risk_level;
    
    // Find nearest patrol for priority calculation
    const nearestPatrol = patrolManager.findBestPatrol(emergency.nodeId);
    emergency.nearest_patrol_distance = nearestPatrol ? nearestPatrol.route.totalTime : 999;
    
    // Add to priority queue
    emergencyQueue.enqueue(emergency);
    activeEmergencies.set(emergency.id, emergency);
    
    console.log(`🚨 New emergency: ${emergency.id} at ${emergency.nodeId} (${emergency.distress_type})`);
    
    // Attempt immediate dispatch
    processEmergencyQueue();
    
    // Broadcast update
    broadcastSystemState();
    
    return emergency;
}

/**
 * Process emergency queue and assign patrols
 * CRITICAL: This runs the dispatch algorithm
 */
function processEmergencyQueue() {
    // Track queue positions for history
    const allEmergencies = emergencyQueue.getAllSorted();
    allEmergencies.forEach((e, idx) => {
        e.queuePosition = idx + 1;
    });
    
    while (!emergencyQueue.isEmpty()) {
        const emergency = emergencyQueue.peek();
        
        if (emergency.status !== EMERGENCY_STATE.PENDING) {
            emergencyQueue.dequeue();
            continue;
        }
        
        // Find best available patrol
        const assignment = patrolManager.findBestPatrol(emergency.nodeId);
        
        if (!assignment) {
            // No patrols available - check if should deploy emergency unit
            const queueStats = emergencyQueue.getStatistics();
            
            if (queueStats.highPriority >= DEPLOYMENT.EMERGENCY_UNIT_PRIORITY_THRESHOLD || 
                queueStats.total >= DEPLOYMENT.EMERGENCY_UNIT_QUEUE_THRESHOLD) {
                const emergencyAssignment = patrolManager.deployEmergencyPatrol(emergency.nodeId);
                
                if (emergencyAssignment) {
                    assignPatrolToEmergency(
                        emergency,
                        emergencyAssignment.patrolId,
                        emergencyAssignment.route
                    );
                    emergencyQueue.dequeue();
                    continue;
                }
            }
            
            // No patrol available, emergency stays in queue
            console.log(`⏸️  Emergency ${emergency.id} waiting for patrol`);
            break;
        }
        
        // Assign patrol
        assignPatrolToEmergency(emergency, assignment.patrolId, assignment.route);
        emergencyQueue.dequeue();
    }
}

/**
 * Assign patrol to emergency
 */
function assignPatrolToEmergency(emergency, patrolId, route) {
    emergency.status = EMERGENCY_STATE.ASSIGNED;
    emergency.assignedPatrol = patrolId;
    emergency.eta = route.totalTime;
    emergency.assignedAt = Date.now();
    emergency.route = route;
    
    patrolManager.assignPatrol(patrolId, emergency, route);
    
    console.log(`✓ Patrol ${patrolId} assigned to ${emergency.id}, ETA: ${Math.round(route.totalTime)}s`);
}

/**
 * Resolve emergency (patrol arrived)
 */
function resolveEmergency(emergencyId) {
    const emergency = activeEmergencies.get(emergencyId);
    
    if (!emergency) {
        console.log('⚠️ resolveEmergency called with invalid ID:', emergencyId);
        return;
    }
    
    emergency.status = EMERGENCY_STATE.RESOLVED;
    emergency.resolvedAt = Date.now();
    emergency.responseTime = (emergency.resolvedAt - emergency.timestamp) / 1000;
    
    console.log('🔧 Resolving emergency:', emergencyId);
    
    const patrol = patrolManager.patrols.get(emergency.assignedPatrol) || patrolManager.emergencyPatrols.get(emergency.assignedPatrol);
    
    // Save resolution history BEFORE clearing data
    if (patrol && emergency.route) {
        const zone = zoneIntelligence.getZone(emergency.nodeId);
        const historyEntry = {
            id: emergency.id,
            timestamp: new Date().toISOString(),
            // Emergency details
            distressType: emergency.distress_type,
            location: emergency.location,
            nodeId: emergency.nodeId,
            // Priority Queue data
            priority: emergency.priority,
            priorityBreakdown: {
                severityScore: emergency.distress_type === 'assault' || emergency.distress_type === 'kidnap' ? 50 : 30,
                timeScore: Math.min(((Date.now() - emergency.timestamp) / 1000) * 2, 30),
                zoneRisk: zone ? zone.risk_level * 5 : 0,
                availabilityBonus: 10
            },
            queuePosition: emergency.queuePosition || 'N/A',
            // Patrol details
            patrolId: patrol.id,
            patrolName: patrol.name,
            patrolType: patrol.isEmergencyUnit ? 'Emergency Unit' : 'Regular Patrol',
            // Dijkstra details
            pathTaken: emergency.route.path,
            pathLength: emergency.route.path.length,
            totalTime: emergency.route.totalTime,
            dangerZonesAvoided: emergency.route.dangerZonesInPath || 0,
            alternativePathsConsidered: emergency.route.nodesVisited || 0,
            // Zone Intelligence (Hash Table)
            zoneRisk: zone ? zone.risk_level : 0,
            zonePastIncidents: zone ? zone.past_incident_count : 0,
            zoneDominantType: zone ? zone.dominant_distress_type : 'N/A',
            hashBucket: zone ? zone.hashIndex : 'N/A',
            // Response metrics
            responseTime: emergency.responseTime,
            resolvedAt: emergency.resolvedAt
        };
        
        resolutionHistory.unshift(historyEntry);
        
        // Keep only last MAX_HISTORY entries
        if (resolutionHistory.length > MAX_HISTORY) {
            resolutionHistory.pop();
        }
        
        console.log(`📊 History saved: ${emergency.id} | Total history: ${resolutionHistory.length}`);
        console.log(`   Details: ${historyEntry.distressType} at ${historyEntry.location}, Priority: ${historyEntry.priority.toFixed(1)}, Path: ${historyEntry.pathLength} nodes`);
        
        // Save to disk immediately (important data!)
        saveDataToDisk();
    } else {
        console.log(`⚠️ Could not save history: patrol=${!!patrol}, route=${!!emergency.route}`);
    }
    
    // Update zone intelligence
    zoneIntelligence.updateZoneRisk(
        emergency.nodeId,
        emergency.distress_type,
        emergency.responseTime
    );
    
    // Save zone data to disk after update
    saveDataToDisk();
    
    // Complete patrol assignment
    if (emergency.assignedPatrol) {
        patrolManager.completeAssignment(emergency.assignedPatrol);
    }
    
    // Remove woman from map IMMEDIATELY when engaged
    activeEmergencies.delete(emergencyId);
    
    console.log(`✓ Emergency ${emergencyId} resolved in ${emergency.responseTime.toFixed(1)}s`);
    
    // Broadcast updated state
    broadcastSystemState();
}

// ==================================================
// WEBSOCKET COMMUNICATION
// ==================================================

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`Client connected. Total clients: ${clients.size}`);
    
    // Send initial state
    ws.send(JSON.stringify({
        type: 'INITIAL_STATE',
        data: getSystemState()
    }));
    
    // Set up heartbeat tracking
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(data, ws);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Client disconnected. Total clients: ${clients.size}`);
    });
});

// Heartbeat to detect broken connections
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log('Terminating dead connection');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000); // Check every 30 seconds

wss.on('close', () => {
    clearInterval(heartbeatInterval);
});

function handleClientMessage(data, ws) {
    switch (data.type) {
        case 'PING':
            // Heartbeat - keep connection alive
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'PONG' }));
            }
            break;
            
        case 'NEW_EMERGENCY':
            handleEmergencyAlert(data.payload);
            break;
            
        case 'TOGGLE_DANGER_ZONE':
            cityGraph.setDangerZone(data.payload.nodeId, data.payload.isDanger);
            console.log(`${data.payload.isDanger ? '⚠️' : '✓'} Danger zone ${data.payload.nodeId} ${data.payload.isDanger ? 'activated' : 'deactivated'}`);
            broadcastSystemState();
            break;
            
        case 'RESOLVE_EMERGENCY':
            resolveEmergency(data.payload.emergencyId);
            break;
            
        case 'RESET_SYSTEM':
            resetSystem();
            console.log('🔄 System reset - all emergencies cleared, patrols returning to stations');
            broadcastSystemState();
            break;
            
        case 'REQUEST_STATE':
            ws.send(JSON.stringify({
                type: 'STATE_UPDATE',
                data: getSystemState()
            }));
            break;
    }
}

function broadcastSystemState() {
    const state = getSystemState();
    const message = JSON.stringify({
        type: 'STATE_UPDATE',
        data: state
    });
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function getSystemState() {
    const state = {
        timestamp: Date.now(),
        map: {
            nodes: cityGraph.getAllNodes(),
            edges: cityGraph.getAllEdges(),
            dangerZones: cityGraph.getDangerZones()
        },
        emergencyQueue: emergencyQueue.getAllSorted(),
        activeEmergencies: Array.from(activeEmergencies.values()),
        patrols: patrolManager.getAllPatrolStatuses(),
        zoneIntelligence: zoneIntelligence.getAllZones(),
        hashTableInternals: zoneIntelligence.getHashTableInternals(), // Expose hash table structure
        resolutionHistory: resolutionHistory.slice(0, 20), // Last 20 resolutions for display
        statistics: {
            queue: emergencyQueue.getStatistics(),
            zones: zoneIntelligence.getStatistics(),
            patrols: {
                total: patrolManager.patrols.size,
                emergency: patrolManager.emergencyPatrols.size,
                idle: patrolManager.getAllPatrolStatuses().filter(p => p.state === PATROL_STATE.IDLE).length,
                active: patrolManager.getAllPatrolStatuses().filter(p => p.state === PATROL_STATE.EN_ROUTE || p.state === PATROL_STATE.ENGAGED).length
            }
        }
    };
    
    return state;
}

// ==================================================
// PERIODIC UPDATES
// ==================================================

// Recalculate priorities (dynamic priority escalation)
setInterval(() => {
    emergencyQueue.recalculatePriorities();
    processEmergencyQueue();
}, TIMING.PRIORITY_RECALC_INTERVAL * 1000);

// Update patrol movement and system state (real-time updates)
setInterval(() => {
    patrolManager.updatePatrolMovement();
    
    // Check for patrols that have reached destination and update emergency states
    const patrols = patrolManager.getAllPatrolStatuses();
    for (let patrol of patrols) {
        if (patrol.assignedEmergency) {
            const emergency = activeEmergencies.get(patrol.assignedEmergency);
            if (!emergency) continue;
            
            // Sync emergency status with patrol status
            if (patrol.state === PATROL_STATE.EN_ROUTE && emergency.status === EMERGENCY_STATE.ASSIGNED) {
                emergency.status = EMERGENCY_STATE.RESPONDING;
            } else if (patrol.state === PATROL_STATE.ENGAGED && emergency.status === EMERGENCY_STATE.RESPONDING) {
                emergency.status = EMERGENCY_STATE.ENGAGED;
            }
            
            // Auto-resolve IMMEDIATELY when patrol engages (woman deleted on engagement)
            if (patrol.state === PATROL_STATE.ENGAGED && emergency.status !== EMERGENCY_STATE.RESOLVED) {
                resolveEmergency(patrol.assignedEmergency);
                // Immediately check queue for next emergency
                processEmergencyQueue();
            }
        }
    }
    
    broadcastSystemState();
}, TIMING.BROADCAST_INTERVAL * 1000);

// System reset function
function resetSystem() {
    console.log('🔄 Starting system reset...');
    
    // Clear all emergencies
    activeEmergencies.clear();
    
    // Clear emergency queue
    emergencyQueue = new PriorityQueue();
    
    // Reset all regular patrols to home stations
    for (let patrol of patrolManager.patrols.values()) {
        const homeNode = cityGraph.getNode(patrol.homeStation);
        
        patrol.state = PATROL_STATE.IDLE;
        patrol.currentLocation = patrol.homeStation;
        patrol.assignedEmergency = null;
        patrol.path = [];
        patrol.pathProgress = 0;
        patrol.eta = 0;
        patrol.lastStateChange = Date.now();
        
        console.log(`  ✓ ${patrol.id} reset to ${patrol.homeStation} (IDLE)`);
    }
    
    // Remove all emergency patrols
    const emergencyCount = patrolManager.emergencyPatrols.size;
    patrolManager.emergencyPatrols.clear();
    if (emergencyCount > 0) {
        console.log(`  ✓ Removed ${emergencyCount} emergency patrol(s)`);
    }
    
    console.log('✓ System reset complete - all clear');
    
    // Broadcast reset state to all clients
    broadcastSystemState();
}

// Decay zone risk levels (gradual safety improvement over time)
setInterval(() => {
    zoneIntelligence.decayRiskLevels(0.98);
}, TIMING.RISK_DECAY_INTERVAL * 1000);

// ==================================================
// HTTP ROUTES
// ==================================================

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Emergency Dispatch System</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    h1 { color: #333; }
                    .panel {
                        background: white;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    a {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 10px 10px 10px 0;
                    }
                    a:hover { background: #0056b3; }
                    .status { color: #28a745; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>🚨 Women Safety Emergency Dispatch System</h1>
                <div class="panel">
                    <h2>System Status: <span class="status">ONLINE</span></h2>
                    <p><strong>City:</strong> SafeCity Metropolitan Area</p>
                    <p><strong>Active Zones:</strong> ${CityMapData.nodes.length}</p>
                    <p><strong>Patrol Units:</strong> ${patrolManager.patrols.size} fixed + ${patrolManager.emergencyPatrols.size} emergency</p>
                </div>
                <div class="panel">
                    <h3>Access Points</h3>
                    <a href="/desktop/index.html">🖥️ Desktop Control Panel (Admin)</a>
                    <a href="/mobile/index.html">📱 Mobile Incident Generator</a>
                </div>
                <div class="panel">
                    <h3>System Architecture</h3>
                    <ul>
                        <li><strong>Hash Table:</strong> Zone intelligence O(1) lookup</li>
                        <li><strong>Priority Queue:</strong> Emergency ordering (Max Heap)</li>
                        <li><strong>Graph:</strong> City network representation</li>
                        <li><strong>Dijkstra:</strong> Safest path calculation</li>
                    </ul>
                </div>
            </body>
        </html>
    `);
});

// ==================================================
// START SERVER
// ==================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('\n===========================================');
    console.log('🚨 Emergency Dispatch System ONLINE');
    console.log('===========================================');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Desktop UI: http://localhost:${PORT}/desktop/index.html`);
    console.log(`Mobile UI:  http://localhost:${PORT}/mobile/index.html`);
    console.log('===========================================\n');
});
