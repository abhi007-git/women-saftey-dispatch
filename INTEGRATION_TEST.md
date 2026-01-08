# 🔬 INTEGRATION TEST PROTOCOL

## Test Environment Setup
1. Start server: `node server/server.js`
2. Open Desktop UI: `http://localhost:3000/desktop/`
3. Open Mobile UI (separate browser/tab): `http://localhost:3000/mobile/`

---

## ✅ Test Suite 1: Mobile → Desktop Synchronization

### Test 1.1: Alert Sending
**Steps:**
1. On MOBILE: Click any node on map
2. Select distress type (e.g., "Assault")
3. Add description: "Test alert from mobile"
4. Click "Send Emergency Alert"

**Expected Results:**
- ✓ Mobile shows green success toast
- ✓ Desktop instantly shows new red emergency marker on map
- ✓ Desktop Priority Queue panel updates with new alert
- ✓ Desktop shows patrol assignment (if available)
- ✓ Mobile alert list shows status changing from PENDING → ASSIGNED/RESPONDING

**Validation:** Alert appears on desktop within 1 second

---

### Test 1.2: Multiple Rapid Alerts
**Steps:**
1. On MOBILE: Send 3 alerts quickly (different locations)

**Expected Results:**
- ✓ All 3 appear on desktop immediately
- ✓ Priority queue orders them correctly by risk
- ✓ Patrols get assigned based on availability
- ✓ No duplicate alerts
- ✓ No missing alerts

**Validation:** All alerts synchronized, priority order correct

---

## ✅ Test Suite 2: Desktop → Mobile Synchronization

### Test 2.1: Danger Zone Toggle
**Steps:**
1. On DESKTOP: Click any blue node to make it a danger zone (turns red)
2. Check MOBILE immediately

**Expected Results:**
- ✓ Mobile map updates within 1 second
- ✓ Node turns red on mobile
- ✓ Surrounding edges may turn red if affected
- ✓ Risk calculations update

**Validation:** Click desktop node, see mobile update < 1 second

---

### Test 2.2: Multiple Danger Zones
**Steps:**
1. On DESKTOP: Toggle 5 different nodes to danger zones
2. Monitor MOBILE

**Expected Results:**
- ✓ All 5 nodes update on mobile
- ✓ Map re-renders correctly
- ✓ No visual glitches
- ✓ Edges connected to danger zones update

**Validation:** All changes reflected on mobile

---

## ✅ Test Suite 3: Bidirectional Real-Time Updates

### Test 3.1: Patrol Movement Tracking
**Steps:**
1. On MOBILE: Send alert from node N42 (middle area)
2. On DESKTOP: Watch patrol assignment and movement
3. On MOBILE: Watch same patrol in alert status panel

**Expected Results:**
- ✓ Desktop shows patrol moving toward N42 with blue path line
- ✓ Mobile shows "ASSIGNED" → "RESPONDING" → "RESOLVED"
- ✓ Both UIs show same patrol position
- ✓ Patrol follows shortest path (Dijkstra working)
- ✓ Status updates every 1 second on both

**Validation:** Patrol visible and synchronized on both UIs

---

### Test 3.2: Queue Updates During Activity
**Steps:**
1. Send 3 alerts from mobile (create queue)
2. Watch desktop priority queue panel
3. As patrols resolve, watch queue shrink

**Expected Results:**
- ✓ Queue shows all 3 alerts in priority order
- ✓ As each resolves, queue updates immediately
- ✓ Mobile shows status changes matching queue state
- ✓ Hash table stats update (insert/delete operations visible)

**Validation:** Queue and statuses stay synchronized

---

## ✅ Test Suite 4: Network Resilience

### Test 4.1: Connection Loss & Recovery
**Steps:**
1. Stop server (`Ctrl+C`)
2. Check both desktop and mobile
3. Restart server
4. Wait 3 seconds (auto-reconnect)

**Expected Results:**
- ✓ Both UIs show "Disconnected" status
- ✓ After restart, both auto-reconnect
- ✓ Full state restored on both UIs
- ✓ Can send alerts again
- ✓ Map renders correctly

**Validation:** Clean reconnection with state restoration

---

### Test 4.2: Stale Data Prevention
**Steps:**
1. Disconnect mobile browser network (DevTools → Network → Offline)
2. On desktop, toggle 3 danger zones
3. Reconnect mobile

**Expected Results:**
- ✓ Mobile receives full state update on reconnect
- ✓ All 3 danger zones appear correctly
- ✓ No stale map data
- ✓ Queue and patrols up-to-date

**Validation:** State fully synchronized after reconnection

---

## ✅ Test Suite 5: Error Handling & Edge Cases

### Test 5.1: Invalid Alert Data
**Steps:**
1. On MOBILE: Try sending alert WITHOUT selecting location

**Expected Results:**
- ✓ Red error toast appears
- ✓ Alert NOT sent to server
- ✓ Form stays populated
- ✓ No crash or console errors

