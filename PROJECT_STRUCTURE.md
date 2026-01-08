# 🏗️ PROJECT STRUCTURE & FUNCTIONALITY GUIDE

## Overview
**Women Safety Emergency Dispatch Simulation System**  
A real-time emergency response system demonstrating Data Structures & Algorithms with dual interfaces: Desktop (Admin Control) and Mobile (Alert Generator).

**✨ PROFESSIONAL GRADE** - Refactored with system-wide constants, state enums, and comprehensive DSA justifications. Every design decision is defensible and explainable.

---

## 📦 PROJECT COMPONENTS

### 1. **SERVER (Backend)**
**Location:** `server/` folder  
**Technology:** Node.js + Express + WebSocket  
**Port:** 3000

#### System Constants (No Magic Numbers)
```javascript
// Emergency States - SINGLE SOURCE OF TRUTH
EMERGENCY_STATE = { PENDING, ASSIGNED, RESPONDING, ENGAGED, RESOLVED }

// Patrol States - SINGLE SOURCE OF TRUTH  
PATROL_STATE = { IDLE, EN_ROUTE, ENGAGED, RETURNING }

// Timing Constants (all in seconds)
TIMING = {
    PATROL_MOVEMENT_SPEED: 10,     // Scaled for demo
    RESOLUTION_TIME: 5,            // Time at scene
    RETURN_TIME: 2,                // Return to station
    PRIORITY_RECALC_INTERVAL: 3,   // Dynamic escalation
    RISK_DECAY_INTERVAL: 60,       // Safety improvement
    BROADCAST_INTERVAL: 1          // Real-time updates
}

// Deployment Thresholds
DEPLOYMENT = {
    EMERGENCY_UNIT_PRIORITY_THRESHOLD: 2,
    EMERGENCY_UNIT_QUEUE_THRESHOLD: 5
}
```

#### Files:
- **`server.js`** (716 lines) - Main dispatch engine with state machines
- **`dsa/HashTable.js`** (221 lines) - O(1) zone intelligence lookup
- **`dsa/PriorityQueue.js`** (304 lines) - Max-heap with transparent priority calculation
- **`dsa/Graph.js`** (225 lines) - City network with dynamic danger zone weights
- **`dsa/Dijkstra.js`** (300 lines) - Risk-aware safest path finder

#### Core Responsibilities:
- Manages 10 patrol units with deterministic state machine
- Processes emergency alerts using priority queue with breakdown
- Calculates safest paths (not shortest) using modified Dijkstra
- Broadcasts real-time state updates to all clients via WebSocket
- Handles danger zone toggles with dynamic weight recalculation

---

### 2. **DESKTOP UI (Admin Control Panel)**
**Location:** `desktop/` folder  
**Technology:** Vanilla HTML + CSS + JavaScript (NO frameworks)  
**Purpose:** Command & Control Dashboard for monitoring and managing system

#### Files:
- **`index.html`** (167 lines) - Layout structure with 6 main panels
- **`styles.css`** (717 lines) - Dark theme with enhanced visibility
- **`script.js`** (667 lines) - Real-time visualization and control logic

#### What's on Desktop:
1. **Live City Map** (1400x1100px SVG)
   - 100 nodes in 10×10 grid
   - 305 edges (roads/routes)
   - Color-coded danger zones (red)
   - Safe zones (blue)
   - Real-time patrol positions
   - Emergency alert markers

2. **DSA Visualization Panels**
   - **Hash Table Stats:** Inserts, deletes, load factor
   - **Priority Queue:** Visual max-heap with emergency ordering
   - **Graph Info:** Node count, edge count, danger zones
   - **Dijkstra Explanation:** How shortest path is calculated

3. **Patrol Status Panel**
   - 10 patrol units with current state
   - Location information
   - Assignment status
   - Target emergency details

4. **Active Emergencies List**
   - All current alerts with priority
   - Assigned patrol information
   - Status tracking (PENDING/ASSIGNED/RESPONDING/RESOLVED)

5. **System Status Header**
   - Connection status (green = connected)
   - Real-time timestamp
   - System health indicators

---

## 🖥️ DESKTOP SIDE - HOW IT WORKS

### **Initialization**
```javascript
1. Connect to WebSocket server (ws://localhost:3000)
2. Receive INITIAL_STATE message with full system data
3. Store in systemState global variable
4. Render all panels with initial data
```

