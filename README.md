# 🚨 Women Safety Emergency Dispatch Simulation System

A complete, city-level emergency dispatch simulator demonstrating real-world application of Data Structures and Algorithms. Built for college experiential learning with clear, visible DSA implementation.

---

## 🎯 PROJECT OVERVIEW

This is **NOT** a toy demo. This is a fully functional emergency dispatch simulation that demonstrates:

- **Hash Table** - O(1) zone intelligence lookup
- **Priority Queue** (Max Heap) - Emergency ordering by severity + time + risk
- **Graph** - City road network representation
- **Dijkstra's Algorithm** - Safest path routing (modified for danger zones)

### Key Features

✅ **Real-time WebSocket communication**  
✅ **Desktop Control Panel** with live DSA visualization  
✅ **Mobile Incident Generator** for multi-user simulation  
✅ **Dynamic danger zones** with automatic path recalculation  
✅ **Intelligent patrol dispatch** with state management  
✅ **Realistic timing** (minutes, not milliseconds)  
✅ **Emergency patrol deployment** under system overload  

---

## 📁 PROJECT STRUCTURE

```
emergency-dispatch-system/
├── server/
│   ├── server.js                 # Main server with Express + WebSocket
│   └── dsa/
│       ├── HashTable.js          # Zone Intelligence Hash Table
│       ├── PriorityQueue.js      # Emergency Priority Queue (Max Heap)
│       ├── Graph.js              # City Road Network Graph
│       └── Dijkstra.js           # Safest Path Algorithm
├── desktop/
│   ├── index.html                # Control Panel UI
│   ├── styles.css                # Control Panel Styles
│   └── script.js                 # Control Panel Logic
├── mobile/
│   ├── index.html                # Mobile Incident Generator UI
│   ├── styles.css                # Mobile Styles
│   └── script.js                 # Mobile Logic
├── shared/
│   └── cityMapData.js            # City Map Configuration
├── package.json
└── README.md
```

---

## 🚀 INSTALLATION & SETUP

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge)

### Step 1: Install Dependencies

```bash
cd emergency-dispatch-system
npm install
```

### Step 2: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Step 3: Access the System

Open your browser and navigate to:

- **Home Page**: http://localhost:3000
- **Desktop Control Panel**: http://localhost:3000/desktop/index.html
- **Mobile Incident Generator**: http://localhost:3000/mobile/index.html

**IMPORTANT**: Open Desktop Control Panel first to observe the system, then use Mobile to send alerts.

---

## 🎮 HOW TO USE

### Desktop Control Panel (Admin View)

1. **Live Map**: Shows real-time city state
   - Blue circles = Patrol units
   - Red circles = Active emergencies
   - Highlighted zones = Danger areas

2. **Click Nodes**: Toggle danger zones on/off
   - Watch patrol routes change in real-time
   - Danger zones increase travel time by 3x

3. **Priority Queue Panel**: Shows emergency ordering
   - Highest priority at top
   - Priority = severity + time + zone risk
   - Updates every 5 seconds

4. **Zone Intelligence Panel**: Hash table visualization
   - Risk levels for each zone
   - Historical incident data
   - O(1) lookup during emergencies

5. **Patrol Status**: Real-time unit tracking
   - IDLE / EN_ROUTE / ENGAGED states
   - ETA countdown
   - Emergency unit deployment

### Mobile Incident Generator (User Simulation)

1. **Tap Map**: Select emergency location
2. **Choose Distress Type**: Harassment / Stalking / Assault / Kidnapping
3. **Send Alert**: Click the red button
4. **Watch Desktop**: See dispatch decision in real-time

**Quick Test Scenarios**:
- Random alerts for testing
- "Send 3 Alerts" triggers emergency patrol deployment

---

## 🧠 DATA STRUCTURES EXPLAINED

### 1. Hash Table (Zone Intelligence)

**File**: `server/dsa/HashTable.js`

**WHY**: During emergencies, we need instant access to zone data. Linear search would be too slow.

**WHAT**: Each city zone stores:
- `risk_level` (0-10)
- `past_incident_count`
- `dominant_distress_type`
- `average_response_time`

**Time Complexity**: O(1) average for get/set operations

**How to Verify**:
- Open Desktop UI → Zone Intelligence Panel
- Send alerts to same zone multiple times
- Watch risk level increase
- See hash table update in real-time

---

### 2. Priority Queue (Emergency Ordering)