**Validation:** Validation prevents bad data

---

### Test 5.2: Rapid Toggle Spam
**Steps:**
1. On DESKTOP: Click same node 20 times rapidly

**Expected Results:**
- ✓ Node toggles correctly each time
- ✓ Mobile updates without lag
- ✓ No race conditions
- ✓ Final state matches last click
- ✓ No duplicate broadcasts

**Validation:** System handles rapid inputs gracefully

---

### Test 5.3: All Patrols Busy
**Steps:**
1. Send 11 alerts (more than 10 patrols)

**Expected Results:**
- ✓ First 10 get assigned
- ✓ 11th waits in queue
- ✓ When patrol finishes, 11th gets assigned
- ✓ Priority queue shows waiting alert
- ✓ No system crash

**Validation:** Queue management works correctly

---

## 🎯 Test Suite 6: DSA Visibility & Correctness

### Test 6.1: Dijkstra Path Verification
**Steps:**
1. Send alert from N99 (bottom-right corner)
2. Note which patrol responds from which station
3. Count edges in displayed path

**Expected Results:**
- ✓ Patrol takes shortest path (verify manually)
- ✓ Path renders as blue SVG line
- ✓ No diagonal shortcuts through non-edges
- ✓ Dijkstra explanation panel updates
- ✓ Shows visited nodes count

**Validation:** Path is provably shortest

---

### Test 6.2: Priority Queue Ordering
**Steps:**
1. Create 3 alerts:
   - Low risk area (e.g., N00)
   - High risk area (danger zone)
   - Medium risk area
2. Check desktop priority queue panel

**Expected Results:**
- ✓ High risk alert at top
- ✓ Medium risk in middle
- ✓ Low risk at bottom
- ✓ Priority values calculated correctly
- ✓ Max-heap property visible

**Validation:** Queue ordering follows priority rules

---

### Test 6.3: Hash Table Operations
**Steps:**
1. Send 5 alerts
2. Watch Hash Table panel on desktop
3. Resolve 2 alerts
4. Send 3 more

**Expected Results:**
- ✓ Insert count increases with each alert
- ✓ Delete count increases with resolutions
- ✓ Load factor updates
- ✓ Bucket distribution visible
- ✓ No collisions (good hash function)

**Validation:** Hash table stats accurate

---

## 📊 Success Criteria

**PASS Requirements:**
- ✅ All mobile alerts appear on desktop < 1 second
- ✅ All desktop danger zone changes update mobile < 1 second
- ✅ Patrol movements synchronized on both UIs
- ✅ Queue stays in sync across interfaces
- ✅ No crashes on any test case
- ✅ Reconnection restores full state
- ✅ All DSA visualizations update correctly
- ✅ Validation prevents bad data
- ✅ Error messages are user-friendly
- ✅ No console errors during normal operation

**FAIL Indicators:**
- ❌ Alerts take > 2 seconds to appear
- ❌ Danger zones don't update on mobile
- ❌ Patrol positions differ between UIs
- ❌ Queue order incorrect
- ❌ Crashes on edge cases
- ❌ Stale data after reconnect
- ❌ Missing validation errors
- ❌ Console full of errors

---

## 🚀 Quick Smoke Test (2 minutes)

1. **Start system** - Server running, both UIs open
2. **Mobile → Desktop** - Send 1 alert, see it on desktop
3. **Desktop → Mobile** - Toggle 1 danger zone, see on mobile
4. **Patrol movement** - Watch patrol move to alert on both UIs
5. **Queue** - Check priority queue updates on desktop

**If all 5 work: System is OPERATIONAL ✅**

---

## 📝 Test Log Template

```
Date: _______________
Tester: _______________

Test Suite 1: [PASS/FAIL]
  - 1.1: [PASS/FAIL] - Notes: _________________
  - 1.2: [PASS/FAIL] - Notes: _________________

Test Suite 2: [PASS/FAIL]
  - 2.1: [PASS/FAIL] - Notes: _________________
  - 2.2: [PASS/FAIL] - Notes: _________________

Test Suite 3: [PASS/FAIL]
  - 3.1: [PASS/FAIL] - Notes: _________________
  - 3.2: [PASS/FAIL] - Notes: _________________

Test Suite 4: [PASS/FAIL]
  - 4.1: [PASS/FAIL] - Notes: _________________
  - 4.2: [PASS/FAIL] - Notes: _________________

Test Suite 5: [PASS/FAIL]
  - 5.1: [PASS/FAIL] - Notes: _________________
  - 5.2: [PASS/FAIL] - Notes: _________________
  - 5.3: [PASS/FAIL] - Notes: _________________

Test Suite 6: [PASS/FAIL]
  - 6.1: [PASS/FAIL] - Notes: _________________
  - 6.2: [PASS/FAIL] - Notes: _________________
  - 6.3: [PASS/FAIL] - Notes: _________________

OVERALL: [PASS/FAIL]
Issues Found: _______________________________________
```