### **Real-Time Updates (Every 1 Second)**
```javascript
1. Server broadcasts STATE_UPDATE via WebSocket
2. handleServerMessage() receives update
3. Update systemState with new data
4. Call renderAllPanels() to refresh UI
```

### **Key Desktop Functions**

#### **renderCityMap()**
- Draws 100-node city grid using SVG
- Colors nodes: Blue (safe), Red (danger)
- Shows edges connecting nodes
- Displays pulsing danger zone indicators
- Renders patrol positions as colored circles
- Shows emergency markers as red alerts

#### **renderPatrolPaths()**
- Draws blue SVG path lines showing patrol routes
- Visualizes Dijkstra shortest path algorithm
- Updates every second as patrols move
- Shows which patrol is going where

#### **renderPriorityQueue()**
- Visual max-heap representation
- Shows emergency alerts ordered by priority
- Higher priority = higher position in tree
- Updates as alerts are added/resolved

#### **renderHashTable()**
- Displays hash table statistics
- Shows insert/delete operation counts
- Displays load factor
- Demonstrates collision handling

#### **toggleDangerZone()**
```javascript
User clicks a node on map
   ↓
Send TOGGLE_DANGER_ZONE message to server
   ↓
Server updates graph weights
   ↓
Server broadcasts to all clients
   ↓
Desktop + Mobile update their maps
```

### **Desktop Features**
✅ **Monitor all emergencies** in real-time  
✅ **Watch patrol movements** with path visualization  
✅ **Toggle danger zones** by clicking map nodes  
✅ **See DSA operations** live (hash table, priority queue, Dijkstra)  
✅ **Track system statistics** (response times, patrol efficiency)  
✅ **Educational display** - all algorithms visible on screen

---

## 📱 MOBILE SIDE - HOW IT WORKS

### **MOBILE UI (Alert Generator)**
**Location:** `mobile/` folder  
**Technology:** Vanilla HTML + CSS + JavaScript (NO frameworks)  
**Purpose:** Multi-user incident simulator for generating emergency alerts

#### Files:
- **`index.html`** (155 lines) - Mobile-friendly form layout
- **`styles.css`** (553 lines) - Large touch targets, readable fonts
- **`script.js`** (552 lines) - Alert sending and status tracking

#### What's on Mobile:
1. **Interactive City Map** (Same 1400x1100px SVG)
   - Clickable nodes to select emergency location
   - Visual feedback on selection (yellow highlight)
   - Live danger zone updates from desktop
   - Real-time map state synchronized

2. **Emergency Alert Form**
   - Location selector (click map or use dropdown)
   - Distress type dropdown:
     - Assault
     - Harassment
     - Suspicious Activity
     - Medical Emergency
     - Theft
     - Other
   - Description text area
   - Large "Send Emergency Alert" button

3. **Alert Status Panel**
   - List of all sent alerts from this mobile
   - Real-time status updates:
     - 🟡 PENDING - Alert received by server
     - 🟠 ASSIGNED - Patrol assigned
     - 🔵 RESPONDING - Patrol en route
     - 🟢 RESOLVED - Emergency handled
   - Assigned patrol information
   - Timestamps

4. **Random Alert Generator** (Testing Feature)
   - Auto-sends random alerts every 10 seconds
   - For demonstration/load testing
   - Can be toggled on/off

5. **Connection Status**
   - Shows if connected to server
   - Auto-reconnect on disconnection

---

### **Initialization**
```javascript
1. Connect to WebSocket server (ws://localhost:3000)
2. Receive INITIAL_STATE with map data
3. Store in mapData global variable
4. Render interactive map
5. Initialize sentAlerts array (empty)
```

### **Real-Time Updates**
```javascript
1. Server broadcasts STATE_UPDATE (every 1 second)
2. handleServerMessage() receives update
3. Update mapData with new danger zones
4. Call updateAlertStatuses() to sync sent alerts
5. Call renderMap() to update visual
```

### **Key Mobile Functions**

#### **renderMap()**
- Draws same city map as desktop
- Makes nodes clickable for alert sending
- Highlights selected location in yellow
- Shows danger zones in red (synced with desktop)
- Updates edges based on danger zones

