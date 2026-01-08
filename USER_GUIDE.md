# 🚨 Women Safety Emergency Dispatch System - User Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Mobile App Guide](#mobile-app-guide)
4. [Desktop Control Panel Guide](#desktop-control-panel-guide)
5. [Understanding the Data](#understanding-the-data)
6. [Real-Time Integration](#real-time-integration)
7. [Data Structures Explained](#data-structures-explained)

---

## System Overview

This is a **real-time emergency dispatch simulation** that demonstrates how Data Structures and Algorithms (DSA) can save lives. The system consists of:

- **Mobile App** (Alert Generator) - Women in distress send emergency alerts
- **Desktop Control Panel** (Dispatch Center) - Monitors all emergencies and patrol units
- **Backend Server** - Intelligent dispatch system using DSA for optimal response

**Key DSA Used:**
- 📊 **Priority Queue (Max Heap)** - Orders emergencies by urgency
- 🗂️ **Hash Table** - O(1) zone intelligence lookup
- 🗺️ **Graph** - City network with danger zones
- 🛣️ **Dijkstra's Algorithm** - Finds safest routes avoiding danger zones

---

## Getting Started

### 1. Start the Server
```bash
npm start
```

### 2. Open Both UIs
- **Desktop Control Panel**: http://localhost:3000/desktop/index.html
- **Mobile App**: http://localhost:3000/mobile/index.html

**Tip:** Open them in **separate browser windows side-by-side** to see real-time synchronization!

---

## Mobile App Guide

### 📱 Mobile Interface Overview

The mobile app simulates a **woman's safety app** where she can send emergency alerts with one tap.

### Main Screen Elements:

#### 1. **Alert Type Buttons** (Top Section)
Six emergency scenario buttons:

| Button | Type | Description | Priority Impact |
|--------|------|-------------|-----------------|
| 🚶 **Stalking Alert** | stalking | Someone following you | High (85-95) |
| 🏃 **Harassment Alert** | harassment | Verbal/physical harassment | High (80-90) |
| 🌃 **Unsafe Area Alert** | unsafe_area | Entered dangerous zone | Medium-High (70-85) |
| 🚗 **Vehicle Following** | vehicle_following | Car following suspiciously | High (90-100) |
| 🌙 **Late Night Emergency** | late_night | Emergency after dark | Very High (95-110) |
| ⚠️ **Immediate Danger** | immediate_danger | Active threat NOW | Critical (100-120) |

**How to Send Alert:**
1. Click any scenario button
2. Alert is sent **instantly** to dispatch
3. You'll see it appear in your Alert History below

#### 2. **Test System Overload Section**
For testing the system's capacity:
- **"Send 5 Alerts"** - Tests normal load
- **"Send 10 Alerts"** - Tests high load (Queue Priority Algorithm kicks in)
- **"Send 20 Alerts"** - Tests system overload (Emergency units deploy)

**What Happens on Overload:**
- Multiple alerts enter the Priority Queue
- System automatically prioritizes by severity + time + zone risk
- If queue > 5 emergencies AND priority > certain threshold → Hidden emergency units deploy
- Desktop shows all alerts being processed in real-time

#### 3. **Alert History** (Bottom Section)
Every alert you send appears here with **real-time status updates**:

**Status Progression:**
```
🟡 Waiting for patrol...
    ↓ (1-2 seconds)
🟠 Patrol assigned!
    ↓ (patrol traveling - ~3-9s depending on distance)
🔵 Help on the way!
    ↓ (patrol arrives)
🔴 Patrol at scene - Helping!
    ↓ (2 seconds at scene)
✅ Emergency Resolved - You are Safe!
```

**Alert Card Information:**
- **ID**: Unique emergency identifier (e.g., EMG_1)
- **Type**: The distress type you selected
- **Location**: Random city zone assigned (e.g., UCN12, District-5)
- **Time**: How long ago you sent it
- **🚓 Patrol**: Which unit was assigned to you
- **✓ WOMAN SAVED!**: Green banner when resolved, shows response time

---

## Desktop Control Panel Guide

### 🖥️ Desktop Interface Overview

The desktop is the **Emergency Dispatch Control Center** - like a 911 operator's command center but for women's safety.

---

### Top Bar (Header)

#### Left Side:
- **🚨 Emergency Dispatch Control Center** - System title
- **System Status Indicator**:
  - 🟢 **Green dot + "SYSTEM ONLINE"** = Connected to server
  - 🔴 **Red dot + "SYSTEM OFFLINE"** = Disconnected (will auto-reconnect)

#### Right Side:
- **⏰ Current Time** - Real-time clock (24-hour format)

---

### Main Layout

The screen is divided into:
- **Left**: 🗺️ City Map (large interactive visualization)
- **Right**: 6 Information Panels (data and analytics)

---

### Left Panel: 🗺️ SafeCity Live Map

**What You See:**

#### 1. **Nodes (Zones)**
- Small circles representing city locations
- **Colors**:
  - 🔴 **Red** = High danger zone (risky area)
  - 🟠 **Orange** = Medium risk
  - 🟢 **Green** = Safe zone
- **Labels**: UCN1, UCN2... (Upper City North), District-1, etc.

#### 2. **Edges (Roads)**
- Lines connecting zones
- **Colors**:
  - Gray = Normal roads
  - 🔴 **Red/Thick** = Dangerous routes (through high-risk zones)
- Algorithm adds **3x penalty** to danger zone roads

#### 3. **🚓 Patrol Units (Blue Vehicles)**
- Blue car icons with labels (Patrol-01, Patrol-02, etc.)
- **Position**: Current location on map
- **Small colored dot on patrol**:
  - 🟢 **Green** = IDLE (available)
  - 🔵 **Blue** = EN_ROUTE (traveling to emergency)
  - 🔴 **Red** = ENGAGED (at emergency scene, helping)
  - 🟡 **Yellow** = RETURNING (going back to station)

#### 4. **🚨 Emergency Markers**
- Circles with "!" exclamation mark
- **Color shows status**:
  - 🟠 **Orange** = PENDING (waiting for patrol)
  - 🔵 **Blue** = ASSIGNED (patrol assigned)
  - 🟣 **Purple** = RESPONDING (patrol traveling)
  - 🔴 **Red** = ENGAGED (patrol at scene)
  - 🟢 **Green** = RESOLVED (woman saved!)
- **Pulse animation** = Active emergency

#### 5. **Blue Dotted Lines**
- Path the patrol will take to reach emergency
- Shows the **Dijkstra shortest safe path**

**Map Legend (Bottom Left):**
- 🚓 Patrol Unit
- 🚨 Emergency Alert
- 🔴 Danger Zone
- 🟢 Safe Path
- 🔴 Through Danger

**How to Analyze the Map:**
1. **Find an emergency** (red pulsing circle)
2. **See which patrol** is closest (blue vehicle)
3. **Watch the blue path** appear (route calculation)
4. **Watch patrol move** along the path
5. **Color changes** as status updates (orange → blue → purple → red → green)

---

### Right Panels: Data & Analytics

Each panel has:
- **Header**: Title and stats (clickable)
- **🔍 View Details button**: Click to open full popup window
- **Preview**: Shows limited data with fade effect at bottom

---

### Panel 1: 📊 Priority Queue (Max Heap)

**Purpose:** Shows which emergencies are **waiting** to be assigned a patrol, ordered by priority.

**Click Header** → Opens popup with full scrollable list

**What You See:**

Each queue item shows:
```
#1 - EMG_3                                [Priority: 98.5]
🚨 Type: vehicle_following
📍 Location: District-7  
⏰ Wait: 3s
⚡ Breakdown:
   • Base Priority: 92.0
   • Time Factor: +3.5
   • Zone Risk: +3.0
   • Danger Multiplier: ×1.0
```

**How to Analyze:**

1. **Position (#1, #2, #3)**: Higher = More urgent, will be processed first
2. **Priority Score**: 
   - 60-80 = Medium priority
   - 80-100 = High priority
   - 100+ = Critical (late night, immediate danger, high-risk zone)
3. **Breakdown**: See WHY this emergency has this priority
   - **Base Priority**: From distress type (stalking=85, immediate danger=100)
   - **Time Factor**: +1 point per second waiting (prevents starvation)
   - **Zone Risk**: High-danger zones add +20-30 points
   - **Danger Multiplier**: If >100 priority, applies 1.05x boost

**Key Insight:**
- If queue is empty → All emergencies assigned! ✓
- If queue has many items → System overloaded (8 patrols may not be enough)
- **System intelligently assigns NEAREST AVAILABLE patrol** - distance is priority #1

**DSA Concept:**
- **Max Heap** keeps highest priority at top in O(log n) time
- Automatic reordering as time passes (priorities increase)

---

### Panel 2: 🚨 Active Emergencies

**Purpose:** Shows **ALL current emergencies** with their status and assigned patrol info.

**Click Header** → Opens popup with full scrollable list

**What You See:**

Each emergency card shows:
```
┌──────────────────────────────────────┐
│ EMG_5                   [RESPONDING] │ ← Status badge (colored)
├──────────────────────────────────────┤
│ 🚨 Type: stalking                    │
│ 📍 Location: UCN42                   │
│ ⏰ Time: 8s ago                      │
│ 🚓 Patrol: Patrol-03                │
│ ⏱️ ETA: 7s                           │
│ ⚡ Priority: 95                      │
└──────────────────────────────────────┘
```

**Status Colors:**
- 🟠 **Orange**: PENDING (waiting)
- 🔵 **Blue**: ASSIGNED (patrol just assigned)
- 🟣 **Purple**: RESPONDING (patrol on the way)
- 🔴 **Red**: ENGAGED (patrol at scene, helping)
- 🟢 **Green**: RESOLVED (saved!)

**How to Analyze:**

1. **Status Badge**: Quick view of emergency state
2. **Patrol Name**: Which unit is handling it (click to see on map)
3. **ETA**: How long until patrol arrives (countdown)
4. **Time**: How long woman has been waiting
5. **Priority**: How urgent the system considers this

**What to Look For:**
- Long wait times → System may be overloaded
- High priority + PENDING → No patrols available
- ENGAGED status → Help is actively being provided
- RESOLVED → Success! Response time shown

---

### Panel 3: 🗂️ Zone Intelligence (Hash Table)

**Purpose:** Shows **risk levels** for each zone based on historical incident data.

**Click Header** → Opens popup with **ALL 100 zones** scrollable

**What You See:**

Top 10 riskiest zones displayed:
```
┌────────────────────────────────┐
│ Zone: UCN42                    │
│ 🔴 Risk Level: 87.3            │ ← 0-100 scale
│ 📊 Incidents: 15               │ ← Total emergencies
│ ⏱️ Avg Response: 23.5s         │ ← Historical avg
│ 🕐 Last Incident: 2m ago       │
└────────────────────────────────┘
```

**Risk Level Colors:**
- 🔴 **80-100**: High danger (red zones on map)
- 🟠 **60-80**: Medium risk (orange)
- 🟡 **40-60**: Moderate
- 🟢 **0-40**: Safe (green zones)

**How to Analyze:**

1. **Risk Level**: Current danger assessment
   - Based on: incident frequency + severity + recency
   - Automatically decays over time (zones get safer if no incidents)
2. **Incidents**: Total emergencies in this zone
   - High number = dangerous area
3. **Avg Response**: How fast patrols typically reach this zone
   - High time = remote/difficult to access
4. **Last Incident**: Recency of last emergency
   - Recent = currently active danger zone

**DSA Concept:**
- **Hash Table** provides O(1) lookup during emergency
- When emergency arrives at Zone UCN42, instant risk retrieval
- Risk added to priority calculation

**Real-World Application:**
- Dark red zones = Station more patrols nearby
- High incident zones = Community safety programs needed
- Response time analysis = Optimize patrol locations

---

### Panel 4: 🚓 Patrol Unit Status

**Purpose:** Monitor **every patrol unit** in the system - where they are, what they're doing.

**Click Header** → Opens popup with all patrol details

**What You See:**

```
┌─────────────────────────────────────┐
│ PATROL_1                            │
│ Status: 🔵 EN_ROUTE                 │ ← Current state
│ Location: UCN15                     │ ← Current position
│ Assignment: EMG_7                   │ ← Which emergency
│ ETA: 12s                            │ ← Time to arrival
└─────────────────────────────────────┘
```

**Patrol States:**
- 🟢 **IDLE**: Available, waiting at station
- 🔵 **EN_ROUTE**: Traveling to emergency
- 🔴 **ENGAGED**: At emergency scene, helping victim
- 🟡 **RETURNING**: Going back to home station

**How to Analyze:**

1. **Active vs Total**: "5 active / 10 total"
   - Active = En route or engaged
   - If all busy → System at capacity
2. **Individual Status**: See what each patrol is doing
3. **Location**: Track patrol positions
4. **Assignment**: Link patrol to specific emergency

**What to Look For:**
- All patrols IDLE → System ready for emergencies
- All patrols EN_ROUTE/ENGAGED → System at max capacity
- Long ENGAGED times → Complex emergency situation
- RETURNING state → Patrol will be available soon

**Hidden Feature:**
- If system overload detected (queue > 5 high priority items)
- **Emergency backup units deploy** automatically
- Shows as EMERGENCY_1, EMERGENCY_2 (not normally visible)

---

### Panel 5: 📈 System Metrics

**Purpose:** Overall system **performance statistics** and health monitoring.

**Click Header** → Opens popup with detailed metrics

**What You See:**

```
┌─────────────────────────────────────┐
│ Total Emergencies: 47               │
│ Resolved: 42                        │
│ Active: 5                           │
│ Average Response Time: 18.7s        │
│ System Efficiency: 89.4%            │
│ Queue Length: 2                     │
│ Available Patrols: 4/10             │
└─────────────────────────────────────┘
```

**Key Metrics Explained:**

1. **Total Emergencies**: All alerts received since server started
2. **Resolved**: Successfully completed rescues
3. **Active**: Currently being handled
4. **Average Response Time**: Mean time from alert → resolution
   - Good: < 20 seconds
   - Acceptable: 20-30 seconds
   - Poor: > 30 seconds (system overloaded)
5. **System Efficiency**: (Resolved / Total) × 100%
   - 95%+ = Excellent
   - 85-95% = Good
   - < 85% = Need more patrols or optimization
6. **Queue Length**: How many waiting for patrol
   - 0 = All assigned immediately ✓
   - 1-3 = Normal operation
   - 5+ = High load
   - 10+ = Critical overload
7. **Available Patrols**: Free units / Total units
   - Low availability = May need emergency units

**System Capacity:** 8 patrol units
- If 6+ emergencies simultaneously → System reaches capacity
- Emergency backup units auto-deploy when needed

**How to Analyze System Health:**

✅ **Healthy System:**
- Response time < 20s
- Efficiency > 90%
- Queue length 0-2
- Most patrols available

⚠️ **Stressed System:**
- Response time 20-35s
- Efficiency 80-90%
- Queue length 3-5
- Half patrols busy

🚨 **Overloaded System:**
- Response time > 35s
- Efficiency < 80%
- Queue length 5+
- All patrols engaged

---

### Panel 6: 🛣️ Dijkstra Path Analysis

**Purpose:** Shows the **safest route algorithm** in action - how paths are calculated.

**Click Header** → Opens popup with latest path details

**What You See:**

```
┌──────────────────────────────────────────┐
│ Latest Path: PATROL_3 → EMG_8            │
│                                           │
│ Route: UCN5 → UCN12 → UCN18 → UCN42     │
│ Total Distance: 4 hops                   │
│ Total Time: 100s                         │
│ Safety Score: 87.3                       │
│                                           │
│ Path Segments:                           │
│   UCN5 → UCN12:  Normal road (25s)       │
│   UCN12 → UCN18: Danger zone (45s) ⚠️   │
│   UCN18 → UCN42: Safe route (30s)        │
│                                           │
│ WHY This Path?                           │
│ • Avoids 2 high-danger zones             │
│ • 3x penalty applied to danger roads     │
│ • Alternative path was 80s but through   │
│   extremely dangerous area (risk 95)     │
└──────────────────────────────────────────┘
```

**How Dijkstra Works Here:**

1. **Start**: Patrol's current location
2. **End**: Emergency location
3. **Edge Weights**: Base time × danger multiplier
   - Safe road: 1.0x (normal time)
   - Danger road: 3.0x (takes longer in calculation)
4. **Algorithm**: Finds lowest total weight path
5. **Result**: Safest route (even if slightly longer physically)

**How to Analyze:**

1. **Route Visualization**: See exact path on map (blue dotted line)
2. **Time Calculation**: Understand why this path chosen
3. **Safety Score**: Overall path safety (0-100)
   - 90+ = Very safe route
   - 70-90 = Acceptable, some risk
   - < 70 = Dangerous path (no better option)
4. **Segment Analysis**: See which parts are safe/dangerous
5. **WHY Explanation**: Algorithm decision reasoning

**Real-World Impact:**
- Patrol avoids dark alleys and high-crime areas
- Victim receives help via safest possible route
- Patrol officers have lower risk
- Even if takes 10s longer, safety is prioritized

**DSA Concept:**
- **Dijkstra's Algorithm**: Shortest path with weighted edges
- **Time Complexity**: O((V + E) log V) with min-heap
- **Graph**: 100 nodes, ~300 edges
- **Dynamic Weights**: Change based on real-time zone risk

---

## Understanding the Data

### What Each Section Tells You

#### **For System Administrators:**
- **Priority Queue**: Workload and waiting emergencies
- **Active Emergencies**: Current operations status
- **Zone Intelligence**: Where to deploy more resources
- **Patrol Status**: Unit availability and efficiency
- **System Metrics**: Overall performance KPIs
- **Dijkstra Analysis**: Route optimization effectiveness

#### **For Data Scientists:**
- **Priority Queue**: Queue theory and scheduling algorithms
- **Hash Table**: O(1) data access patterns
- **Zone Intelligence**: Risk modeling and prediction
- **Metrics**: Performance benchmarking
- **Dijkstra**: Graph algorithms in real-world scenarios

#### **For Safety Analysts:**
- **Zone Intelligence**: Crime hotspot identification
- **Response Times**: Service level analysis
- **Patrol Patterns**: Coverage optimization
- **Emergency Types**: Threat pattern analysis

---

## Patrol Selection Algorithm

### How Nearest Patrol is Selected

When emergency arrives, system follows this logic:

```
1. Priority Queue: Order emergencies by urgency
2. For highest priority emergency:
   a. Check all 8 patrol units
   b. Skip patrols that are ENGAGED or EN_ROUTE
   c. For each AVAILABLE patrol:
      - Run Dijkstra from patrol location → emergency location
      - Calculate route time (considering danger zones)
      - Add small penalty if patrol is RETURNING (+10s)
   d. Select patrol with LOWEST total time
   e. Assign patrol to emergency
3. Repeat for next emergency in queue
```

**Key Points:**
- ✅ **Distance is PRIMARY factor** - nearest available patrol wins
- ✅ **Priority Queue ensures** most urgent emergency handled first
- ✅ **Dijkstra calculates** safest AND fastest route
- ✅ **IDLE patrols slightly preferred** but distance matters most
- ✅ **Real-time availability** - only considers free patrols

**Example:**
```
Emergency at Zone UCN42 (Priority: 95)

Patrol-1: IDLE at C7  → 90s away  ❌ (far)
Patrol-2: IDLE at UCN2 → 15s away ✅ (NEAREST!)
Patrol-3: EN_ROUTE    → (skip, busy)
Patrol-4: IDLE at C1  → 120s away ❌ (very far)

Result: Patrol-2 assigned (15s ETA)
```

---

## Real-Time Integration

### How Mobile and Desktop Sync

**When you click a button on Mobile:**

```
Mobile: Click "Stalking Alert"
    ↓
    WebSocket → Server receives alert
    ↓
Server: 
1. Creates emergency object
2. Calculates priority (base + zone risk)
3. Adds to Priority Queue (Max Heap)
4. Processes queue (finds best patrol)
5. Runs Dijkstra to calculate safest path
6. Assigns patrol to emergency
7. Updates zone intelligence (Hash Table)
    ↓
    WebSocket → Broadcasts to all clients
    ↓
Desktop: 
1. Emergency appears on map (orange marker)
2. Added to Active Emergencies panel
3. Shows in Priority Queue panel
4. Blue path line appears (Dijkstra route)
5. Patrol starts moving toward emergency
    ↓
    (10 seconds pass)
    ↓
Desktop:
1. Emergency color changes: orange → blue → purple → red
2. Patrol position updates on map every 3 seconds
3. ETA counts down rapidly
4. Status updates: ASSIGNED → RESPONDING → ENGAGED
    ↓
    (2 seconds at scene - quick resolution!)
    ↓
Server: Resolves emergency
    ↓
Desktop:
1. 🎉 Notification appears: "✅ Woman Saved!"
2. Emergency marker turns GREEN
3. Removed from Active Emergencies after 3s
4. Zone intelligence updated
5. Patrol returns to station
    ↓
Mobile:
1. Alert card updates: "Emergency Resolved - Safe!"
2. Green banner: "✓ WOMAN SAVED! Response time: 9s"
```

**Total Time:** ~8-12 seconds from alert to resolution (FAST!)

---

## Data Structures Explained

### Why These DSA?

#### 1. **Priority Queue (Max Heap)**
**Problem:** Multiple emergencies arrive simultaneously. Which to handle first?

**Solution:** Max Heap orders by priority in O(log n) time

**Real-World Impact:**
- Late night emergencies handled first
- Woman in immediate danger gets priority
- Fair system: waiting time increases priority (prevents starvation)

**Without Priority Queue:**
- FIFO (First In First Out) = unfair
- Minor incident could be handled before critical emergency

---

#### 2. **Hash Table (Zone Intelligence)**
**Problem:** Need instant access to zone risk data during emergency

**Solution:** Hash Table provides O(1) lookup by zone ID

**Real-World Impact:**
- Instant risk assessment when emergency arrives
- No delay searching through zone data
- Can store unlimited historical data per zone

**Without Hash Table:**
- Linear search through zones = O(n) time
- Slow priority calculation
- Delayed dispatch

---

#### 3. **Graph (City Network)**
**Problem:** City roads form a complex network with safe/dangerous areas

**Solution:** Graph with weighted edges (danger zones have higher weight)

**Real-World Impact:**
- Models real city structure
- Captures danger zones as edge weights
- Enables path-finding algorithms

**Without Graph:**
- Can't model road networks
- No route planning
- Patrols take random/inefficient paths

---

#### 4. **Dijkstra's Algorithm**
**Problem:** Find safest route, not shortest route

**Solution:** Dijkstra with 3x penalty on danger zone edges

**Real-World Impact:**
- Patrols avoid high-crime areas
- Officer safety prioritized
- Victim receives help via safest possible route
- Even if slightly longer, safety > speed

**Without Dijkstra:**
- Random routes or straight lines
- Patrols go through danger zones
- Higher risk for officers and victims

---

## Patrol Selection Algorithm

### How Nearest Patrol is Chosen

When emergency arrives, system follows this intelligent logic:

**Step-by-Step Process:**
```
1. Priority Queue: Order emergencies by urgency
2. For highest priority emergency:
   a. Check all 8 patrol units
   b. Skip patrols that are ENGAGED or EN_ROUTE (busy)
   c. For each AVAILABLE patrol:
      • Run Dijkstra from patrol location → emergency location
      • Calculate route time (considering danger zones)
      • Add small penalty if patrol is RETURNING (+10s)
   d. Select patrol with LOWEST total time (NEAREST!)
   e. Assign patrol to emergency
3. Repeat for next emergency in queue
```

**Key Points:**
- ✅ **Distance is PRIMARY factor** - nearest available patrol wins
- ✅ **Priority Queue ensures** most urgent emergency handled first  
- ✅ **Dijkstra calculates** safest AND fastest route
- ✅ **IDLE patrols slightly preferred** but distance matters most
- ✅ **Real-time availability** - only considers free patrols

**Example Selection:**
```
Emergency at Zone UCN42 (Priority: 95 - High!)

Checking all patrols:
Patrol-1: IDLE at C7   → Dijkstra: 90s  ❌ (far)
Patrol-2: IDLE at UCN2 → Dijkstra: 15s  ✅ (NEAREST!)
Patrol-3: EN_ROUTE     → (skip, busy)
Patrol-4: IDLE at C1   → Dijkstra: 120s ❌ (very far)
Patrol-5: ENGAGED      → (skip, at scene)
Patrol-6: IDLE at UN9  → Dijkstra: 45s  ❌ (far)
Patrol-7: IDLE at UN3  → Dijkstra: 30s  ❌ (farther)
Patrol-8: RETURNING    → Dijkstra: 25s + 10s penalty = 35s ❌

✅ Result: Patrol-2 assigned (ETA: 15 seconds)
```

**Why This Matters:**
- 🚀 **Fastest possible response** to victim
- 📍 **Geographic optimization** ensures efficient coverage
- ⚖️ **Fair distribution** of workload across patrols
- 🎯 **Best use of resources** with only 8 units covering 100 zones

---

## Advanced Features

### 🔔 Desktop Notifications

Watch for popup notifications (top-right):

**"🚓 Patrol Dispatched"**
- Appears when patrol assigned
- Shows patrol name and location
- Blue color = informational

**"✅ Woman Saved!"**
- Appears when emergency resolved
- Shows response time
- Green color = success
- Most satisfying notification!

### 📊 Panel Popups

**Click any panel header** to open full detailed view:
- Large modal window (90% screen)
- Fully scrollable content
- See ALL data (not just top 10)
- Click outside or press Escape to close
- Real-time updates even while popup is open

### 🗺️ Map Interactions

- **Hover over nodes**: See zone names
- **Watch patrol movement**: Real-time position updates every second
- **Color changes**: Emergency status visualization
- **Path lines**: Dijkstra's calculated routes

---

## Testing Scenarios

### Scenario 1: Single Emergency
**Mobile:** Click "Stalking Alert"

**Watch Desktop:**
1. Red marker appears on map
2. Shows in Active Emergencies (orange status)
3. Nearest patrol assigned within 1-2s
4. Blue path line appears
5. Patrol moves along path (fast - every 3 seconds)
6. Status changes: orange → blue → purple → red → green
7. Notification: "Woman Saved!"

**Time:** ~8-12 seconds total (FAST response!)

---

### Scenario 2: System Overload
**Mobile:** Click "Send 10 Alerts"

**Watch Desktop:**
1. Multiple red markers appear
2. Priority Queue fills up (shows #1, #2, #3... rankings)
3. All 8 patrols become busy (system at capacity)
4. Queue processes in priority order (highest first)
5. **NEAREST available patrol** assigned to each emergency
6. Some emergencies wait longer if all patrols engaged
7. System metrics: efficiency may drop, response time increases
8. If critical: Emergency backup units deploy

**Time:** ~1-2 minutes to clear all (with 8 patrols)

---

### Scenario 3: High-Risk Zone
**Mobile:** Send alert, check mobile list for assigned location

**Watch Desktop:**
1. If emergency in red zone (high danger):
   - Priority automatically boosted (+20-30 points)
   - Higher in queue
   - Dijkstra calculates extra-safe route
   - May avoid zone entirely (3x penalty)
2. Zone Intelligence panel: Risk level increases
3. Next emergency in that zone: even higher priority

---

## Troubleshooting

### Mobile shows alert but nothing on desktop?
- **Check:** Both connected to same server?
- **Check:** Desktop shows "SYSTEM ONLINE" (green)?
- **Fix:** Refresh both pages

### All patrols stuck in ENGAGED?
- **Cause:** Emergencies not auto-resolving
- **Check:** Server console for errors
- **Normal:** ENGAGED state lasts 5 seconds, then resolves

### Priority Queue empty but emergencies on map?
- **Normal!** Queue only shows PENDING emergencies
- Once patrol assigned, removed from queue
- Shows in Active Emergencies panel instead

### Zone Intelligence shows "0 zones tracked"?
- **Wait:** Data populates after first emergency
- **Check:** Send alert from mobile to generate data

---

## Key Takeaways

### For Understanding DSA:
1. **Priority Queue**: Dynamic ordering, prevents starvation
2. **Hash Table**: O(1) lookups for instant data access
3. **Graph**: Models complex real-world networks
4. **Dijkstra**: Weighted shortest path with real constraints

### For Real-World Application:
1. Algorithms **save lives** when applied correctly
2. Data structures **enable real-time decisions**
3. Proper prioritization **ensures fairness**
4. Safety can be **algorithmically optimized**

### For System Design:
1. **WebSocket**: Real-time bidirectional communication
2. **State Management**: Synchronized client-server state
3. **Visualization**: Makes complex data understandable
4. **Modularity**: Each DSA has clear responsibility

---

## Quick Reference

### Emergency Status Flow
```
PENDING → ASSIGNED → RESPONDING → ENGAGED → RESOLVED
  🟠        🔵          🟣          🔴         🟢
```

### Patrol Status Flow
```
IDLE → EN_ROUTE → ENGAGED → RETURNING → IDLE
 🟢       🔵         🔴         🟡         🟢
```

### Priority Calculation
```
Priority = Base + Time_Factor + Zone_Risk + Danger_Multiplier
         = 85   + 3.5         + 8.2       + 5.3
         = 102.0 (Critical)
```

### Response Time Goals
```
Excellent:  < 8s   (nearby patrol, safe route)
Good:       8-12s  (medium distance)
Acceptable: 12-18s (far distance or complex route)
Poor:       > 18s  (system overloaded or very remote)
```

**Note:** With 8 patrols covering 100 zones, response times are optimized for:
- ⚡ **Fast deployment**: 3-second movement intervals
- 🎯 **Nearest patrol selection**: Distance is primary factor
- 🚀 **Quick resolution**: 2 seconds at scene
- **Total response**: Most emergencies resolved in 8-12 seconds!

---

## Need Help?

1. **Check notifications**: Top-right corner for system messages
2. **Open panel popups**: Click "🔍 View Details" for full data
3. **Monitor map**: Visual representation of all activity
4. **Check console**: Server logs show detailed operations
5. **System metrics**: Overall health indicator

---

**Remember:** This is a **simulation** demonstrating DSA in action. In a real system, response times would vary based on actual city geography, traffic, and real-world constraints. The goal is to understand **how algorithms can optimize emergency response systems to save lives.**

🚨 **Stay Safe!** 🚨
