/**
 * GRAPH - City Road Network
 * 
 * ============================================
 * WHY GRAPH FOR THIS SYSTEM?
 * ============================================
 * 
 * PROBLEM: A city is NOT a grid - it's a network of interconnected zones
 * - Some areas are connected, others aren't
 * - Travel times vary (highways vs residential streets)
 * - Danger zones make certain routes unsafe
 * 
 * SOLUTION: Weighted Graph Models Real City Structure
 * - Nodes = City zones/intersections
 * - Edges = Roads between zones  
 * - Weights = Travel time (modified by danger)
 * 
 * WHY NOT ALTERNATIVES?
 * - 2D Array/Grid: Assumes all neighbors are connected (unrealistic)
 * - Tree: Cities have cycles (you can take multiple routes)
 * - Simple List: Can't represent relationships between zones
 * 
 * REAL-WORLD APPLICATION:
 * - Google Maps uses weighted graphs for routing
 * - Emergency services use road network graphs
 * - This system models SAFEST path, not just shortest
 * 
 * ============================================
 * CRITICAL FEATURE: DYNAMIC WEIGHTS
 * ============================================
 * 
 * When admin toggles a node to "danger zone":
 * 1. All edges touching that zone get 3x weight penalty
 * 2. Patrols will avoid that area (longer but safer route)
 * 3. Simulates real-world: "protesters blocking road" → take detour
 * 
 * This is NOT just a shortest path problem:
 * → It's a SAFEST path problem (risk-aware routing)
 */

class CityGraph {
    constructor() {
        // Adjacency list representation: { nodeId: [{ neighbor, weight, isDangerZone }] }
        this.adjacencyList = new Map();
        
        // Node metadata: { nodeId: { x, y, name, type } }
        this.nodes = new Map();
        
        // Danger zones (dynamically updated from desktop UI)
        this.dangerZones = new Set();
        
        // Base weights (original travel times before danger zone adjustment)
        this.baseWeights = new Map();
        
        // Danger zone penalty multiplier
        this.dangerPenaltyMultiplier = 3.0; // 3x normal travel time
    }

    /**
     * Add node (intersection/zone) to graph
     */
    addNode(nodeId, metadata = {}) {
        if (!this.adjacencyList.has(nodeId)) {
            this.adjacencyList.set(nodeId, []);
            this.nodes.set(nodeId, {
                id: nodeId,
                x: metadata.x || 0,
                y: metadata.y || 0,
                name: metadata.name || nodeId,
                type: metadata.type || 'intersection'
            });
        }
    }

    /**
     * Add edge (road) between two nodes
     * @param {string} from - Source node ID
     * @param {string} to - Destination node ID
     * @param {number} weight - Base travel time in seconds
     * @param {boolean} bidirectional - If true, adds edge in both directions
     */
    addEdge(from, to, weight, bidirectional = true) {
        // Ensure nodes exist
        if (!this.adjacencyList.has(from)) this.addNode(from);
        if (!this.adjacencyList.has(to)) this.addNode(to);
        
        // Store base weight
        const edgeKey = `${from}-${to}`;
        this.baseWeights.set(edgeKey, weight);
        
        // Add edge
        this.adjacencyList.get(from).push({
            neighbor: to,
            weight: weight,
            baseWeight: weight
        });
        
        if (bidirectional) {
            const reverseKey = `${to}-${from}`;
            this.baseWeights.set(reverseKey, weight);
            
            this.adjacencyList.get(to).push({
                neighbor: from,
                weight: weight,
                baseWeight: weight
            });
        }
    }

    /**
     * Mark zone as danger zone (increases edge weights)
     * CRITICAL: Called from desktop UI, affects all future path calculations
     */
    setDangerZone(nodeId, isDanger) {
        if (isDanger) {
            this.dangerZones.add(nodeId);
        } else {
            this.dangerZones.delete(nodeId);
        }
        
        // Update all edges connected to this node
        this._updateEdgeWeights();
    }

    /**
     * Update edge weights based on danger zones
     * Edges leading to/from danger zones get penalty multiplier
     */
    _updateEdgeWeights() {
        for (let [nodeId, edges] of this.adjacencyList) {
            for (let edge of edges) {
                const edgeKey = `${nodeId}-${edge.neighbor}`;
                const baseWeight = this.baseWeights.get(edgeKey) || edge.baseWeight;
                
                // Apply danger penalty if either endpoint is in danger zone
                if (this.dangerZones.has(nodeId) || this.dangerZones.has(edge.neighbor)) {
                    edge.weight = baseWeight * this.dangerPenaltyMultiplier;
                    edge.isDangerZone = true;
                } else {
                    edge.weight = baseWeight;
                    edge.isDangerZone = false;
                }
            }
        }
    }

    /**
     * Get all neighbors of a node
     */
    getNeighbors(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
    }

    /**
     * Get node metadata
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    /**
     * Get all nodes
     */
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * Get all edges (for visualization)
     */
    getAllEdges() {
        const edges = [];
        
        for (let [from, neighbors] of this.adjacencyList) {
            for (let edge of neighbors) {
                edges.push({
                    from: from,
                    to: edge.neighbor,
                    weight: edge.weight,
                    baseWeight: edge.baseWeight,
                    isDangerZone: edge.isDangerZone || false
                });
            }
        }
        
        return edges;
    }

    /**
     * Check if node exists
     */
    hasNode(nodeId) {
        return this.adjacencyList.has(nodeId);
    }

    /**
     * Get danger zones
     */
    getDangerZones() {
        return Array.from(this.dangerZones);
    }

    /**
     * Calculate Euclidean distance between two nodes (for heuristic)
     */
    getDistance(nodeId1, nodeId2) {
        const node1 = this.nodes.get(nodeId1);
        const node2 = this.nodes.get(nodeId2);
        
        if (!node1 || !node2) return Infinity;
        
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Find nearest node to coordinates
     */
    findNearestNode(x, y) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (let [nodeId, node] of this.nodes) {
            const dx = node.x - x;
            const dy = node.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = nodeId;
            }
        }
        
        return nearest;
    }

    /**
     * Export graph data for visualization
     */
    exportGraphData() {
        return {
            nodes: this.getAllNodes(),
            edges: this.getAllEdges(),
            dangerZones: this.getDangerZones()
        };
    }
}

module.exports = CityGraph;