#### **sendEmergencyAlert()**
```javascript
User fills form and clicks Send
   ↓
Validate inputs:
  - Location selected? ✓
  - Distress type chosen? ✓
  - WebSocket connected? ✓
   ↓
Create alert object with:
  - nodeId (location)
  - distress_type
  - description
   ↓
Send NEW_EMERGENCY message to server
   ↓
Add to local sentAlerts array with LOCAL_ID
   ↓
Show success toast message
   ↓
Clear form
```

#### **updateAlertStatuses()**
- Receives activeEmergencies from server
- Matches with locally sent alerts
- Matching strategy:
  1. Try matching by alert ID
  2. Fallback: Match by timestamp (5-second window)
- Updates alert status (PENDING → ASSIGNED → RESPONDING → RESOLVED)
- Updates assignedPatrol information
- Updates UI to show current status

#### **handleMapClick()**
- User clicks a node on the map
- Highlights selected node in yellow
- Populates location dropdown
- Ready to send alert from that location

### **Mobile Features**
✅ **Send emergency alerts** from any location  
✅ **Select distress type** from dropdown  
✅ **Track alert status** in real-time  
✅ **See assigned patrol** information  
✅ **Live map updates** when desktop toggles danger zones  
✅ **Multiple users** can send alerts simultaneously  
✅ **Auto-reconnect** if connection lost  
✅ **User-friendly validation** with error messages

---

## 🔄 INTEGRATION BETWEEN DESKTOP & MOBILE

### **Mobile → Desktop Flow**
```
1. User on Mobile clicks location N42
2. Selects "Assault" and adds description
3. Clicks "Send Emergency Alert"
4. Mobile sends NEW_EMERGENCY via WebSocket
5. Server receives, adds to priority queue
6. Server assigns nearest idle patrol
7. Server calculates Dijkstra shortest path
8. Server broadcasts STATE_UPDATE to all clients
9. Desktop receives update (< 100ms)
10. Desktop shows:
    - Red emergency marker at N42
    - Patrol moving with blue path line
    - Updated priority queue
    - Emergency in active list
11. Mobile receives confirmation
12. Mobile updates alert status to ASSIGNED
```

**Synchronization Time:** **< 1 second** from send to display

---

### **Desktop → Mobile Flow**
```
1. Admin on Desktop clicks blue node N23
2. Node toggles to danger zone (turns red)
3. Desktop sends TOGGLE_DANGER_ZONE via WebSocket
4. Server receives, updates graph
5. Server increases edge weights for N23
6. Server broadcasts STATE_UPDATE to all clients
7. Mobile receives update (< 100ms)
8. Mobile calls renderMap()
9. Mobile shows:
    - Node N23 turns red
    - Connected edges turn red
    - Danger zone indicator added
10. Desktop also updates to confirm change
```

**Synchronization Time:** **< 500ms** from click to mobile update

---

### **Continuous Synchronization**
- **Every 1 second:** Server sends STATE_UPDATE to all clients
- **Updates include:**
  - Patrol positions (moving along paths)
  - Emergency statuses
  - Danger zone changes
  - Priority queue state
  - Hash table statistics

---

## 🎯 DATA FLOW DIAGRAM

```
MOBILE USER                 SERVER                    DESKTOP ADMIN
    │                         │                            │
    │  1. Click map N42       │                            │
    │  2. Select "Assault"    │                            │
    │  3. Send Alert          │                            │
    ├────────────────────────>│                            │
    │  NEW_EMERGENCY          │                            │
    │                         │ 4. Hash Table Insert       │
    │                         │ 5. Priority Queue Insert   │
    │                         │ 6. Assign Patrol P1        │
    │                         │ 7. Dijkstra Path Calc      │
    │                         │                            │
    │<────────────────────────┤────────────────────────────>
    │    STATE_UPDATE (broadcast to ALL)                   │
    │                         │                            │
    │ 8. Update status        │                      9. Show emergency
    │    PENDING→ASSIGNED     │                         Show patrol path
    │    Show patrol P1       │                         Update queue
    │                         │                            │
    │                         │                            │
    │                         │  10. Admin clicks node N15 │
    │                         │<───────────────────────────┤
    │                         │     TOGGLE_DANGER_ZONE     │
    │                         │                            │
    │                         │ 11. Update graph weights   │
    │                         │                            │
    │<────────────────────────┤────────────────────────────>
    │    STATE_UPDATE (broadcast to ALL)                   │
    │                         │                            │
    │ 12. Map updates         │                    13. Confirm change
    │     N15 turns red       │                        N15 shows red
    │                         │                            │
    │         [Every 1 second - Patrol Movement Updates]   │
    │<────────────────────────┤────────────────────────────>
    │    STATE_UPDATE (patrol positions, statuses)         │
    │                         │                            │
```

