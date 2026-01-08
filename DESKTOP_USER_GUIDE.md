# 🖥️ Desktop Control Panel - User Guide

## Overview
The Desktop Control Panel is the **administrative interface** for monitoring and managing the Women Safety Emergency Dispatch System. It provides real-time visualization of all system components and allows manual intervention when needed.

---

## 🚀 Getting Started

### Accessing the Interface
1. **Local Development**: http://localhost:3000/desktop/index.html
2. **Production**: https://[your-render-url].onrender.com/desktop/index.html

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Minimum screen resolution: 1366x768
- Stable internet connection

---

## 📊 Dashboard Layout

### Top Bar - System Status
```
┌────────────────────────────────────────────────┐
│ 🚨 Emergency Dispatch System    [Status: ONLINE] │
│                          [Reset System] [Time]   │
└────────────────────────────────────────────────┘
```

**Status Indicators:**
- 🟢 **ONLINE**: System operational, WebSocket connected
- 🔴 **OFFLINE**: Connection lost, attempting reconnect
- ⏰ **Real-time Clock**: Current system time

**Reset System Button:**
- Clears all active emergencies
- Returns patrols to home stations
- Resets emergency queue
- **Clears all resolution history** (empties historical data)
- **Clears zone intelligence** (resets hash table)
- **Deletes JSON persistence files** (removes saved data)
- Use when you want a completely fresh start

---

## 🗺️ Interactive City Map (Center Panel)

### Map Features
1. **Nodes (City Zones)**
   - 🟢 Green circles: Safe zones
   - 🔴 Red circles: Danger zones
   - Hover to see zone details

2. **Edges (Roads)**
   - Blue lines: Safe routes
   - Red lines: Routes through danger zones (3x travel time)

3. **Patrols (Police Units)**
   - 🚓 Blue icons: Idle patrols at stations
   - 🚨 Moving icons: Active patrols en route
   - Hover shows: Patrol ID, Status, Current Location, ETA

4. **Emergencies (Women in Distress)**
   - 🆘 Red markers with distress type labels
   - Pulse animation indicates waiting status
   - Click marker for detailed information

5. **Patrol Paths**
   - Orange dotted lines: Active patrol routes
   - Shows real-time movement from station to emergency

### Map Controls
```
[🔍+] Zoom In    [🔍-] Zoom Out    [↻] Reset View
```
- **Zoom In/Out**: Adjust map scale
- **Pan**: Click and drag to move around map
- **Reset**: Return to default view (1:1 scale, centered)

### Toggling Danger Zones
1. **Click any node** (green circle) on the map
2. Node turns **red** → Now a danger zone
3. All edges connected to that node get **3x penalty**
4. Patrols will **automatically avoid** that area
5. Click again to toggle back to safe zone

**Use Case Example:**
```
Scenario: Protest blocking main intersection
1. Click node "Zone_43" 
2. System recalculates all routes
3. Future patrols take alternate paths
4. Already dispatched patrols continue current route
```

---

## 📋 Information Panels

**All panels are clickable!** Click any panel header with the 🔍 icon to open a detailed modal view with comprehensive historical data.

### 1. Priority Queue Panel (Max-Heap)
**Click to view:**
- Current emergency queue with priority breakdowns
- Last 10 resolved emergencies with detailed priority calculations
- How each emergency was scored (severity + wait time + zone risk + availability)

```
┌─────────────────────────────────────┐
│ 📥 Emergency Queue (Priority)       │
│                                     │
│ 1. ASSAULT - Elm St (P: 92.5)      │
│ 2. STALKING - Oak Ave (P: 67.2)    │
│ 3. HARASSMENT - Main St (P: 45.8)  │
└─────────────────────────────────────┘
```

**Shows:**
- All pending emergencies
- Sorted by priority (highest first)
- Real-time priority updates (escalates with time)
- Click entry to see full details

**Priority Calculation:**
```
Priority = Severity + Time Score + Zone Risk + Availability Penalty

Severity Weights:
- Kidnap: 100 pts
- Assault: 85 pts
- Stalking: 60 pts
- Harassment: 40 pts
- Other: 30 pts

Time Score: +0.5 pts per second waiting
Zone Risk: +2 pts per risk level
```

