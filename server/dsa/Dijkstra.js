/**
 * DIJKSTRA'S ALGORITHM - Safest Path Finder
 * 
 * ============================================
 * WHY DIJKSTRA FOR THIS SYSTEM?
 * ============================================
 * 
 * PROBLEM: Patrol needs to reach emergency, but which route?
 * - Shortest distance might go through danger zone (unsafe)
 * - Random path might waste time (victim waiting)
 * - Need guaranteed optimal path considering both distance AND safety
 * 
 * SOLUTION: Modified Dijkstra with Risk-Weighted Edges
 * - Finds path with minimum total "cost" (time + danger penalty)
 * - Danger zones have 3x edge weight → algorithm naturally avoids them
 * - Guarantees optimal path given current city state
 * 
 * WHY NOT ALTERNATIVES?
 * - BFS: Only works for unweighted graphs (our edges have travel times)
 * - DFS: Doesn't guarantee shortest path
 * - A*: Requires heuristic (Dijkstra is complete solution)
 * - Bellman-Ford: Slower O(VE) vs Dijkstra's O((V+E) log V)
 * 
 * REAL-WORLD APPLICATION:
 * - Emergency vehicles use GPS routing (modified Dijkstra)
 * - Considers real-time traffic (like our danger zones)
 * - Police dispatch systems compute optimal response routes
 * 
 * ============================================
 * CRITICAL DIFFERENCE FROM STANDARD DIJKSTRA:
 * ============================================
 * 
 * Standard: Minimize distance
 * This System: Minimize risk-weighted travel time
 * 
 * Example:
 * - Path A: 5 minutes, through danger zone (weight = 15 mins)
 * - Path B: 8 minutes, all safe zones (weight = 8 mins)
 * → Algorithm chooses Path B (safer, even if longer)
 * 
 * Result: Patrols take SAFEST route, not necessarily shortest
 */

class DijkstraPathFinder {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Find safest path from source to destination
     * 
     * @param {string} source - Starting node ID
     * @param {string} destination - Target node ID
     * @returns {Object} { path: [], totalTime: number, pathType: string, rejectedPath: [] }
     * 
     * Time Complexity: O((V + E) log V) with min-heap
     * Space Complexity: O(V)
     */
    findSafestPath(source, destination) {
        // Initialize data structures
        const distances = new Map(); // Minimum travel time to each node
        const previous = new Map();  // Previous node in optimal path
        const visited = new Set();   // Visited nodes
        
        // Priority queue: [{ nodeId, distance }] sorted by distance
        const priorityQueue = [];
        
        // Initialize all distances to infinity
        for (let node of this.graph.getAllNodes()) {
            distances.set(node.id, Infinity);
        }
        distances.set(source, 0);
        
        // Start with source node
        priorityQueue.push({ nodeId: source, distance: 0 });
        
        // Main Dijkstra loop
        while (priorityQueue.length > 0) {
            // Get node with minimum distance (extract-min operation)
            priorityQueue.sort((a, b) => a.distance - b.distance);
            const { nodeId: currentNode } = priorityQueue.shift();
            
            // Skip if already visited
            if (visited.has(currentNode)) continue;
            visited.add(currentNode);
            
            // Found destination
            if (currentNode === destination) {
                break;
            }
            
            // Explore neighbors
            const neighbors = this.graph.getNeighbors(currentNode);
            
            for (let edge of neighbors) {
                const neighborId = edge.neighbor;
                
                if (visited.has(neighborId)) continue;
                
                // Calculate new distance through current node
                // CRITICAL: edge.weight is already adjusted for danger zones
                const newDistance = distances.get(currentNode) + edge.weight;
                
                // Relaxation step: update if found better path
                if (newDistance < distances.get(neighborId)) {
                    distances.set(neighborId, newDistance);
                    previous.set(neighborId, {
                        nodeId: currentNode,
                        isDangerZone: edge.isDangerZone
                    });
                    
                    // Add to priority queue
                    priorityQueue.push({
                        nodeId: neighborId,
                        distance: newDistance
                    });
                }
            }
        }
        
        // Reconstruct path
        const path = this._reconstructPath(previous, source, destination);
        const totalTime = distances.get(destination);
        
        // Check if path goes through danger zones
        const pathType = this._classifyPath(path, previous);
        
        // Calculate rejected (shortest) path for comparison
        const rejectedPath = this._findShortestPathIgnoringDanger(source, destination);
        
        return {
            path: path,
            totalTime: totalTime === Infinity ? -1 : totalTime,
            pathType: pathType,
            rejectedPath: rejectedPath,
            dangerZonesAvoided: this._countDangerZonesAvoided(path, rejectedPath)
        };
    }