---

## 📊 WHAT HAPPENS WHERE

### **Server Responsibilities**
| Function | Description |
|----------|-------------|
| **Emergency Processing** | Receives alerts, adds to queue, assigns patrols |
| **Pathfinding** | Calculates shortest routes using Dijkstra |
| **State Management** | Maintains single source of truth for all data |
| **Broadcasting** | Sends updates to all connected clients |
| **Patrol Control** | Moves patrols along paths, updates states |
| **Risk Calculation** | Adjusts priorities based on danger zones |
| **Data Structures** | Manages hash table, priority queue, graph |

### **Desktop Responsibilities**
| Function | Description |
|----------|-------------|
| **Visualization** | Shows all system data in real-time |
| **DSA Display** | Makes algorithms visible (educational) |
| **Monitoring** | Tracks patrol efficiency, response times |
| **Control** | Toggle danger zones, manual resolutions |
| **Reporting** | Shows statistics and system health |
| **Path Display** | Visualizes Dijkstra shortest paths |

### **Mobile Responsibilities**
| Function | Description |
|----------|-------------|
| **Alert Generation** | Users send emergency alerts |
| **Location Selection** | Interactive map for choosing location |
| **Status Tracking** | Shows user's sent alerts and their status |
| **Multi-User** | Multiple mobiles can operate simultaneously |
| **Testing Mode** | Random alert generator for demonstrations |
| **User Feedback** | Validation errors, success messages, toasts |

---

## 🛠️ TECHNICAL STACK

### **Frontend (Both Desktop & Mobile)**
- Pure HTML5 (semantic structure)
- Pure CSS3 (no frameworks like Bootstrap)
- Pure JavaScript (no React, Vue, Angular)
- SVG for map rendering
- WebSocket API for real-time communication

### **Backend**
- Node.js v14+ runtime
- Express.js web server
- WebSocket (ws library) for bidirectional communication
- Custom DSA implementations (no external algorithm libraries)

