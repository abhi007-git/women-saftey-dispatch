# 🚨 Women Safety Emergency Dispatch System - Complete Overview

## 📱 Mobile Interface (Citizen Reporter)

### What Users Can Do
**Tap anywhere on the map** to report an emergency

**4 Emergency Types Available:**
1. **HARASSMENT** - Verbal abuse, catcalling, unwanted following
2. **ASSAULT** - Physical attack or threat (High Priority - 50 pts)
3. **STALKING** - Being followed persistently
4. **KIDNAP** - Abduction attempt (High Priority - 50 pts)

### What Happens After Reporting
1. Emergency appears on **both mobile and desktop maps**
2. Woman icon (🆘) shows at clicked location with distress type label
3. System automatically:
   - Calculates priority based on severity + zone risk + wait time
   - Finds nearest available patrol
   - Computes safest route (avoiding danger zones)
   - Dispatches patrol immediately
4. Reporter sees:
   - Patrol moving toward them (blue icon 🚓)
   - Orange dotted line showing patrol's route
   - Real-time progress as patrol approaches
5. When patrol arrives → Woman saved → Emergency disappears

### Mobile Output Displayed
- **Active emergencies**: Red woman icons with labels
- **Patrol movement**: Blue patrol icons moving along paths
- **Routes**: Orange dotted lines from patrol to emergency
- **Map nodes**: Green circles (safe) or Red circles (danger zones)

---

## 🖥️ Desktop Interface (Admin Control Panel)

### Interactive Map (Center Panel)
**What's Shown:**
- **Nodes**: 37 city zones (green = safe, red = danger)
- **Edges**: Roads connecting zones (blue = safe, red = dangerous)
- **Patrols**: 🚓 icons (idle at stations or moving to emergencies)
- **Emergencies**: 🆘 icons with distress type labels (ASSAULT, STALKING, etc.)
- **Routes**: Orange dotted lines showing patrol paths

**What You Can Do:**
- **Click any node** → Toggle danger zone (increases travel time 3x)
- **Zoom in/out** with buttons
- **Pan** by dragging
- **Reset view** to default

---

## 📊 6 Data Panels (All Clickable for Details)