### 2. Active Emergencies Panel (Middle Left)
```
┌─────────────────────────────────────┐
│ 🚨 Active Emergencies (3)           │
│                                     │
│ EMG_001 - ASSIGNED                  │
│ Location: Park St                   │
│ Patrol: PATROL_2 | ETA: 8s          │
│                                     │
│ EMG_002 - RESPONDING                │
│ Location: River Rd                  │
│ Patrol: PATROL_5 | ETA: 4s          │
└─────────────────────────────────────┘
```

**Emergency States:**
1. **PENDING**: Just received, awaiting patrol assignment
2. **ASSIGNED**: Patrol selected, preparing to move
3. **RESPONDING**: Patrol en route to location
4. **ENGAGED**: Patrol at scene, resolving emergency
5. **RESOLVED**: Successfully handled

**Click any emergency** to open detail modal:
- Emergency ID
- Distress type and description
- Exact location coordinates
- Current status
- Assigned patrol details
- Response time
- Manual resolve button (admin override)

### 3. Zone Intelligence Panel (Hash Table)
**Click to view:**
- Hash table internals (load factor, collisions, bucket utilization)
- All zones with risk levels and incident counts
- Collision chains for educational insight
- High-risk zones requiring attention

```
┌─────────────────────────────────────┐
│ 🗂️ Zone Intelligence (Hash Table)   │
│                                     │
│ Zone_12 | Risk: 4.2                 │
│ Incidents: 8 | Avg Response: 12.3s  │
│ Dominant: HARASSMENT                │
└─────────────────────────────────────┘
```

**Hash Table Functionality:**
- O(1) lookup time per zone
- Tracks incident history per zone
- Updates risk levels dynamically
- Helps prioritize future emergencies

**Risk Levels:**
- 0-2: Low risk (green)
- 2-5: Moderate risk (yellow)
- 5-8: High risk (orange)
- 8-10: Critical risk (red)

**Click panel header** for full view of all zones

### 4. Patrol Status Panel
**Click to view:**
- All patrol units grouped by status (Available/On Duty)
- Current locations and assignments
- Active routes with waypoint progress
- Real-time patrol distribution statistics

```
┌─────────────────────────────────────┐
│ 🚓 Patrol Units (6 active)          │
│                                     │
│ PATROL_1 - IDLE                     │
│ Location: North Station             │
│                                     │
│ PATROL_2 - EN_ROUTE                 │
│ Emergency: EMG_003 | ETA: 6s        │
└─────────────────────────────────────┘
```

**Patrol States:**
- **IDLE**: Available at home station
- **EN_ROUTE**: Moving toward emergency
- **ENGAGED**: At emergency scene (1 second)
- **RETURNING**: Returning to station after resolution

**Patrol Movement:**
- Speed: 0.3 seconds per node
- Minimum travel time: 1 second
- Follows Dijkstra's safest path
- Avoids danger zones automatically

### 5. System Metrics Panel
**Click to view:**
- Overall system performance statistics
- Emergency type breakdown with bar charts
- Patrol performance metrics
- Historical trends and averages

```
┌─────────────────────────────────────┐
│ 📈 System Metrics                   │
│                                     │
│ Queue: 2 pending                    │
│ Active: 3 emergencies               │
│ Patrols: 4 idle, 2 active           │
│ Avg Response: 8.7s                  │
│ Total Handled: 47                   │
└─────────────────────────────────────┘
```

**Real-time Statistics:**
- Current queue length
- Active emergency count
- Patrol availability
- Average response time
- Total emergencies resolved

### 6. Dijkstra Path Analysis Panel
**Click to view:**
- Last 10 pathfinding decisions with full analysis
- Nodes visited and algorithm efficiency
- Danger zones avoided on each route
- Path justifications and optimization details

```
┌─────────────────────────────────────┐
│ 🛣️ Dijkstra Path Analysis           │
│                                     │
│ Click panel for pathfinding history │
│ Last 10 route decisions stored      │
└─────────────────────────────────────┘
```

**Shows when route is selected:**
- Total nodes in path
- Total travel time
- Path type (safe/through danger)
- Node-by-node breakdown
- Alternative rejected paths
- Why alternate routes were avoided