### **Communication**
- WebSocket protocol (ws://)
- JSON message format
- Bidirectional real-time updates
- Auto-reconnection on disconnection

---

## 🎓 EDUCATIONAL FEATURES

### **Visible Data Structures**
1. **Hash Table Panel (Desktop)**
   - **WHY:** O(1) zone intelligence lookup during emergencies
   - **WHY NOT Array:** O(n) search too slow
   - **WHY NOT BST:** O(log n) unnecessary complexity
   - **Real-World:** Police track crime hotspots with similar structures
   - See insert/delete operations count
   - Load factor calculation visible
   - Polynomial rolling hash function explained

2. **Priority Queue Panel (Desktop)**
   - **WHY:** Medical triage principle - most critical first
   - **WHY NOT FIFO Queue:** Ignores severity
   - **WHY NOT Sorted Array:** O(n) insertion too slow
   - **Real-World:** Hospital ERs use identical triage logic
   - Visual max-heap tree structure
   - See how emergencies are ordered by priority
   - **Priority Breakdown Visible:**
     - Severity Score (distress type weight)
     - Time Waiting (escalation factor)
     - Zone Risk (location danger)
     - Availability Penalty (patrol distance)
   - Heapify operations visible

3. **Graph Display (Both)**
   - **WHY:** Cities are networks, not grids
   - **WHY NOT 2D Array:** Assumes all neighbors connected (unrealistic)
   - **WHY NOT Tree:** Cities have cycles
   - **Real-World:** Google Maps uses weighted graphs
   - 100 nodes, 305 edges clearly shown
   - Danger zones multiply edge weights by 3x
   - Dynamic updates visible

4. **Dijkstra Visualization (Desktop)**
   - **WHY:** Need SAFEST path, not shortest
   - **WHY NOT BFS:** Doesn't handle weighted edges
   - **WHY NOT A*:** Don't need heuristic
   - **Real-World:** Emergency GPS routing considers traffic
   - Blue path lines show calculated routes
   - **Risk-Aware:** Avoids danger zones even if longer
   - Explanation panel describes process

### **Priority Calculation Formula (Transparent)**
```
Priority = Severity + Time + Zone Risk + Availability

Where:
- Severity: Kidnap(100) > Assault(85) > Stalking(60) > Harassment(40) > Other(30)
- Time: +0.5 points per second waiting
- Zone Risk: Risk Level × 2
- Availability: +20 if no nearby patrols
```

Every emergency includes `priorityBreakdown` object showing exact calculation.

### **Live Algorithm Demonstration**
- Send alert → Watch Dijkstra calculate path
- Add danger zone → See graph weights update
- Multiple alerts → See priority queue reorder
- Patrol returns → See hash table update

---

## 🚀 USAGE SCENARIOS

### **Scenario 1: Single Emergency**
1. Open mobile → Click location → Send alert
2. Watch desktop → See emergency appear
3. See patrol assigned → Watch blue path
4. Patrol moves → Reaches location
5. Status changes → RESOLVED

### **Scenario 2: Multiple Emergencies**
1. Open 3 mobile tabs
2. Send alerts from all 3 simultaneously
3. Watch desktop priority queue order them
4. See patrols assigned by availability
5. Watch different paths calculated

### **Scenario 3: Danger Zone Impact**
1. Send alert from node N42
2. Note which patrol responds and path taken
3. On desktop, toggle N35 to danger zone (on the path)
4. Send another alert from N42
5. See different path calculated (avoiding danger)

### **Scenario 4: Multi-User Collaboration**
1. One person on desktop (admin)
2. Multiple people on mobile (users)
3. Admin monitors all alerts
4. Admin toggles danger zones based on activity
5. Users see map update in real-time
6. Users track their alert statuses

---

## 📁 FILE ORGANIZATION

```
DSA(el)/
├── server/
│   ├── server.js              (Main backend logic)
│   └── dsa/
│       ├── HashTable.js       (Custom hash table)
│       ├── PriorityQueue.js   (Max-heap)
│       ├── Graph.js           (Adjacency list)
│       └── Dijkstra.js        (Shortest path)
│
├── desktop/
│   ├── index.html             (Admin panel layout)
│   ├── styles.css             (Dark theme styling)
│   └── script.js              (Visualization logic)
│
├── mobile/
│   ├── index.html             (Alert form layout)
│   ├── styles.css             (Mobile-friendly styling)
│   └── script.js              (Alert sending logic)
│
├── shared/
│   └── cityMapData.js         (100-node city configuration)
│
├── package.json               (Dependencies)
├── README.md                  (Project overview)
├── QUICKSTART.md              (Setup guide)
├── TESTING.md                 (Test scenarios)
├── DEMO_CHECKLIST.md          (Presentation guide)
├── SYSTEM_ANALYSIS.md         (Technical analysis)
├── FIXES_APPLIED.md           (Integration fixes)
├── INTEGRATION_TEST.md        (Test protocol)
└── INTEGRATION_FLOW.md        (Flow diagrams)
```

---

## 🎯 KEY DIFFERENCES: DESKTOP vs MOBILE

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| **Purpose** | Monitor & Control | Generate Alerts |
| **User Role** | Administrator | Emergency Reporter |
| **Interaction** | View all data, toggle zones | Send alerts, track status |
| **Complexity** | High (6 panels) | Simple (form + map) |
| **DSA Visibility** | Full (all panels) | None (focused on UX) |
| **Controls** | Danger zone toggle | Location selection |
| **View Scope** | System-wide | User's own alerts |
| **Multi-User** | Single admin | Multiple simultaneous |
| **Updates** | All system data | Map + alert status |

---

## 💡 SUMMARY

**Desktop Side:**
- **What:** Admin control panel with full system visibility
- **How:** Receives real-time WebSocket updates, renders 6 panels, allows danger zone control
- **Purpose:** Monitor emergencies, watch DSA algorithms, manage system

**Mobile Side:**
- **What:** User-friendly alert generator
- **How:** Interactive map selection, form submission via WebSocket, status tracking
- **Purpose:** Send emergency alerts, track response, multi-user simulation

**Integration:**
- **Real-time WebSocket** keeps both synchronized < 1 second
- **Server is central authority** - broadcasts to all clients
- **Bidirectional updates** - mobile sends alerts, desktop toggles zones, both see changes instantly

**Result:** Complete emergency dispatch simulation with clear separation of concerns and perfect synchronization.
