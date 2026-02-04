# 📄 Women Safety Emergency Dispatch System: Project Write-up

## 1. Problem Statement
In many urban environments, emergency response systems for women's safety are often reactive rather than proactive. Existing systems frequently suffer from:
- **Inefficient Dispatching**: Handling emergencies on a First-In-First-Out (FIFO) basis without considering the severity of the incident (e.g., matching a stalker report with the same priority as an active assault).
- **Static Routing**: Navigational tools often suggest the shortest geographic path, which may lead emergency responders through high-risk or congested zones, delaying critical help.
- **Lack of Real-time Coordination**: Disconnects between the victim's location, the nearest patrol's status, and the central command unit results in "blind spots" during the golden hour of response.
- **Data Underutilization**: Incident history for specific zones is rarely used to dynamically adjust response priorities or patrol routes in real-time.

---

## 2. Objectives
The primary goal of this project is to develop an **Intelligent Emergency Dispatch System** that leverages advanced Data Structures and Algorithms (DSA) to optimize response times and safety.

Key objectives include:
1. **Dynamic Priority Management**: Implement a system that automatically ranks emergencies based on distress type severity, time elapsed, and local risk levels.
2. **Safest-Path Pathfinding**: Develop a routing engine that prioritizes "safe" routes over strictly "short" routes by penalizing paths through identified danger zones.
3. **Real-time Visualization**: Create a unified dashboard for administrators and a simple reporting interface for citizens to ensure zero-latency communication.
4. **Predictive Intelligence**: Use historical data to maintain "Zone Risk Profiles," allowing the system to anticipate high-risk areas and adjust dispatch logic accordingly.

---

## 3. Methodology
Our methodology integrates real-time networking with classic computer science algorithms to create a cohesive safety net.

### A. System Architecture
The project follows a client-server architecture using **WebSockets** for persistent, low-latency communication.
- **Backend (Node.js)**: Serves as the brain, managing the global state and executing the core DSA modules.
- **Frontend (Vanilla JS/SVG)**: Provides a high-performance visual representation of the city map, patrols, and active emergencies.

### B. Core Algorithmic Workflow
The system operates in a continuous loop:
1. **Event Trigger**: A user reports an emergency via the mobile interface.
2. **Risk Assessment**: The system performs an $O(1)$ lookup in a **Hash Table** to retrieve the risk profile of the incident zone.
3. **Prioritization**: The incident is added to a **Max-Heap (Priority Queue)**. The priority score is calculated dynamically ($Priority = Severity + Time + Risk$).
4. **Optimal Dispatch**: The dispatcher extracts the highest-priority item from the heap and identifies the nearest available patrol.
5. **Pathfinding**: **Dijkstra’s Algorithm** is run on an **Adjacency List Graph** of the city to calculate the safest route to the victim, avoiding areas marked as "danger zones."
6. **Execution & Feedback**: The patrol icon moves in real-time along the calculated path, providing visual reassurance to the victim and status updates to the administrator.

### C. Data Persistence
To ensure reliability, the system periodically serializes its state (Zone Intelligence and History) to JSON files, allowing the system to recover its "learned" risk data even after a server restart.
