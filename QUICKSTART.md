# 🚀 QUICK START GUIDE

## Minimal Steps to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Open Browser
- Desktop Control: http://localhost:3000/desktop/index.html
- Mobile Simulator: http://localhost:3000/mobile/index.html

---

## First Time Demo

1. **Open Desktop** first (in main browser)
2. **Open Mobile** (in separate tab/phone)
3. **On Mobile**: Tap map → Select zone → Choose "Assault" → Send Alert
4. **On Desktop**: Watch emergency appear in Priority Queue → Patrol dispatched

---

## Quick Tests

### Test 1: Priority Queue
```
Mobile → Send 3 "Harassment" alerts
Mobile → Send 1 "Kidnapping" alert
Desktop → Check queue (Kidnapping should be #1)
```

### Test 2: Danger Zone Routing
```
Mobile → Send alert to "S3" (Bus Terminal)
Desktop → Click "C1" node to make it danger zone
Desktop → Watch patrol route change to avoid C1
```

### Test 3: Emergency Patrol
```
Mobile → Click "Send 3 Alerts" button twice
Desktop → Orange emergency patrol should deploy
```

---

## What to Show Evaluator

1. **Hash Table Panel**: Zone risk levels updating
2. **Priority Queue Panel**: Emergency ordering logic
3. **Map**: Graph visualization with edges
4. **Path Routing**: Dijkstra avoiding danger zones
5. **Code Comments**: Open any DSA file, show explanations

---

## Troubleshooting

### Problem: Server won't start
```bash
# Solution: Install dependencies
npm install
```

### Problem: Port 3000 in use
```javascript
// Edit server/server.js line 540
const PORT = 3001; // Change to different port
```

### Problem: UI not connecting
```
1. Check server is running (should see "ONLINE" message)
2. Refresh browser
3. Check console for errors (F12)
```

---

## For Evaluation/Presentation

**Open Before Demo**:
- Server terminal (to show logs)
- Desktop UI (full screen)
- Mobile UI (phone or side-by-side)
- One DSA file in code editor (to show comments)

**Demo Flow** (5 minutes):
1. Show system architecture (README diagram)
2. Send alert from mobile
3. Explain decision-making on desktop
4. Toggle danger zone, show rerouting
5. Show DSA code comments

---

## Project Highlights to Mention

✅ Hash Table with custom hash function and collision handling
✅ Max-heap Priority Queue with dynamic recalculation
✅ Graph-based city model (adjacency list)
✅ Modified Dijkstra for safest path (not shortest)
✅ Real-time WebSocket communication
✅ All algorithms visible on UI

---

## File Locations (for Code Review)

```
📁 Core DSA Implementations:
   server/dsa/HashTable.js      → Zone intelligence
   server/dsa/PriorityQueue.js  → Emergency ordering
   server/dsa/Graph.js          → City network
   server/dsa/Dijkstra.js       → Safest path

📁 System Logic:
   server/server.js             → Main dispatch engine

📁 Visualization:
   desktop/script.js            → Control panel rendering
   mobile/script.js             → Incident generator

📁 Configuration:
   shared/cityMapData.js        → City definition
```

---

## Expected System Behavior

**When alert is sent**:
1. Server receives via WebSocket
2. Hash table looks up zone data (O(1))
3. Priority calculated and inserted into queue (O(log n))
4. Best patrol found using graph traversal
5. Dijkstra computes safest path
6. Desktop UI updates in real-time

**Realistic timing**:
- Patrol movement: 2-5 minutes to reach
- Priority recalculation: Every 5 seconds
- Risk decay: Every 60 seconds

---

## Success Criteria

✅ All 4 DSA components implemented from scratch
✅ System runs without errors
✅ UI shows real-time updates
✅ Code has clear explanatory comments
✅ Emergency dispatch works end-to-end
✅ Danger zones affect routing visibly

---

**Questions? Check main README.md for detailed documentation**
