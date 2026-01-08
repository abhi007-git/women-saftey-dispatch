/**
 * HASH TABLE - Zone Intelligence Memory
 * 
 * ============================================
 * WHY HASH TABLE FOR THIS SYSTEM?
 * ============================================
 * 
 * PROBLEM: During emergencies, dispatchers need INSTANT access to zone history
 * - "Has this area had frequent assaults?"
 * - "What was our last response time here?"  
 * - "Is this a high-risk zone?"
 * 
 * SOLUTION: Hash Table provides O(1) lookup time
 * - Emergency arrives → Hash nodeId → Get zone history instantly
 * - No linear search through arrays (O(n))
 * - No binary search delays (O(log n))
 * 
 * WHY NOT ALTERNATIVES?
 * - Array: O(n) search is too slow during emergencies
 * - Binary Search Tree: O(log n) is unnecessary complexity  
 * - Map (JavaScript): We need to DEMONSTRATE the algorithm
 * 
 * REAL-WORLD APPLICATION:
 * Police dispatch systems use similar structures to track:
 * - Crime hotspots (risk levels)
 * - Historical response times
 * - Incident patterns for predictive policing
 * 
 * ============================================
 * WHAT THIS STORES (PER ZONE):
 * ============================================
 * - risk_level: Current danger assessment (0-10)
 * - past_incident_count: Historical incident frequency
 * - dominant_distress_type: Most common emergency type
 * - average_response_time: Historical average response time
 * - recent_incidents: Last 10 incidents for pattern analysis
 */

class ZoneIntelligenceHashTable {
    constructor(size = 50) {
        this.size = size;
        this.table = new Array(size);
        
        // Initialize each bucket as an array to handle collisions via chaining
        for (let i = 0; i < size; i++) {
            this.table[i] = [];
        }
    }

    /**
     * Hash function using polynomial rolling hash
     * Converts zone_id string to array index
     */
    _hash(key) {
        let hash = 0;
        const prime = 31; // Common prime for string hashing
        
        for (let i = 0; i < key.length; i++) {
            hash = (hash * prime + key.charCodeAt(i)) % this.size;
        }
        
        return Math.abs(hash);
    }

