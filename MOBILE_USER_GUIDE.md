# 📱 Mobile Emergency Sender - User Guide

## Overview
The Mobile Emergency Sender simulates citizens reporting emergencies. It's designed for **mobile devices** (phones/tablets) or can be used on desktop browsers for testing. Each person can report multiple independent emergencies.

---

## 🚀 Getting Started

### Accessing the Interface
1. **Local Development**: http://localhost:3000/mobile/index.html
2. **Production**: https://[your-render-url].onrender.com/mobile/index.html

### Device Requirements
- Mobile device (phone/tablet) OR desktop browser
- Modern browser with JavaScript enabled
- Internet connection
- Touch screen recommended (works with mouse too)

### First Time Setup
1. Open the URL on your mobile device
2. Wait for "Connected" status (green dot)
3. Map will load automatically
4. You're ready to send emergencies!

---

## 📱 Interface Layout

```
┌────────────────────────────────────┐
│ 🚨 EMERGENCY ALERT SYSTEM          │
│ Status: Connected 🟢               │
├────────────────────────────────────┤
│                                    │
│        [INTERACTIVE MAP]           │
│     (Tap to select location)       │
│                                    │
├────────────────────────────────────┤
│ Selected: None                     │
│                                    │
│ [🎲 Random Alert]                  │
│ [📍 Location Alert]                │
├────────────────────────────────────┤
│ Recent Alerts:                     │
│ • EMG_001 - ASSAULT - Resolved ✓   │
│ • EMG_002 - STALKING - Responding  │
└────────────────────────────────────┘
```

---

## 🗺️ Interactive Map

### Map Elements

**Nodes (Tap Points)**
- 🟢 **Green circles**: Available locations
- 🔴 **Red circles**: Danger zones (avoid)
- 🔵 **Blue police icons**: Patrol stations (200px exclusion)

**Visual Feedback**
- Selected node: **Yellow highlight**
- Your location: Pulsing circle
- Patrol zones: Semi-transparent blue circles

### Selecting Location

**Method 1: Manual Selection (Recommended)**
1. **Tap any green circle** on the map
2. Node highlights yellow
3. Location name appears above buttons
4. "Selected: [Zone Name]" shown

**Method 2: Random Selection (Quick Testing)**
1. Tap **"🎲 Random Alert"** button
2. System selects random valid location
3. Auto-fills form with location

### Location Rules ⚠️

**Automatic Validation:**
- ✅ Must be at least **200 pixels** away from ALL 6 patrol stations
- ✅ Cannot spawn directly on patrol stations
- ✅ Safe zones preferred (green nodes)

**If Invalid Location Selected:**
```
⚠️ Warning: "Too close to patrol! Pick another spot"
```
Solution: Select different node farther from police stations

---

## 🆘 Sending Emergency Alerts

### Method 1: Random Alert (Fast)
```
Perfect for: Testing, Demonstrations, Quick Simulations
```

1. Tap **"🎲 Random Alert"** button
2. System automatically:
   - Selects valid location (away from patrols)
   - Chooses random distress type
   - Generates unique emergency ID
   - Sends to dispatch server
3. Confirmation appears in "Recent Alerts"

**Random Distress Types:**
- 🚨 ASSAULT (immediate violence)
- 🏃 KIDNAP (abduction in progress)
- 👁️ STALKING (being followed)
- 💬 HARASSMENT (threatening behavior)

### Method 2: Location-Specific Alert
```
Perfect for: Specific scenarios, Testing danger zones, Targeted testing
```

1. **Select location** by tapping green node
2. Node turns yellow (selected state)
3. Tap **"📍 Location Alert"** button
4. Emergency sent to that specific location
5. Distress type randomly assigned

### What Happens After Sending?

**Immediate:**
- Alert ID generated (e.g., EMG_12345)
- Sent to desktop control panel via WebSocket
- Added to emergency queue
- Appears in "Recent Alerts" list

**Within 1-3 seconds:**
- Patrol assigned based on priority
- Your alert status changes: PENDING → ASSIGNED → RESPONDING