**File**: `server/dsa/PriorityQueue.js`

**WHY**: Medical triage principle - most critical emergencies must be handled first.

**WHAT**: Max-heap where priority is calculated by:
```
Priority = (Distress Severity) + 
           (Time Elapsed × 0.5) + 
           (Zone Risk × 2) + 
           (Patrol Availability Penalty)
```

**Time Complexity**:
- Insert: O(log n)
- Extract Max: O(log n)
- Recalculate All: O(n log n)

**How to Verify**:
- Send 3 harassment alerts (low priority)
- Send 1 kidnapping alert (high priority)
- Check Desktop → Priority Queue Panel
- Kidnapping should be at top despite being sent last

---

### 3. Graph (City Road Network)

**File**: `server/dsa/Graph.js`

**WHY**: City is not a grid - it's an interconnected network.

**WHAT**: Adjacency list representation:
- 25 nodes (intersections)
- ~45 edges (roads)
- Edge weights = travel time in seconds

**Storage**: Map-based adjacency list for O(1) neighbor lookup

**How to Verify**:
- Desktop UI shows complete graph visualization
- Edges connect all city zones
- Danger zones show red/thicker edges

---

### 4. Dijkstra's Algorithm (Safest Path)

**File**: `server/dsa/Dijkstra.js`

**WHY**: We compute SAFEST path, not shortest. Danger zones should be avoided even if longer.

**WHAT**: Modified Dijkstra where:
- Normal edge weight = base travel time
- Danger zone edge = base travel time × 3

**Time Complexity**: O((V + E) log V) with priority queue

**How to Verify**:
1. Send alert from South Port (S1)
2. Click node to toggle danger zone on direct path
3. Watch patrol route change to avoid danger
4. Desktop shows both rejected path vs chosen path

---

## 🔬 TESTING THE SYSTEM

### Test Case 1: Priority Queue Ordering

1. Send 3 "Harassment" alerts (priority ~40-50)
2. Send 1 "Kidnapping" alert (priority ~100+)
3. Verify kidnapping is handled first on Desktop

**Expected**: Kidnapping jumps to top of queue

---

### Test Case 2: Hash Table Zone Learning

1. Send 5 alerts from same zone (e.g., "West Station")
2. Open Desktop → Zone Intelligence Panel
3. Check that zone's incident count increases
4. Risk level should rise from 5 → 7+

**Expected**: Zone "remembers" incidents, risk increases

---

### Test Case 3: Dijkstra Safest Path

1. Send alert to South zone (S3)
2. On Desktop, click "C1" to make it danger zone
3. Watch patrol route avoid C1 even if longer
4. Path should go around, not through danger

**Expected**: Route changes, total time increases but avoids danger

---

### Test Case 4: Emergency Patrol Deployment

1. Send 5+ alerts quickly (use "Send 3 Alerts" button twice)
2. Regular patrols will be overwhelmed
3. System should auto-deploy emergency unit

**Expected**: Orange patrol marker appears (emergency unit)

---

### Test Case 5: Risk Decay

1. Send alert to zone, observe risk level
2. Wait 60+ seconds
3. Risk level should slowly decrease

**Expected**: Risk decays by 2% per minute if no new incidents

---

## 🎓 EVALUATION POINTS

### For Evaluators/Teachers

**✅ Hash Table Implementation**
- Custom hash function (polynomial rolling)
- Collision handling via chaining
- O(1) lookup verified in code comments

**✅ Priority Queue Implementation**
- Max-heap from scratch (no library)
- Heapify up/down operations
- Dynamic priority recalculation every 5 seconds

**✅ Graph Implementation**
- Adjacency list (not matrix) for efficiency
- Weighted edges
- Dynamic weight updates for danger zones

**✅ Dijkstra Implementation**
- Classic algorithm with priority queue
- Modified for "safest" not "shortest" path
- Comparison with rejected (shortest) path

**✅ Real-World Application**
- Not abstract/academic
- Solves actual emergency dispatch problem
- Realistic timing (seconds/minutes, not milliseconds)

