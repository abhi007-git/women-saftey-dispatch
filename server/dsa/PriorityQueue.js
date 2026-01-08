/**
 * PRIORITY QUEUE - Emergency Ordering Engine
 * 
 * ============================================
 * WHY PRIORITY QUEUE FOR THIS SYSTEM?
 * ============================================
 * 
 * PROBLEM: When 10 emergencies arrive simultaneously, which do you handle first?
 * - Simple FIFO queue → First-come-first-served (UNFAIR - ignores severity)
 * - Random selection → Chaotic (life-threatening cases might wait)
 * - Manual sorting → Slow (O(n log n) every time)
 * 
 * SOLUTION: Max-Heap Priority Queue provides O(log n) insert/extract
 * - Highest priority emergency is ALWAYS at the top (O(1) access)
 * - New emergencies slot into correct position automatically
 * - Priority dynamically recalculates as time passes
 * 
 * WHY NOT ALTERNATIVES?
 * - Sorted Array: O(n) insertion is too slow  
 * - Linked List: O(n) to find max priority
 * - Simple Queue: Ignores urgency/severity
 * 
 * REAL-WORLD APPLICATION:
 * Medical ERs use triage (similar to priority queue):
 * - Heart attack > Broken arm > Common cold
 * - Time-sensitive conditions escalate automatically
 * This system models the same ethical decision-making
 * 
 * ============================================
 * PRIORITY CALCULATION (DETERMINISTIC):
 * ============================================
 * 
 * Priority = Severity Score + Time Score + Zone Risk + Availability Penalty
 * 
 * 1. SEVERITY SCORE (Base Weight):
 *    - Kidnap: 100 pts  (immediate life threat)
 *    - Assault: 85 pts  (active violence)
 *    - Stalking: 60 pts (imminent danger)
 *    - Harassment: 40 pts (threatening)
 *    - Other: 30 pts (general distress)
 * 
 * 2. TIME SCORE (Escalation):
 *    - +0.5 points per second waiting
 *    - Older alerts gradually move to front
 *    - Prevents indefinite waiting
 * 
 * 3. ZONE RISK (Location Factor):
 *    - High-risk zones get +5 points per risk level
 *    - Danger zones automatically prioritized
 * 
 * 4. AVAILABILITY PENALTY:
 *    - If no nearby patrols: +20 points
 *    - Ensures distant emergencies aren't ignored
 * 
 * This is NOT a simple queue - priority dynamically changes over time
 */

class EmergencyPriorityQueue {
    constructor() {
        this.heap = [];
        
        // Severity weights for different distress types
        // CRITICAL: These values directly impact dispatch decisions
        this.severityWeights = {
            'kidnap': 100,      // Immediate life threat
            'assault': 85,      // Active violence
            'stalking': 60,     // Imminent danger
            'harassment': 40,   // Threatening situation
            'other': 30         // General distress
        };
        
        // Time urgency factor (seconds → priority points)
        this.timeUrgencyFactor = 0.5; // 0.5 points per second elapsed
        
        // Zone risk multiplier
        this.zoneRiskMultiplier = 2;
    }

    /**
     * Calculate dynamic priority score WITH BREAKDOWN
     * Higher score = higher priority
     * 
     * FORMULA:
     * Priority = (Severity Weight) + 
     *            (Time Elapsed × Time Factor) + 
     *            (Zone Risk × Risk Multiplier) +
     *            (Patrol Availability Penalty)
     * 
     * Returns priority WITH breakdown for UI transparency
     */
    _calculatePriority(emergency) {
        const now = Date.now();
        const timeElapsed = (now - emergency.timestamp) / 1000; // seconds
        
        // Base severity score
        const distressType = emergency.distress_type.toLowerCase();
        const severityScore = this.severityWeights[distressType] || this.severityWeights['other'];
        
        // Time urgency (grows linearly)
        const timeScore = timeElapsed * this.timeUrgencyFactor;
        
        // Zone risk contribution
        const zoneRiskScore = (emergency.zone_risk_level || 5) * this.zoneRiskMultiplier;
        
        // Patrol availability penalty (if no patrols nearby, boost priority)
        const availabilityPenalty = emergency.nearest_patrol_distance > 10 ? 20 : 0;
        
        const totalPriority = severityScore + timeScore + zoneRiskScore + availabilityPenalty;
        
        // Store breakdown for UI explanation
        emergency.priorityBreakdown = {
            severity: Math.round(severityScore),
            timeWaiting: Math.round(timeScore),
            zoneRisk: Math.round(zoneRiskScore),
            availability: availabilityPenalty,
            total: Math.round(totalPriority)
        };
        
        return totalPriority;
    }