**Within 5-10 seconds:**
- Patrol arrives at location
- Status changes: RESPONDING → ENGAGED → RESOLVED
- Green checkmark ✓ appears in alert list

---

## 📊 Recent Alerts Panel

### Alert List Display
```
Recent Alerts:
┌─────────────────────────────────────┐
│ EMG_003 - ASSAULT - Resolved ✓      │
│ Patrol: PATROL_2 | 7.2s             │
├─────────────────────────────────────┤
│ EMG_002 - STALKING - Responding 🚨  │
│ Patrol: PATROL_5 | ETA: 4s          │
├─────────────────────────────────────┤
│ EMG_001 - HARASSMENT - Pending ⏳    │
│ Position in queue: 3                │
└─────────────────────────────────────┘
```

### Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| **PENDING** | ⏳ | Waiting for patrol assignment |
| **ASSIGNED** | 📋 | Patrol selected, preparing |
| **RESPONDING** | 🚨 | Patrol en route |
| **ENGAGED** | 👮 | Patrol at scene |
| **RESOLVED** | ✓ | Successfully handled |

### Understanding Your Position

**If Pending:**
- Shows position in queue (e.g., "Position: 3")
- Higher priority = lower number
- Priority increases with waiting time

**If Assigned/Responding:**
- Shows assigned patrol ID
- Displays ETA in seconds
- Can see patrol moving on desktop view

**If Resolved:**
- Shows total response time
- Green checkmark confirmation
- Patrol returned to station

---

## 🎯 Use Cases & Scenarios

### Scenario 1: Single Emergency Test
```
Purpose: Verify basic system functionality
```
1. Open mobile app
2. Tap "🎲 Random Alert"
3. Watch "Recent Alerts" for status updates
4. Verify resolution within 10 seconds
5. Check desktop view for patrol movement

### Scenario 2: Multiple Simultaneous Emergencies
```
Purpose: Test priority queue and patrol allocation
```
1. Rapidly tap "🎲 Random Alert" 3-4 times
2. Multiple emergencies appear in queue
3. Observe which gets served first (priority-based)
4. Higher severity (assault/kidnap) prioritized

### Scenario 3: Danger Zone Testing
```
Purpose: Test pathfinding around dangerous areas
```
1. On desktop, mark 2-3 nodes as danger zones (red)
2. On mobile, send emergency near/beyond danger zone
3. Observe patrol takes longer route (avoiding danger)
4. Safer but slower response time

### Scenario 4: Zone Risk Pattern
```
Purpose: Build zone intelligence history
```
1. Send 5-6 emergencies to same zone
2. Zone risk level increases
3. Future emergencies in that zone get higher priority
4. Demonstrates hash table learning

---

## 🔔 Notifications & Feedback

### Visual Feedback

**When Alert Sent:**
- Alert appears in "Recent Alerts" instantly
- Status shows "PENDING"
- Node on map marked with emergency icon (desktop view)

**When Patrol Assigned:**
- Status changes to "ASSIGNED" → "RESPONDING"
- Shows patrol ID and ETA
- Can see orange dotted line (patrol path) on desktop

**When Resolved:**
- Status changes to "RESOLVED ✓"
- Total response time displayed
- Green checkmark animation

### Connection Status

**Top Bar Indicators:**
- 🟢 **Connected**: Ready to send alerts
- 🔴 **Disconnected**: Cannot send, attempting reconnect
- 🟡 **Connecting...**: Initial connection or reconnecting

**If Disconnected:**
1. Check internet connection
2. Wait for automatic reconnect (every 3 seconds)
3. Page will say "Reconnecting..."
4. Once reconnected, send alerts normally

---

## ⚠️ Important Constraints

### 200px Patrol Exclusion Zone

**Why This Rule?**
- Prevents spawning emergencies directly on patrol stations
- Forces realistic dispatch scenarios
- Tests pathfinding algorithms properly