    /**
     * Reconstruct path from source to destination using previous map
     */
    _reconstructPath(previous, source, destination) {
        const path = [];
        let current = destination;
        
        // Backtrack from destination to source
        while (current !== undefined) {
            const node = this.graph.getNode(current);
            path.unshift({
                nodeId: current,
                x: node?.x || 0,
                y: node?.y || 0,
                name: node?.name || current
            });
            
            const prev = previous.get(current);
            current = prev?.nodeId;
            
            // Safety check to prevent infinite loops
            if (path.length > 100) break;
        }
        
        // Verify path starts at source
        if (path.length > 0 && path[0].nodeId === source) {
            return path;
        }
        
        return []; // No valid path found
    }

    /**
     * Classify path type based on danger zones encountered
     */
    _classifyPath(path, previous) {
        if (path.length === 0) return 'no_path';
        
        let hasDangerZones = false;
        
        for (let i = 1; i < path.length; i++) {
            const nodeId = path[i].nodeId;
            const prevInfo = previous.get(nodeId);
            
            if (prevInfo?.isDangerZone) {
                hasDangerZones = true;
                break;
            }
        }
        
        return hasDangerZones ? 'danger_path' : 'safe_path';
    }

    /**
     * Find shortest path ignoring danger zones (for comparison)
     * This shows what path would be chosen without safety consideration
     */
    _findShortestPathIgnoringDanger(source, destination) {
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const priorityQueue = [];
        
        for (let node of this.graph.getAllNodes()) {
            distances.set(node.id, Infinity);
        }
        distances.set(source, 0);
        
        priorityQueue.push({ nodeId: source, distance: 0 });
        
        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => a.distance - b.distance);
            const { nodeId: currentNode } = priorityQueue.shift();
            
            if (visited.has(currentNode)) continue;
            visited.add(currentNode);
            
            if (currentNode === destination) break;
            
            const neighbors = this.graph.getNeighbors(currentNode);
            
            for (let edge of neighbors) {
                const neighborId = edge.neighbor;
                if (visited.has(neighborId)) continue;
                
                // Use BASE weight, ignoring danger penalties
                const newDistance = distances.get(currentNode) + edge.baseWeight;
                
                if (newDistance < distances.get(neighborId)) {
                    distances.set(neighborId, newDistance);
                    previous.set(neighborId, { nodeId: currentNode });
                    priorityQueue.push({ nodeId: neighborId, distance: newDistance });
                }
            }
        }
        
        return this._reconstructPath(previous, source, destination);
    }

    /**
     * Count how many danger zones were avoided
     */
    _countDangerZonesAvoided(safePath, shortestPath) {
        const safePathNodes = new Set(safePath.map(n => n.nodeId));
        const shortestPathNodes = new Set(shortestPath.map(n => n.nodeId));
        
        let dangerZonesInShortest = 0;
        let dangerZonesInSafe = 0;
        
        for (let nodeId of shortestPathNodes) {
            if (this.graph.dangerZones.has(nodeId)) {
                dangerZonesInShortest++;
            }
        }
        
        for (let nodeId of safePathNodes) {
            if (this.graph.dangerZones.has(nodeId)) {
                dangerZonesInSafe++;
            }
        }
        
        return dangerZonesInShortest - dangerZonesInSafe;
    }

    /**
     * Find all paths within time threshold (for patrol selection)
     * Returns multiple patrols that can reach destination quickly
     */
    findAllPathsWithinThreshold(sources, destination, maxTime) {
        const results = [];
        
        for (let source of sources) {
            const result = this.findSafestPath(source, destination);
            
            if (result.totalTime !== -1 && result.totalTime <= maxTime) {
                results.push({
                    source: source,
                    ...result
                });
            }
        }
        
        // Sort by total time (fastest first)
        results.sort((a, b) => a.totalTime - b.totalTime);
        
        return results;
    }

    /**
     * Calculate route statistics for visualization
     */
    getRouteStatistics(path) {
        if (path.length < 2) {
            return {
                totalSegments: 0,
                safeSegments: 0,
                dangerSegments: 0,
                estimatedTime: 0
            };
        }
        
        let totalSegments = path.length - 1;
        let dangerSegments = 0;
        let totalTime = 0;
        
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i].nodeId;
            const to = path[i + 1].nodeId;
            
            const neighbors = this.graph.getNeighbors(from);
            const edge = neighbors.find(n => n.neighbor === to);
            
            if (edge) {
                totalTime += edge.weight;
                if (edge.isDangerZone) {
                    dangerSegments++;
                }
            }
        }
        
        return {
            totalSegments,
            safeSegments: totalSegments - dangerSegments,
            dangerSegments,
            estimatedTime: Math.round(totalTime)
        };
    }
}

module.exports = DijkstraPathFinder;