### 1. Priority Queue (Max-Heap) Panel
**Shows:**
- Current emergencies in queue with priority scores
- Queue position (#1, #2, etc.)

**Click to view modal:**
- Full priority breakdown for each emergency:
  - Severity score (Assault/Kidnap: 50 pts, Others: 30 pts)
  - Time waiting score (2 pts/second, max 30 pts)
  - Zone risk multiplier (risk × 5 pts)
  - Availability bonus (10 pts if patrol available)
- Last 10 resolved emergencies with their priority calculations

---

### 2. Active Emergencies Panel
**Shows:**
- All active emergencies with status (PENDING → ASSIGNED → RESPONDING → ENGAGED)
- Location and distress type
- Assigned patrol and ETA

**Click to view modal:**
- Detailed emergency information
- Wait times
- Priority calculations
- Assigned patrol details (unit name, type, route)

---

### 3. Zone Intelligence (Hash Table) Panel
**Shows:**
- High-risk zones with risk levels (0-10 scale)
- Past incident counts per zone
- Dominant distress type in each zone

**Click to view modal:**
- Hash table internals (load factor, collision chains, bucket utilization)
- All zones sorted by risk level
- Educational display of hash table structure
- Collision handling demonstration

---

### 4. Patrol Unit Status Panel
**Shows:**
- Total patrols and availability count
- Each patrol's status (IDLE, RESPONDING, ENGAGED, RETURNING)
- Current locations

**Click to view modal:**
- Patrols grouped by status (Available / On Duty)
- Active routes with waypoint progress
- Current assignments
- Real-time location tracking

---

### 5. System Metrics Panel
**Shows:**
- Queue length
- Active emergency count
- Patrol availability (idle vs active)
- Average response time
- Total emergencies resolved

**Click to view modal:**
- Performance statistics
- Emergency type breakdown (bar charts)
- Patrol efficiency metrics
- Historical trends

---

### 6. Dijkstra Path Analysis Panel
**Shows:**
- Current pathfinding operations

**Click to view modal:**
- Last 10 route calculations
- Nodes visited per route
- Danger zones avoided
- Path optimization details (why that route was chosen)
- Algorithm efficiency metrics

---

## 🏗️ Data Structures Implementation

### 1. Priority Queue (Max-Heap)
**Purpose:** Orders emergencies by urgency, not arrival time

**How It Works:**
- Parent always higher priority than children
- Highest priority at root (array index 0)
- Insert: O(log n) - bubble up
- Extract max: O(log n) - bubble down

**Priority Formula:**
```
priority = severityScore + timeScore + zoneRisk + availabilityBonus
```

**Why This DS?**
- Ensures most critical emergency handled first
- Fast insertion and extraction
- Self-balancing

**Real Example:**
```
Kidnap in danger zone + 10s wait = 50 + 20 + 15 + 10 = 95 priority
Stalking in safe zone + 2s wait = 30 + 4 + 5 + 10 = 49 priority
→ Kidnap handled first
```

---

### 2. Hash Table (Chaining)
**Purpose:** Store zone intelligence - O(1) lookup by zone ID

**How It Works:**
- Hash function: `hash(zoneId) = ASCII sum % tableSize`
- Collision handling: Chaining (linked lists)
- Table size: 50 buckets
- Stores: risk level, past incidents, dominant distress type

**Why This DS?**
- Instant zone risk lookup during priority calculation
- Efficient updates after each incident
- Handles collisions gracefully

**Real Example:**
```
Zone_12 → hash("Zone_12") = 37
Bucket 37: Zone_12 → Zone_34 → Zone_56 (collision chain)
Lookup: O(1) average, O(k) worst case (k = chain length)
```

---

### 3. Graph (Adjacency List)
**Purpose:** Represent city network - nodes (zones) and edges (roads)

**How It Works:**
- Each node stores list of neighbors with edge weights
- Edge weight = base travel time (danger zones multiply by 3)
- Weighted, undirected graph
- 37 nodes, ~60 edges

**Why This DS?**
- Natural representation of city map
- Efficient neighbor lookup for pathfinding
- Easy to modify edge weights (danger zones)

**Real Example:**
```
Zone_5 neighbors:
- Zone_12 (weight: 2s)
- Zone_18 (weight: 3s)
- Zone_23 (weight: 6s - danger zone, 2s × 3)
```

---

### 4. Dijkstra's Algorithm
**Purpose:** Find safest (not shortest) path from patrol to emergency

**How It Works:**
- Min-heap priority queue for nodes to visit
- Tracks shortest distance to each node
- Backtracks to reconstruct path
- Time: O((V+E) log V) where V=nodes, E=edges

**Why This Algorithm?**
- Finds optimal path considering danger zones
- Guarantees shortest weighted path
- Efficient for sparse graphs

**Real Example:**
```
Station_A to Zone_45:
Direct path through danger zone: 8s (2+6)
Dijkstra's path avoiding danger: 7s (2+2+3)
→ Saves 1s AND avoids danger
```

---

## 💾 Data Persistence

### What's Saved
1. **Resolution History** (last 50):
   - Emergency details, priority breakdown
   - Patrol info, response time
   - Dijkstra path analysis
   - Zone intelligence snapshot

2. **Zone Intelligence**:
   - Risk levels per zone
   - Incident counts and types
   - Hash table state

### Where & When
- **Location**: `server/data/` directory
- **Files**: `resolution_history.json`, `zone_intelligence.json`
- **Auto-save**: Every 30 seconds + on emergency resolution + on server shutdown
- **Load**: Automatically on server startup

### Reset System
**🔄 RESET SYSTEM button** clears:
- All active emergencies
- Resolution history
- Zone intelligence
- JSON files deleted
- Patrols return to stations

---

## 🛠️ Technologies Used

### Backend
- **Node.js v18+** - Server runtime
- **Express 4.18.2** - Web server framework
- **WebSocket (ws 8.14.2)** - Real-time bidirectional communication
- **File System (fs)** - JSON file persistence

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients, animations
- **JavaScript (ES6+)** - Client logic
- **SVG** - Interactive map rendering

### Data Structures (Custom Implementation)
- **PriorityQueue.js** - Max-heap for emergency ordering
- **HashTable.js** - Chaining for zone intelligence
- **Graph.js** - Adjacency list for city network
- **Dijkstra.js** - Shortest path algorithm

### Communication Protocol
- **WebSocket messages**:
  - `EMERGENCY` - Report from mobile
  - `STATE_UPDATE` - Broadcast system state (20 FPS)
  - `RESET_SYSTEM` - Clear all data
  - `TOGGLE_DANGER` - Change zone status
  - `PING/PONG` - Heartbeat (30s intervals)

---

## ⚡ System Flow

```
Mobile User Taps Map
        ↓
Emergency Created with Location
        ↓
Hash Table Lookup → Get Zone Risk
        ↓
Priority Calculated → Insert into Max-Heap
        ↓
Extract Highest Priority Emergency
        ↓
Graph + Dijkstra → Find Safest Path
        ↓
Patrol Dispatched → Moves along path (0.3s per node)
        ↓
Patrol Arrives → Emergency Resolved (1 second)
        ↓
Update Zone Intelligence → Save to JSON
        ↓
History Stored → Available in Modal Panels
```

---

## 🎯 Key Features

1. **Priority-Based Dispatch** - Critical emergencies handled first, not FIFO
2. **Intelligent Routing** - Avoids danger zones automatically (3x penalty)
3. **Real-Time Updates** - 20 FPS state broadcasting via WebSocket
4. **Persistent History** - Data survives server restarts
5. **Educational Modals** - Click panels to see DSA internals
6. **Danger Zone Control** - Admins can toggle zones on map
7. **Heartbeat System** - Auto-reconnect on connection loss
8. **Minimum Response Time** - 1 second travel minimum (realistic)

---

## 📏 Complexity Analysis

| Operation | Data Structure | Time Complexity |
|-----------|---------------|-----------------|
| Insert emergency | Max-Heap | O(log n) |
| Get highest priority | Max-Heap | O(log n) |
| Zone risk lookup | Hash Table | O(1) average |
| Update zone data | Hash Table | O(1) average |
| Find neighbors | Graph | O(1) |
| Find safest path | Dijkstra | O((V+E) log V) |
| State broadcast | WebSocket | O(c) clients |

---

## 🎓 Educational Value

This project demonstrates:
- **Real-world DSA application** (not just theory)
- **Algorithm trade-offs** (safety vs speed)
- **System integration** (4 DSs working together)
- **Full-stack development** (frontend + backend + WebSocket)
- **Production concepts** (persistence, heartbeat, error handling)

---

*Last Updated: January 8, 2026*
*Project: Women Safety Emergency Dispatch System*
*Repository: https://github.com/abhi007-git/women-saftey-dispatch*