**Patrol Station Locations:**
1. **PATROL_1**: (910, 605) - East Station
2. **PATROL_2**: (210, 385) - Northwest Station
3. **PATROL_3**: (350, 825) - Southwest Station
4. **PATROL_4**: (70, 605) - West Station
5. **PATROL_5**: (1330, 605) - Far East Station
6. **PATROL_6**: (1190, 165) - Northeast Station

**If Warning Appears:**
```
⚠️ "Too close to patrol! Pick another spot"
```
**Solution**: Choose node farther from visible patrol stations

### Minimum Travel Time

**1 Second Minimum:**
- Even if patrol is at adjacent node
- Minimum 1 second to reach emergency
- Simulates realistic response time
- Tests patience of priority queue

---

## 🎮 Quick Actions Guide

### For Testing
```bash
# Send 1 emergency
Tap "🎲 Random Alert"

# Send multiple (rapid fire)
Tap "🎲 Random Alert" 5 times quickly

# Test specific location
1. Tap green node
2. Tap "📍 Location Alert"

# Clear test data (on desktop)
Click "Reset System" button
```

### For Demonstrations
```bash
# Scenario 1: Single emergency
1. Explain system overview
2. Send 1 random alert
3. Show patrol dispatch on desktop
4. Point out response time

# Scenario 2: Priority queue
1. Send 3 alerts rapidly
2. Show they queue on desktop
3. Explain priority calculation
4. Watch highest priority served first

# Scenario 3: Danger zones
1. Mark danger zones on desktop
2. Send emergency beyond danger zone
3. Show path avoids danger (longer route)
4. Explain safety > speed trade-off
```

---

## 🐛 Troubleshooting

### Problem: "Cannot send alert"
**Symptoms:** Button does nothing, no alert appears

**Solutions:**
1. Check connection status (must be green)
2. Verify location selected (if using Location Alert)
3. Check console (F12 on mobile browser)
4. Refresh page (pull down to refresh)
5. Restart mobile browser

### Problem: "Too close to patrol" warning
**Symptoms:** Red warning appears when trying to select location

**Solutions:**
1. Choose different node farther away
2. Use "🎲 Random Alert" instead (auto-selects valid location)
3. Zoom in on map to see patrol stations clearly
4. Select nodes on opposite side of map

### Problem: "Alert stuck in PENDING"
**Symptoms:** Status never changes from PENDING

**Solutions:**
1. Wait 5-10 seconds (system may be processing queue)
2. Check if multiple higher-priority emergencies exist
3. Verify patrol units available (check desktop)
4. Refresh desktop page if patrols appear stuck
5. Use "Reset System" button on desktop

### Problem: "Connection keeps dropping"
**Symptoms:** Frequent red/green status changes

**Solutions:**
1. Check WiFi signal strength
2. Move closer to router
3. Disable mobile data (use WiFi only)
4. Check server is running (localhost:3000)
5. Try different browser

---

## 📏 Best Practices

### For Accurate Testing
1. ✅ Send one emergency at a time initially
2. ✅ Wait for full resolution before next
3. ✅ Use "Random Alert" for unbiased testing
4. ✅ Check both mobile and desktop views
5. ✅ Reset system between major test runs

### For Demonstrations
1. ✅ Pre-test before audience arrives
2. ✅ Have backup device ready
3. ✅ Use large screen for desktop view
4. ✅ Explain each step clearly
5. ✅ Show mobile and desktop side-by-side

### For Load Testing
1. ✅ Send 5-10 rapid alerts
2. ✅ Observe queue management
3. ✅ Check no alerts dropped
4. ✅ Verify all eventually resolve
5. ✅ Monitor response time trends

---

## 💡 Understanding the System

### Why Mobile + Desktop?
```
Mobile = Citizen reporting (real-world phone)
Desktop = Dispatcher view (police control room)
```
This simulates real emergency dispatch workflow:
1. Citizen calls 911 (mobile alert)
2. Dispatcher receives call (desktop queue)
3. Dispatcher assigns patrol (automatic)
4. Patrol responds (visible on both)