**✅ System Integration**
- All DSA components work together
- Client-server architecture
- Real-time visualization

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     WebSocket Server                        │
│                    (server/server.js)                       │
└───────────┬────────────────────────────────┬────────────────┘
            │                                │
            ├─ Hash Table ─────────────────┐ │
            │  (Zone Intelligence)         │ │
            │  - O(1) zone data lookup     │ │
            │                              │ │
            ├─ Priority Queue ─────────────┤ │
            │  (Emergency Ordering)        │ │
            │  - Max heap                  │ │
            │  - Auto-reorder every 5s     │ │
            │                              │ │
            ├─ Graph ──────────────────────┤ │
            │  (City Network)              │ │
            │  - 25 nodes, 45 edges        │ │
            │  - Dynamic danger zones      │ │
            │                              │ │
            └─ Dijkstra ───────────────────┘ │
               (Safest Path)                 │
               - Modified for safety         │
                                            │
           ┌────────────────┴────────────────┴──────┐
           │                                        │
  ┌────────▼─────────┐                   ┌─────────▼─────────┐
  │  Desktop UI      │                   │   Mobile UI       │
  │  (Admin Panel)   │                   │  (Incident Gen)   │
  │                  │                   │                   │
  │  - Live map      │                   │  - Tap to alert   │
  │  - DSA panels    │                   │  - Multi-user     │
  │  - Patrol status │                   │  - Quick tests    │
  └──────────────────┘                   └───────────────────┘
```

---

## 🐛 TROUBLESHOOTING

### Server won't start

**Error**: `Cannot find module 'express'`  
**Solution**: Run `npm install`

**Error**: `Port 3000 already in use`  
**Solution**: Change port in `server/server.js` line 540

---

### Desktop UI not connecting

**Check**: Browser console for WebSocket errors  
**Solution**: Ensure server is running, refresh page

---

### Mobile map not showing

**Check**: Did you open Desktop first?  
**Solution**: Desktop must load first to initialize system state

---

## 📝 CODE DOCUMENTATION

Every major function has comments explaining:

1. **WHY** this data structure is used
2. **WHAT** problem it solves
3. **HOW** it works (algorithm steps)
4. **Time/Space complexity**

**Example from `HashTable.js`**:
```javascript
/**
 * HASH TABLE - Zone Intelligence Memory
 * 
 * WHY: O(1) lookup time is critical during emergencies
 * WHAT: Stores historical data for each city zone
 * 
 * Each zone tracks:
 * - risk_level: Current danger assessment (0-10)
 * - past_incident_count: Historical incident frequency
 * ...
 */
```

---

## 🎯 PROJECT GOALS ACHIEVED

✅ **Complete System**: Not just code snippets  
✅ **Real-time Operation**: WebSocket communication  
✅ **Visual Clarity**: All DSA visible on screen  
✅ **Practical Application**: Solves real problem  
✅ **Realistic Simulation**: Human-scale timing  
✅ **Educational Value**: Clear DSA explanations  
✅ **Evaluator-Friendly**: Easy to test and verify  

---

## 🔗 TECHNOLOGIES USED

- **Backend**: Node.js + Express
- **Real-time**: WebSocket (ws library)
- **Frontend**: Vanilla HTML/CSS/JavaScript (NO frameworks)
- **Graphics**: SVG for map rendering
- **Architecture**: Client-Server with DSA engine

---

## 👨‍💻 AUTHOR NOTES

This project was built to demonstrate that Data Structures and Algorithms are not abstract concepts - they solve real problems. Every algorithm here has a clear purpose:

- **Hash Table**: Fast zone intelligence during time-critical emergencies
- **Priority Queue**: Fair emergency ordering (like hospital triage)
- **Graph**: Realistic city modeling
- **Dijkstra**: Safety-first routing

The system is designed to withstand hostile evaluation. Every decision is justified and visible.

---

## 📄 LICENSE

MIT License - Free for educational use

---

## 🆘 SUPPORT

For questions or issues:
1. Check console logs (browser DevTools)
2. Verify all files are in correct folders
3. Ensure Node.js version >= 14
4. Check that port 3000 is available

---

**Built with ❤️ for Women Safety and DSA Education**

---

## 🎬 DEMONSTRATION SCRIPT

### For Live Presentation:

1. **Start Server**: `npm start`
2. **Open Desktop**: Show system dashboard
3. **Open Mobile**: On phone/second browser
4. **Scenario 1**: Send single alert, show dispatch
5. **Scenario 2**: Toggle danger zone, show rerouting
6. **Scenario 3**: Overload system, show emergency patrol
7. **Explain DSA**: Point to each panel, explain algorithm
8. **Q&A**: Use system to answer questions live

**Presentation Time**: 10-15 minutes recommended

---

**END OF DOCUMENTATION**