    /**
     * Insert or update zone intelligence
     * Time Complexity: O(1) average case, O(n) worst case with collisions
     */
    set(zoneId, zoneData) {
        const index = this._hash(zoneId);
        const bucket = this.table[index];

        // Check if zone already exists (update case)
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i].zoneId === zoneId) {
                bucket[i].data = zoneData;
                bucket[i].lastUpdated = Date.now();
                return;
            }
        }

        // New zone (insert case)
        bucket.push({
            zoneId: zoneId,
            data: zoneData,
            lastUpdated: Date.now()
        });
    }

    /**
     * Retrieve zone intelligence
     * Time Complexity: O(1) average case
     * CRITICAL: Called during every emergency for priority calculation
     */
    get(zoneId) {
        const index = this._hash(zoneId);
        const bucket = this.table[index];

        for (let item of bucket) {
            if (item.zoneId === zoneId) {
                return item.data;
            }
        }

        // Return default data for unknown zones
        return this._getDefaultZoneData();
    }

    /**
     * Update zone risk level after incident
     * IMPORTANT: Risk decays over time but spikes immediately after incidents
     */
    updateZoneRisk(zoneId, incidentType, responseTime) {
        const zoneData = this.get(zoneId);
        
        // Increment incident count
        zoneData.past_incident_count++;
        
        // Update risk level based on incident type severity
        const severityMap = {
            'assault': 4,
            'kidnap': 5,
            'harassment': 2,
            'stalking': 3,
            'other': 1
        };
        
        const incidentSeverity = severityMap[incidentType.toLowerCase()] || 1;
        zoneData.risk_level = Math.min(10, zoneData.risk_level + incidentSeverity * 0.5);
        
        // Update dominant distress type
        zoneData.distress_type_count = zoneData.distress_type_count || {};
        zoneData.distress_type_count[incidentType] = (zoneData.distress_type_count[incidentType] || 0) + 1;
        
        let maxCount = 0;
        let dominantType = incidentType;
        for (let type in zoneData.distress_type_count) {
            if (zoneData.distress_type_count[type] > maxCount) {
                maxCount = zoneData.distress_type_count[type];
                dominantType = type;
            }
        }
        zoneData.dominant_distress_type = dominantType;
        
        // Update average response time
        const oldTotal = zoneData.average_response_time * (zoneData.past_incident_count - 1);
        zoneData.average_response_time = (oldTotal + responseTime) / zoneData.past_incident_count;
        
        // Store recent incident
        zoneData.recent_incidents = zoneData.recent_incidents || [];
        zoneData.recent_incidents.unshift({
            type: incidentType,
            time: Date.now(),
            responseTime: responseTime
        });
        
        // Keep only last 10 incidents
        if (zoneData.recent_incidents.length > 10) {
            zoneData.recent_incidents.pop();
        }
        
        this.set(zoneId, zoneData);
    }

    /**
     * Decay risk levels over time (called periodically)
     * Zones become safer if no recent incidents
     */
    decayRiskLevels(decayRate = 0.95) {
        for (let bucket of this.table) {
            for (let item of bucket) {
                item.data.risk_level = Math.max(1, item.data.risk_level * decayRate);
            }
        }
    }

    /**
     * Get all zones for visualization on desktop UI
     */
    getAllZones() {
        const allZones = [];
        for (let bucket of this.table) {
            for (let item of bucket) {
                allZones.push({
                    zoneId: item.zoneId,
                    ...item.data,
                    lastUpdated: item.lastUpdated
                });
            }
        }
        return allZones;
    }

    /**
     * Get high-risk zones (for emergency patrol deployment)
     */
    getHighRiskZones(threshold = 7) {
        const allZones = this.getAllZones();
        return allZones.filter(zone => zone.risk_level >= threshold);
    }

    /**
     * Default zone data for untracked zones
     */
    _getDefaultZoneData() {
        return {
            risk_level: 5, // Neutral risk
            past_incident_count: 0,
            dominant_distress_type: 'unknown',
            average_response_time: 0,
            recent_incidents: [],
            distress_type_count: {}
        };
    }

    /**
     * Get statistics for dashboard
     */
    getStatistics() {
        const allZones = this.getAllZones();
        
        if (allZones.length === 0) {
            return {
                totalZones: 0,
                averageRisk: 0,
                highRiskZones: 0,
                totalIncidents: 0
            };
        }
        
        const totalRisk = allZones.reduce((sum, zone) => sum + zone.risk_level, 0);
        const totalIncidents = allZones.reduce((sum, zone) => sum + zone.past_incident_count, 0);
        const highRiskCount = allZones.filter(zone => zone.risk_level >= 7).length;
        
        return {
            totalZones: allZones.length,
            averageRisk: (totalRisk / allZones.length).toFixed(2),
            highRiskZones: highRiskCount,
            totalIncidents: totalIncidents
        };
    }
    
    /**
     * Get zone details with hash information for educational display
     */
    getZone(zoneId) {
        const index = this._hash(zoneId);
        const bucket = this.table[index];
        
        for (let item of bucket) {
            if (item.zoneId === zoneId) {
                return {
                    name: zoneId,
                    ...item.data,
                    hashIndex: index,
                    bucketSize: bucket.length, // Show collision chain length
                    lastUpdated: item.lastUpdated
                };
            }
        }
        
        return null;
    }
    
    /**
     * Get hash table internals for visualization
     * Shows collision chains, bucket utilization, etc.
     */
    getHashTableInternals() {
        const bucketUtilization = [];
        let totalCollisions = 0;
        let maxChainLength = 0;
        let usedBuckets = 0;
        
        for (let i = 0; i < this.table.length; i++) {
            const bucketSize = this.table[i].length;
            
            if (bucketSize > 0) {
                usedBuckets++;
                const zones = this.table[i].map(item => ({
                    zoneId: item.zoneId,
                    risk: item.data.risk_level.toFixed(1),
                    incidents: item.data.past_incident_count
                }));
                
                bucketUtilization.push({
                    index: i,
                    size: bucketSize,
                    zones: zones
                });
                
                if (bucketSize > 1) {
                    totalCollisions += (bucketSize - 1);
                }
                
                maxChainLength = Math.max(maxChainLength, bucketSize);
            }
        }
        
        return {
            tableSize: this.size,
            usedBuckets: usedBuckets,
            loadFactor: (usedBuckets / this.size).toFixed(2),
            totalCollisions: totalCollisions,
            maxChainLength: maxChainLength,
            buckets: bucketUtilization.filter(b => b.size > 0).slice(0, 15) // Top 15 for display
        };
    }
}

module.exports = ZoneIntelligenceHashTable;
