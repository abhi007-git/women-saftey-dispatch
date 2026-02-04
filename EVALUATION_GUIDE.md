# 🎓 DSA Lab Project: Evaluation & Examiner Guide

## 1. Project Core: What, How, and Why?
**What is it?**
A real-time "Command and Control" system for women's safety that intelligently routes police patrols to victims.

**How does it work?**
It uses a Node.js backend to maintain a live "City Graph." When an emergency (e.g., Kidnapping) is reported, the system calculates a priority score, places it in a heap, finds the safest path using Dijkstra's, and pushes movement updates to the browser using WebSockets.

**Why did we build it?**
To demonstrate that Data Structures aren't just for coding interviews; they are the fundamental building blocks of critical infrastructure like emergency services.

---

## 2. DSA Deep-Dive (The "Brain" of the App)

### I. Priority Queue (Max-Heap)
- **Use Case**: Managing the dispatch queue.
- **How**: It uses an array-based Max-Heap where the root always contains the most urgent emergency.
- **Complexity**: $O(\log n)$ for insertion and extraction.
- **Why not a sorted array?** A sorted array requires $O(n)$ for insertion. In a city with hundreds of simultaneous reports, $O(\log n)$ is significantly more efficient.

### II. Hash Table (Chaining)
- **Use Case**: Storing "Zone Intelligence" (Risk levels per area).
- **How**: We use a custom hash function ($Sum \text{ of } ASCII \% \text{ Size}$) and handle collisions with **Chaining** (Linked Lists in each bucket).
- **Complexity**: $O(1)$ average case for lookups.
- **Why not a search tree?** We only need key-value lookups by Zone ID. A Hash Table gives us constant time access, which is faster than the $O(\log n)$ of a balanced BST.

### III. Graph (Adjacency List)
- **Use Case**: Representing the city road network.
- **How**: An object/map where keys are nodes and values are lists of neighbor objects (neighbor ID, weight).
- **Complexity**: $O(V + E)$ space efficiency.
- **Why not an Adjacency Matrix?** Cities are "sparse" graphs (most intersections only connect to 3-4 roads). A matrix would be $O(V^2)$ storage, wasting space on zeros. An adjacency list only stores existing connections.

### IV. Dijkstra’s Algorithm
- **Use Case**: Finding the safest route.
- **How**: It finds the shortest weighted path. We modify the "weight" dynamically: if an area is a "Danger Zone," we multiply the edge weight by 3x, forcing the algorithm to find a detour unless the danger zone is the only option.
- **Complexity**: $O((V+E) \log V)$ using a priority queue.

---

## 3. Tech Stack Rationale

| Technology | Role | Why only this? |
|------------|------|----------------|
| **Node.js** | Backend | Allows us to use the same language (JS) for the frontend and the complex DSA logic on the backend. Its event loop is perfect for handling many simultaneous WebSocket connections. |
| **Vanilla JS** | Logic | **Why no React?** For a DSA lab, using frameworks hides the implementation. Writing it in "Vanilla" JS proves that we understand the DOM and the algorithms without relying on "black-box" libraries. |
| **WebSockets** | Real-time | **Why not REST?** REST requires polling (asking the server every 1s for updates), which adds massive overhead. WebSockets keep a permanent pipe open for 20FPS movement updates. |
| **SVG** | Visualization| **Why not Canvas?** SVG elements are part of the DOM. This allows us to attach event listeners (like "Click to Toggle Danger") directly to city nodes/roads easily. |

---

## 4. Examiner FAQ (Potential Questions & Answers)

**Q1: Why did you use a Heap instead of just sorting an array every time a new emergency comes?**
*Answer*: Sorting takes $O(n \log n)$. If we have 100 emergencies, sorting 100 times for every new report is wasteful. A Heap allows us to "bubble up" a new element in $O(\log n)$, which is much faster for dynamic updates.

**Q2: What happens if your Hash Table has too many collisions?**
*Answer*: The performance degrades from $O(1)$ towards $O(n)$ (linear search through the chain). To prevent this, we chose a prime-based hash and a table size proportional to our expected data (Load Factor management).

**Q3: How does your system handle "Starvation" (A low-priority emergency never being handled)?**
*Answer*: We implemented **Priority Aging**. The priority formula includes `Time Waiting`. Every second, the score increases slightly. Eventually, even a "Harassment" report will outweigh a new "Assault" report if it has been waiting too long.

**Q4: Can this system handle 10,000 nodes?**
*Answer*: The backend DSA (Dijkstra/Heap) would handle it fine. However, the SVG frontend might lag because it creates 10,000 DOM elements. For that scale, we would switch from SVG to Canvas rendering.

**Q5: What is better about your system than standard Google Maps?**
*Answer*: Google Maps optimizes for **Time**. Our system optimizes for **Safety + Urgency**. We allow admins to manually flag "Danger Zones" which immediately reroutes all active patrols—feature Google doesn't offer for emergency dispatch.