    /**
     * Insert emergency into heap
     * Time Complexity: O(log n) - heap insertion
     * 
     * IMPORTANT: Each insertion triggers re-heapification
     */
    enqueue(emergency) {
        // Calculate initial priority
        emergency.priority = this._calculatePriority(emergency);
        emergency.queuedAt = Date.now();
        
        this.heap.push(emergency);
        this._heapifyUp(this.heap.length - 1);
    }

    /**
     * Remove and return highest priority emergency
     * Time Complexity: O(log n)
     * 
     * CRITICAL: This determines which emergency gets handled next
     */
    dequeue() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const maxPriority = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        
        return maxPriority;
    }

    /**
     * Peek at highest priority without removing
     */
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    /**
     * Recalculate all priorities (called periodically)
     * WHY: Priorities change over time as emergencies age
     * 
     * Time Complexity: O(n log n) - rebuild entire heap
     */
    recalculatePriorities() {
        // Update priority for each emergency
        for (let emergency of this.heap) {
            emergency.priority = this._calculatePriority(emergency);
        }
        
        // Rebuild heap from scratch
        this._buildHeap();
    }

    /**
     * Build heap from unordered array
     * Time Complexity: O(n)
     */
    _buildHeap() {
        // Start from last parent node and heapify down
        for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
            this._heapifyDown(i);
        }
    }

    /**
     * Bubble up - maintain max heap property
     */
    _heapifyUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            
            if (this.heap[index].priority <= this.heap[parentIndex].priority) {
                break;
            }
            
            // Swap with parent
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    /**
     * Bubble down - maintain max heap property
     */
    _heapifyDown(index) {
        const length = this.heap.length;
        
        while (true) {
            let largest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            if (leftChild < length && this.heap[leftChild].priority > this.heap[largest].priority) {
                largest = leftChild;
            }
            
            if (rightChild < length && this.heap[rightChild].priority > this.heap[largest].priority) {
                largest = rightChild;
            }
            
            if (largest === index) break;
            
            // Swap with largest child
            [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
            index = largest;
        }
    }

    /**
     * Remove specific emergency by ID
     * Used when emergency is resolved or cancelled
     */
    removeById(emergencyId) {
        const index = this.heap.findIndex(e => e.id === emergencyId);
        
        if (index === -1) return false;
        
        // Replace with last element
        this.heap[index] = this.heap[this.heap.length - 1];
        this.heap.pop();
        
        // Re-heapify if not empty
        if (this.heap.length > 0 && index < this.heap.length) {
            this._heapifyDown(index);
            this._heapifyUp(index);
        }
        
        return true;
    }

    /**
     * Get all emergencies sorted by priority (for visualization)
     * IMPORTANT: Returns copy, doesn't modify queue
     */
    getAllSorted() {
        return [...this.heap].sort((a, b) => b.priority - a.priority);
    }

    /**
     * Check if queue is empty
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * Get queue size
     */
    size() {
        return this.heap.length;
    }

    /**
     * Get statistics for dashboard
     */
    getStatistics() {
        if (this.heap.length === 0) {
            return {
                total: 0,
                highPriority: 0,
                mediumPriority: 0,
                lowPriority: 0,
                averageWaitTime: 0
            };
        }
        
        const now = Date.now();
        let totalWaitTime = 0;
        let highPriority = 0;
        let mediumPriority = 0;
        let lowPriority = 0;
        
        for (let emergency of this.heap) {
            totalWaitTime += (now - emergency.timestamp) / 1000;
            
            if (emergency.priority >= 100) highPriority++;
            else if (emergency.priority >= 60) mediumPriority++;
            else lowPriority++;
        }
        
        return {
            total: this.heap.length,
            highPriority,
            mediumPriority,
            lowPriority,
            averageWaitTime: (totalWaitTime / this.heap.length).toFixed(1)
        };
    }
}

module.exports = EmergencyPriorityQueue;