**Algorithm Explanation:**
- Uses modified Dijkstra's algorithm
- Danger zones have 3x edge weight
- Finds optimal balance: speed + safety
- Time complexity: O((V+E) log V)

---

## 🔔 Notifications

### Automatic Notifications Appear For:
1. **Patrol Dispatched** (Blue)
   - "🚓 Patrol Dispatched: PATROL_3 assigned to Main St"

2. **Woman Saved** (Green)
   - "✅ Woman Saved! PATROL_3 resolved emergency at Main St in 7s"

3. **Emergency Unit Deployed** (Orange)
   - "⚠️ Emergency Unit: High priority alerts trigger backup patrol"

### On-Map Save Notifications
- Green checkmark appears at emergency location
- Shows "✓ SAVED" for 3 seconds
- Confirms successful resolution

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + R` | Reset system |
| `Ctrl + +` | Zoom in map |
| `Ctrl + -` | Zoom out map |
| `Ctrl + 0` | Reset map view |
| `Esc` | Close modal |

---

## 🛠️ Admin Actions

### Manual Emergency Resolution
1. Click emergency marker on map OR entry in Active Emergencies panel
2. Emergency details modal opens
3. Click **"Resolve Emergency"** button
4. Confirm action
5. Patrol returns to station, woman removed from map

**When to use:**
- Testing system behavior
- Emergency false alarm
- Manual intervention required
- Demonstration purposes

### System Reset
1. Click **"Reset System"** button (top right)
2. Confirms: "🔄 System reset - all clear"
3. All emergencies cleared
4. All patrols return to home stations
5. Queue emptied
6. Zone intelligence **preserved**

**Use Cases:**
- Start fresh demonstration
- Clear test data
- System recovery after errors

---

## 📡 WebSocket Connection

### Connection Status
- **Connected**: Green dot, "System Status: ONLINE"
- **Disconnected**: Red dot, "System Status: OFFLINE"

### Automatic Reconnection
- Connection lost → Attempts reconnect every 3 seconds
- Heartbeat sent every 30 seconds to maintain connection
- No data lost during brief disconnections

### Troubleshooting Connection Issues
1. Check server is running: `node server/server.js`
2. Verify port 3000 is not blocked
3. Check browser console (F12) for errors
4. Try hard refresh: `Ctrl + Shift + R`

---

## 🎨 Visual Indicators

### Color Coding
- 🟢 **Green**: Safe, idle, available
- 🔵 **Blue**: Active, in transit, normal operation
- 🟡 **Yellow**: Warning, moderate priority
- 🟠 **Orange**: High priority, attention needed
- 🔴 **Red**: Critical, danger, emergency

### Animation States
- **Pulse**: Emergency waiting for patrol
- **Moving**: Patrol in transit
- **Flash**: New notification
- **Fade**: Item being removed

---

## 🐛 Common Issues & Solutions

### Issue 1: "No emergencies appearing on map"
**Solution:**
1. Check mobile app is connected
2. Verify emergency was sent (check mobile screen)
3. Refresh desktop page (F5)
4. Check browser console for errors

### Issue 2: "Patrols not moving"
**Solution:**
1. Verify emergency is in ASSIGNED state
2. Check patrol is not already ENGAGED
3. Wait for 0.05s update cycle
4. Reset system if stuck

### Issue 3: "Danger zones not working"
**Solution:**
1. Click directly on node circle (not label)
2. Node should turn red immediately
3. Check edge colors change to red
4. If stuck, toggle twice (off then on)

### Issue 4: "Connection keeps dropping"
**Solution:**
1. Ensure stable internet
2. Check server logs for errors
3. Verify no firewall blocking port 3000
4. Try different browser

---

## 💡 Best Practices

### For Demonstrations
1. **Start Clean**: Reset system before demo
2. **Pre-set Danger Zones**: Mark 2-3 zones as dangerous
3. **Stagger Emergencies**: Send 1-2 at a time for clarity
4. **Explain Priority**: Show how queue reorders dynamically
5. **Show Path Selection**: Click routes to explain Dijkstra

### For Testing
1. **Test Edge Cases**: Multiple simultaneous emergencies
2. **Verify Priority**: Lower priority should wait for higher
3. **Check Danger Avoidance**: Patrols should detour
4. **Monitor Performance**: Check response times stay low
5. **Test Reconnection**: Disconnect/reconnect WiFi

### For Presentations
1. Open desktop in fullscreen mode
2. Zoom map to comfortable view
3. Have mobile app ready on phone/second screen
4. Prepare 3-4 danger zone scenarios
5. Note response time averages

---

## 📖 Understanding the Algorithms

### Priority Queue (Emergency Ordering)
```
Implementation: Max-Heap
Time Complexity: O(log n) insert, O(1) peek
Use: Ensures highest priority emergency is always first
```

### Hash Table (Zone Intelligence)
```
Implementation: Chaining for collision resolution
Time Complexity: O(1) average lookup
Use: Instant access to zone history for priority calculation
```

### Graph (City Network)
```
Implementation: Adjacency list
Nodes: 100 city zones
Edges: 305 bidirectional roads
Use: Represents real city structure
```

### Dijkstra (Pathfinding)
```
Implementation: Priority queue with distance tracking
Time Complexity: O((V+E) log V)
Use: Finds safest path considering danger zones
```

---

## 🎓 Educational Value

This system demonstrates:
1. **Data Structure Selection**: Why each DS is optimal for its task
2. **Algorithm Efficiency**: Real-time constraints require fast operations
3. **System Integration**: Multiple DSs working together
4. **Real-world Application**: Emergency dispatch is not theoretical
5. **Trade-offs**: Safety vs speed, complexity vs performance

---

## � Data Persistence

### What Data is Saved?
The system automatically saves:
1. **Resolution History**: Last 50 resolved emergencies with full details
   - Emergency type, location, priority breakdown
   - Patrol information, response time
   - Dijkstra path analysis, danger zones avoided
   - Zone intelligence data at time of resolution

2. **Zone Intelligence**: All zone risk data
   - Past incident counts per zone
   - Dominant distress types
   - Risk level calculations
   - Hash table with collision chains

### Where is Data Stored?
- **File Location**: `server/data/` directory
- **Files Created**:
  - `resolution_history.json` - All resolved emergency records
  - `zone_intelligence.json` - Zone risk and incident data

### When is Data Saved?
- **Auto-save**: Every 30 seconds
- **Immediate save**: When an emergency is resolved
- **On shutdown**: When server stops (Ctrl+C graceful shutdown)

### When is Data Loaded?
- **On startup**: Server automatically loads persisted data
- **Survives crashes**: Data persists across server restarts
- **Panel modals**: Click any panel to view historical data

### Clearing All Data
Click **Reset System** button to:
- Clear all active emergencies
- Empty resolution history
- Reset zone intelligence
- **Delete JSON files** (removes all saved data)
- Return patrols to home stations

**Use Reset when:**
- Starting a fresh demonstration
- Testing from clean state
- Removing all historical data

---

## 📞 Support

**For Technical Issues:**
- Check server console for error messages
- Review browser console (F12) for client-side errors
- Verify all dependencies installed: `npm install`

**For Algorithm Questions:**
- Read inline code comments in server/dsa/*.js files
- Check SYSTEM_ANALYSIS.md for detailed explanations
- Review priority calculation in PriorityQueue.js

---

## 🔒 Security Note

This is a **demonstration system** for educational purposes:
- No authentication required
- Data stored locally in JSON files
- Not production-ready
- Use in controlled environment only

For production deployment:
- Add user authentication
- Implement role-based access
- Secure WebSocket connections
- Add audit logging
- Validate all inputs

---

## ✅ Quick Reference Checklist

**Before Starting:**
- [ ] Server running on port 3000
- [ ] Desktop page loaded and connected
- [ ] Mobile app accessible
- [ ] No browser console errors

**During Use:**
- [ ] Monitor connection status (green dot)
- [ ] Check emergency queue updates
- [ ] Verify patrol movements smooth
- [ ] Observe danger zone route changes

**After Session:**
- [ ] Reset system to clear data
- [ ] Close all browser tabs
- [ ] Stop server process
- [ ] Save any demonstration notes

---

*Last Updated: January 8, 2026*
*Version: 1.0.0*
*System: Women Safety Emergency Dispatch with DSA Visualization*