### Real-World Parallel
```
Your Mobile App ≈ 911 Phone Call
Desktop Panel ≈ Police Dispatch Center
Patrols ≈ Police Units on Street
Priority Queue ≈ Emergency Triage System
```

### Data Flow
```
Mobile Tap
    ↓
WebSocket
    ↓
Server (Priority Queue)
    ↓
Pathfinding (Dijkstra)
    ↓
Patrol Dispatch
    ↓
Status Updates
    ↓
Both Screens
```

---

## 🎓 Educational Value

### Concepts Demonstrated
1. **Client-Server Architecture**: Mobile client, centralized server
2. **Real-time Communication**: WebSocket bidirectional updates
3. **Priority Queue**: Not first-come-first-served
4. **Spatial Validation**: 200px exclusion zone
5. **State Management**: PENDING → ASSIGNED → RESPONDING → RESOLVED

### Learning Outcomes
- Understanding emergency dispatch logic
- Seeing data structures in action
- Experiencing real-time systems
- Observing algorithmic decision-making
- Appreciating optimization trade-offs

---

## 📱 Mobile-Specific Tips

### On iPhone/iPad
1. Add to Home Screen for app-like experience
2. Use Safari for best compatibility
3. Allow location services (if implemented)
4. Enable notifications (future feature)

### On Android
1. Use Chrome or Firefox
2. Can add to home screen
3. Works in incognito mode
4. Compatible with all screen sizes

### On Tablet
1. Larger tap targets (easier to select)
2. Can view mobile + desktop side-by-side
3. Better for demonstrations
4. Split screen mode supported

---

## 🔐 Privacy & Safety

### This is a Simulation
- ❌ No real emergencies sent
- ❌ No real police notified
- ❌ No personal data collected
- ❌ No location tracking
- ✅ Safe for testing/learning

### Educational Use Only
```
⚠️ DO NOT USE for real emergencies
⚠️ Always call your local emergency number (911, 112, etc.)
⚠️ This is a college project demonstration
```

---

## ✅ Quick Start Checklist

**First Time Users:**
- [ ] Open mobile URL
- [ ] Wait for "Connected" status
- [ ] Tap "🎲 Random Alert" once
- [ ] Watch alert status change
- [ ] See response time
- [ ] Understand basic flow

**For Demonstrations:**
- [ ] Test connection before demo
- [ ] Have desktop view ready
- [ ] Prepare 3-4 scenarios
- [ ] Know how to explain priority
- [ ] Can show danger zone effect

**For Testing:**
- [ ] Reset system first
- [ ] Send alerts one at a time
- [ ] Record response times
- [ ] Note any anomalies
- [ ] Test reconnection

---

## 📞 Support

**Connection Issues:**
- Verify server running: `node server/server.js`
- Check port 3000 accessible
- Try different browser
- Refresh page

**Alert Issues:**
- Check location validity (200px rule)
- Verify desktop connected
- Look for patrol availability
- Reset system if stuck

**Performance Issues:**
- Close other browser tabs
- Clear browser cache
- Check internet speed
- Use WiFi instead of mobile data

---

## 🎯 Success Indicators

**System Working Correctly:**
✅ Connection status shows green
✅ Alerts appear in list immediately
✅ Status changes from PENDING → RESOLVED
✅ Response times under 15 seconds
✅ No error messages
✅ Patrols moving on desktop view

**System Needs Attention:**
❌ Connection status red for >10 seconds
❌ Alerts stuck in PENDING
❌ No patrol assignment
❌ Error messages in console
❌ Extremely slow response times (>30s)

---

## 📖 Related Documentation

- **Desktop Guide**: DESKTOP_USER_GUIDE.md
- **Data Structures**: DATA_STRUCTURES_GUIDE.md
- **Tech Stack**: TECH_STACK_GUIDE.md
- **System Analysis**: SYSTEM_ANALYSIS.md

---

*Last Updated: January 8, 2026*
*Version: 1.0.0*
*Platform: Mobile Web (Responsive)*
*System: Women Safety Emergency Dispatch Simulation*
