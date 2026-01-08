/**
 * DESKTOP CONTROL PANEL - CLIENT-SIDE LOGIC
 * 
 * Connects to server via WebSocket
 * Visualizes all data structures and system state
 * Provides admin controls for danger zones
 */

// WebSocket connection
let ws;
let systemState = null;
let selectedEmergency = null;

// SVG elements
let svg;
let mapGroup;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    initializeUI();
    startClock();
});

// ==================================================
// WEBSOCKET CONNECTION
// ==================================================

function initializeWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('✓ Connected to dispatch server');
        updateSystemStatus(true);
    };
    
    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        } catch (error) {
            console.error('Error parsing server message:', error);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateSystemStatus(false);
    };
    
    ws.onclose = () => {
        console.log('Disconnected from server. Attempting reconnection...');
        updateSystemStatus(false);
        setTimeout(initializeWebSocket, 3000);
    };
}

function handleServerMessage(message) {
    const prevEmergencies = systemState?.activeEmergencies || [];
    
    switch (message.type) {
        case 'INITIAL_STATE':
        case 'STATE_UPDATE':
            systemState = message.data;
            
            // Clear all visual paths when no emergencies exist
            if (!message.data.activeEmergencies || message.data.activeEmergencies.length === 0) {
                const pathGroup = document.getElementById('patrolPaths');
                if (pathGroup) pathGroup.innerHTML = '';
            }
            
            // Detect newly assigned patrols
            const currEmergencies = message.data.activeEmergencies || [];
            currEmergencies.forEach(emergency => {
                const prevEmergency = prevEmergencies.find(e => e.id === emergency.id);
                
                // Patrol assigned
                if (!prevEmergency?.assignedPatrol && emergency.assignedPatrol) {
                    showNotification(
                        '🚓 Patrol Dispatched',
                        `${emergency.assignedPatrol} assigned to ${emergency.location}`,
                        'info'
                    );
                }
                
                // Emergency resolved
                if (prevEmergency && prevEmergency.status !== 'RESOLVED' && emergency.status === 'RESOLVED') {
                    const responseTime = emergency.responseTime ? ` in ${emergency.responseTime.toFixed(0)}s` : '';
                    showNotification(
                        '✅ Woman Saved!',
                        `${emergency.assignedPatrol || 'Patrol'} successfully resolved emergency at ${emergency.location}${responseTime}`,
                        'success'
                    );
                    // Show on-map notification
                    showMapSaveNotification(emergency);
                }
            });
            
            renderAllPanels();
            break;
    }
}

// ==================================================
// UI INITIALIZATION
// ==================================================

function initializeUI() {
    svg = document.getElementById('cityMap');
    mapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mapGroup.setAttribute('id', 'mapGroup');
    svg.appendChild(mapGroup);
    
    // Map controls
    document.getElementById('btnZoomIn').addEventListener('click', () => zoomMap(1.2));
    document.getElementById('btnZoomOut').addEventListener('click', () => zoomMap(0.8));
    document.getElementById('btnReset').addEventListener('click', resetMap);
    
    // System controls
    document.getElementById('btnResetSystem').addEventListener('click', resetSystem);
    
    // Modal controls
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('btnResolveEmergency').addEventListener('click', resolveCurrentEmergency);
    
    // Click outside modal to close
    document.getElementById('emergencyModal').addEventListener('click', (e) => {
        if (e.target.id === 'emergencyModal') {
            closeModal();
        }
    });
}

function startClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        document.getElementById('timeDisplay').textContent = timeString;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function updateSystemStatus(isOnline) {
    const statusElement = document.getElementById('systemStatus');
    const indicator = statusElement.querySelector('.status-indicator');
    const text = statusElement.querySelector('span:last-child');
    
    if (isOnline) {
        indicator.classList.add('online');
        text.textContent = 'SYSTEM ONLINE';
        statusElement.style.color = 'var(--success-color)';
    } else {
        indicator.classList.remove('online');
        text.textContent = 'SYSTEM OFFLINE';
        statusElement.style.color = 'var(--danger-color)';
    }
}

function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function openPanelModal(panelType) {
    const modal = document.getElementById('panelModal');
    const modalTitle = document.getElementById('panelModalTitle');
    const modalBody = document.getElementById('panelModalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    // Set title and content based on panel type
    const panelData = {
        'priorityQueue': {
            title: '📊 Priority Queue (Max Heap) - Full View',
            getContent: () => {
                const queueList = document.getElementById('priorityQueueList');
                return queueList ? queueList.innerHTML : '<p>No data available</p>';
            }
        },
        'activeEmergencies': {
            title: '🚨 Active Emergencies - Full View',
            getContent: () => {
                const emergencyList = document.getElementById('emergencyList');
                return emergencyList ? emergencyList.innerHTML : '<p>No active emergencies</p>';
            }
        },
        'zoneIntelligence': {
            title: '🗂️ Zone Intelligence (Hash Table) - Full View',
            getContent: () => {
                const zoneList = document.getElementById('zoneIntelligenceList');
                return zoneList ? zoneList.innerHTML : '<p>No data available</p>';
            }
        },
        'patrolStatus': {
            title: '🚓 Patrol Unit Status - Full View',
            getContent: () => {
                const patrolList = document.getElementById('patrolStatusList');
                return patrolList ? patrolList.innerHTML : '<p>No patrols available</p>';
            }
        },
        'systemMetrics': {
            title: '📈 System Metrics - Full View',
            getContent: () => {
                const metrics = document.getElementById('metricsContent');
                return metrics ? metrics.innerHTML : '<p>No metrics available</p>';
            }
        },
        'dijkstraAnalysis': {
            title: '🛣️ Dijkstra Path Analysis - Full View',
            getContent: () => {
                const analysis = document.getElementById('pathAnalysisContent');
                return analysis ? analysis.innerHTML : '<p>No analysis available</p>';
            }
        }
    };
    
    const panel = panelData[panelType];
    if (panel) {
        modalTitle.textContent = panel.title;
        modalBody.innerHTML = panel.getContent();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closePanelModal() {
    const modal = document.getElementById('panelModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function showMapSaveNotification(emergency) {
    if (!emergency || !systemState?.map?.nodes) return;
    
    const node = systemState.map.nodes.find(n => n.id === emergency.nodeId);
    if (!node) return;
    
    // Create notification element
    const notification = createSVGElement('g', {
        class: 'map-notification',
        id: `notification-${emergency.id}`
    });
    
    // Background circle
    const bg = createSVGElement('circle', {
        cx: node.x,
        cy: node.y,
        r: '30',
        fill: '#2ecc71',
        opacity: '0.9'
    });
    
    // Checkmark icon
    const check = createSVGElement('text', {
        x: node.x,
        y: node.y + 8,
        'text-anchor': 'middle',
        'font-size': '32',
        'font-weight': 'bold',
        fill: 'white'
    });
    check.textContent = '✓';
    
    // Text label
    const text = createSVGElement('text', {
        x: node.x,
        y: node.y - 35,
        'text-anchor': 'middle',
        'font-size': '14',
        'font-weight': 'bold',
        fill: '#2ecc71'
    });
    text.textContent = 'SAVED!';
    
    notification.appendChild(bg);
    notification.appendChild(check);
    notification.appendChild(text);
    
    // Add to map
    const svg = document.getElementById('cityMap');
    if (svg) {
        svg.appendChild(notification);
        
        // Animate and remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 2500);
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('panelModal');
    if (event.target === modal) {
        closePanelModal();
    }
});

// Close modal with Escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePanelModal();
    }
});

// ==================================================
// RENDER ALL PANELS
// ==================================================

function renderAllPanels() {
    if (!systemState) return;
    
    renderCityMap();
    renderPriorityQueue();
    renderActiveEmergencies();
    renderZoneIntelligence();
    renderPatrolStatus();
    renderMetrics();
    renderDijkstraAnalysis();
}

// ==================================================
// CITY MAP RENDERING
// ==================================================

function renderCityMap() {
    if (!systemState || !systemState.map) return;
    
    // Clear existing content
    mapGroup.innerHTML = '';
    
    const { map } = systemState;
    
    // Validate map data
    if (!map.nodes || !map.edges) {
        console.warn('Incomplete map data received');
        return;
    }
    
    // Render edges first (so they appear behind nodes)
    renderEdges(map.edges);
    
    // Render danger zones
    renderDangerZones(map.dangerZones || [], map.nodes);
    
    // Render patrol paths
    renderPatrolPaths();
    
    // Render nodes
    renderNodes(map.nodes, map.dangerZones || []);
    
    // Render patrols
    renderPatrols();
    
    // Render emergencies
    renderEmergencies();
}

function renderEdges(edges) {
    if (!edges || !systemState || !systemState.map || !systemState.map.nodes) return;
    
    const edgeGroup = createSVGElement('g', { id: 'edges' });
    
    edges.forEach(edge => {
        const fromNode = systemState.map.nodes.find(n => n.id === edge.from);
        const toNode = systemState.map.nodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        const line = createSVGElement('line', {
            class: `edge-line ${edge.isDangerZone ? 'danger' : ''}`,
            x1: fromNode.x,
            y1: fromNode.y,
            x2: toNode.x,
            y2: toNode.y,
            'stroke-width': edge.isDangerZone ? '3' : '2'
        });
        
        edgeGroup.appendChild(line);
    });
    
    mapGroup.appendChild(edgeGroup);
}

function renderNodes(nodes, dangerZones) {
    if (!nodes || !dangerZones) return;
    
    const nodeGroup = createSVGElement('g', { id: 'nodes' });
    
    nodes.forEach(node => {
        const isDanger = dangerZones.includes(node.id);
        
        const nodeG = createSVGElement('g', {
            class: 'node',
            'data-node-id': node.id
        });
        
        // Node circle
        const circle = createSVGElement('circle', {
            class: 'node-circle',
            cx: node.x,
            cy: node.y,
            r: isDanger ? '12' : '8',
            fill: isDanger ? 'rgba(233, 69, 96, 0.3)' : 'rgba(52, 152, 219, 0.3)',
            stroke: isDanger ? '#e94560' : '#3498db',
            'stroke-width': '2'
        });
        
        // Node label
        const text = createSVGElement('text', {
            class: 'node-label',
            x: node.x,
            y: node.y - 15,
            'text-anchor': 'middle',
            fill: '#bdc3c7'
        });
        text.textContent = node.name || node.id;
        
        nodeG.appendChild(circle);
        nodeG.appendChild(text);
        
        // Click to toggle danger zone
        nodeG.addEventListener('click', () => toggleDangerZone(node.id, !isDanger));
        
        nodeGroup.appendChild(nodeG);
    });
    
    mapGroup.appendChild(nodeGroup);
}

function renderDangerZones(dangerZones, nodes) {
    if (!dangerZones || !nodes) return;
    
    const dangerGroup = createSVGElement('g', { id: 'danger-zones' });
    
    dangerZones.forEach(zoneId => {
        const node = nodes.find(n => n.id === zoneId);
        if (!node) return;
        
        // Pulsing danger zone indicator
        const circle = createSVGElement('circle', {
            cx: node.x,
            cy: node.y,
            r: '25',
            fill: 'rgba(233, 69, 96, 0.15)',
            stroke: '#e94560',
            'stroke-width': '1',
            'stroke-dasharray': '4,2'
        });
        
        const animate = createSVGElement('animate', {
            attributeName: 'r',
            values: '25;30;25',
            dur: '2s',
            repeatCount: 'indefinite'
        });
        
        circle.appendChild(animate);
        dangerGroup.appendChild(circle);
    });
    
    mapGroup.appendChild(dangerGroup);
}

function renderPatrols() {
    if (!systemState || !systemState.patrols) return;
    
    const patrolGroup = createSVGElement('g', { id: 'patrols' });
    
    // First, render patrol station markers (home bases)
    const stationMarkers = new Set();
    systemState.patrols.forEach(patrol => {
        if (patrol.homeStation && !stationMarkers.has(patrol.homeStation)) {
            stationMarkers.add(patrol.homeStation);
            const stationNode = systemState.map?.nodes?.find(n => n.id === patrol.homeStation);
            if (stationNode) {
                // Station icon (shield)
                const stationG = createSVGElement('g', {
                    class: 'patrol-station',
                    'data-station-id': patrol.homeStation
                });
                
                // Shield shape
                const shield = createSVGElement('rect', {
                    x: stationNode.x - 12,
                    y: stationNode.y - 12,
                    width: '24',
                    height: '24',
                    rx: '4',
                    fill: '#34495e',
                    stroke: '#3498db',
                    'stroke-width': '2',
                    opacity: '0.8'
                });
                
                // Station icon text
                const stationIcon = createSVGElement('text', {
                    x: stationNode.x,
                    y: stationNode.y + 5,
                    'text-anchor': 'middle',
                    'font-size': '16',
                    'font-weight': 'bold',
                    fill: '#3498db'
                });
                stationIcon.textContent = '🏠';
                
                stationG.appendChild(shield);
                stationG.appendChild(stationIcon);
                patrolGroup.appendChild(stationG);
            }
        }
    });
    
    // Then render mobile patrol units
    systemState.patrols.forEach(patrol => {
        if (!patrol || typeof patrol.x !== 'number' || typeof patrol.y !== 'number') return;
        
        const patrolG = createSVGElement('g', {
            class: 'patrol-marker',
            'data-patrol-id': patrol.id
        });
        
        // Patrol vehicle icon (HUGE and visible)
        const vehicle = createSVGElement('circle', {
            cx: patrol.x,
            cy: patrol.y,
            r: '20',
            fill: patrol.isEmergencyUnit ? '#ff6b00' : '#00ff00',
            stroke: '#ffffff',
            'stroke-width': '5',
            opacity: '1',
            filter: 'drop-shadow(0 0 15px rgba(0,255,0,1))'
        });
        
        // State indicator
        const stateColors = {
            'IDLE': '#2ecc71',
            'EN_ROUTE': '#f39c12',
            'ENGAGED': '#e94560',
            'RETURNING': '#3498db'
        };
        
        const stateIndicator = createSVGElement('circle', {
            cx: patrol.x + 10,
            cy: patrol.y - 10,
            r: '6',
            fill: stateColors[patrol.state] || '#fff',
            stroke: '#000',
            'stroke-width': '2'
        });
        
        // Patrol label
        const label = createSVGElement('text', {
            x: patrol.x,
            y: patrol.y + 35,
            'text-anchor': 'middle',
            'font-size': '14',
            fill: '#ffffff',
            'font-weight': 'bold',
            stroke: '#000000',
            'stroke-width': '1'
        });
        label.textContent = patrol.name.split(' ')[1] || patrol.id;
        
        patrolG.appendChild(vehicle);
        patrolG.appendChild(stateIndicator);
        patrolG.appendChild(label);
        
        patrolGroup.appendChild(patrolG);
    });
    
    mapGroup.appendChild(patrolGroup);
}

function renderEmergencies() {
    if (!systemState || !systemState.activeEmergencies || !systemState.map || !systemState.map.nodes) return;
    
    const emergencyGroup = createSVGElement('g', { id: 'emergencies' });
    
    systemState.activeEmergencies.forEach(emergency => {
        const node = systemState.map.nodes.find(n => n.id === emergency.nodeId);
        if (!node) return;
        
        // Status-based colors
        const statusColors = {
            'PENDING': '#f39c12',     // Orange - waiting
            'ASSIGNED': '#3498db',    // Blue - patrol assigned
            'RESPONDING': '#9b59b6',  // Purple - en route
            'ENGAGED': '#e74c3c',     // Red - at scene
            'RESOLVED': '#2ecc71'     // Green - resolved
        };
        
        const emergencyG = createSVGElement('g', {
            class: 'emergency-marker',
            'data-emergency-id': emergency.id,
            style: 'cursor: pointer;'
        });
        
        // Larger clickable area
        const clickArea = createSVGElement('circle', {
            cx: node.x,
            cy: node.y,
            r: '20',
            fill: 'transparent',
            stroke: 'none'
        });
        
        // Emergency alert icon with status color
        const alert = createSVGElement('circle', {
            cx: node.x,
            cy: node.y,
            r: '10',
            fill: statusColors[emergency.status] || '#e94560',
            stroke: '#fff',
            'stroke-width': '2'
        });
        
        // Exclamation mark
        const exclamation = createSVGElement('text', {
            x: node.x,
            y: node.y + 4,
            'text-anchor': 'middle',
            'font-size': '14',
            'font-weight': 'bold',
            fill: '#fff'
        });
        exclamation.textContent = '!';
        
        emergencyG.appendChild(clickArea);
        emergencyG.appendChild(alert);
        emergencyG.appendChild(exclamation);
        
        // Click to view details
        emergencyG.addEventListener('click', () => showEmergencyDetails(emergency));
        
        emergencyGroup.appendChild(emergencyG);
    });
    
    mapGroup.appendChild(emergencyGroup);
}

function renderPatrolPaths() {
    if (!systemState || !systemState.patrols || !systemState.map || !systemState.map.nodes) return;
    
    const pathGroup = createSVGElement('g', { id: 'patrol-paths' });
    
    systemState.patrols.forEach(patrol => {
        if (patrol.path && patrol.path.length > 1 && patrol.state === 'EN_ROUTE') {
            // Get full node data with coordinates
            const pathWithCoords = patrol.path.map(pathNode => {
                const fullNode = systemState.map.nodes.find(n => n.id === pathNode.nodeId);
                return fullNode || pathNode;
            }).filter(node => node && typeof node.x === 'number' && typeof node.y === 'number');
            
            if (pathWithCoords.length > 1) {
                const pathData = pathWithCoords.map((node, i) => 
                    `${i === 0 ? 'M' : 'L'} ${node.x} ${node.y}`
                ).join(' ');
                
                const path = createSVGElement('path', {
                    d: pathData,
                    stroke: patrol.isEmergencyUnit ? '#f39c12' : '#00ff00',
                    'stroke-width': '5',
                    fill: 'none',
                    opacity: '0.9',
                    'stroke-dasharray': '10,5',
                    'stroke-linecap': 'round',
                    filter: 'drop-shadow(0 0 8px rgba(0,255,0,0.8))'
                });
                
                // Add animation for moving dashes
                const animate = createSVGElement('animate', {
                    attributeName: 'stroke-dashoffset',
                    from: '0',
                    to: '24',
                    dur: '1s',
                    repeatCount: 'indefinite'
                });
                
                path.appendChild(animate);
                pathGroup.appendChild(path);
            }
        }
    });
    
    mapGroup.appendChild(pathGroup);
}

// ==================================================
// PRIORITY QUEUE RENDERING
// ==================================================

function renderPriorityQueue() {
    const queueList = document.getElementById('priorityQueueList');
    const queueSize = document.getElementById('queueSize');
    
    if (!systemState || !systemState.emergencyQueue) {
        queueSize.textContent = '0';
        queueList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Loading...</p>';
        return;
    }
    
    const queue = systemState.emergencyQueue;
    queueSize.textContent = queue.length;
    
    if (queue.length === 0) {
        queueList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No emergencies in queue</p>';
        return;
    }
    
    queueList.innerHTML = queue.map((emergency, index) => {
        const waitTime = Math.floor((Date.now() - emergency.timestamp) / 1000);
        const priorityClass = emergency.priority >= 100 ? 'high' : emergency.priority >= 60 ? 'medium' : 'low';
        
        return `
            <div class="queue-item" onclick="showEmergencyDetails(${JSON.stringify(emergency).replace(/"/g, '&quot;')})">
                <div class="queue-item-header">
                    <span class="queue-item-id">#${index + 1} - ${emergency.id}</span>
                    <span class="queue-item-priority" title="Priority: ${emergency.priority.toFixed(1)}">${emergency.distress_type.toUpperCase()}</span>
                </div>
                <div class="queue-item-details">
                    <div><strong>Priority:</strong> ${emergency.priority.toFixed(1)}</div>
                    <div><strong>Location:</strong> ${emergency.nodeId}</div>
                    <div><strong>Wait Time:</strong> ${waitTime}s</div>
                    <div><strong>Zone Risk:</strong> ${emergency.zone_risk_level.toFixed(1)}/10</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================================================
// ZONE INTELLIGENCE RENDERING
// ==================================================

function renderActiveEmergencies() {
    const emergencyListPanel = document.getElementById('emergencyList');
    const emergencyCount = document.getElementById('emergencyCount');
    if (!emergencyListPanel) return;
    
    const activeEmergencies = systemState.activeEmergencies || [];
    
    if (emergencyCount) {
        emergencyCount.textContent = activeEmergencies.length;
    }
    
    if (activeEmergencies.length === 0) {
        emergencyListPanel.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No active emergencies</p>';
        return;
    }
    
    emergencyListPanel.innerHTML = activeEmergencies.map(emergency => {
        const waitTime = Math.floor((Date.now() - emergency.timestamp) / 1000);
        const statusColor = {
            'PENDING': '#f39c12',
            'ASSIGNED': '#3498db',
            'RESPONDING': '#e74c3c',
            'ENGAGED': '#e94560',
            'RESOLVED': '#2ecc71'
        }[emergency.status] || '#95a5a6';
        
        const patrolInfo = emergency.assignedPatrol ? 
            `<div><strong>🚓 Patrol:</strong> ${emergency.assignedPatrol}</div>` : 
            '<div><strong>⏳ Status:</strong> Awaiting patrol</div>';
        
        const etaInfo = emergency.eta ? 
            `<div><strong>⏱️ ETA:</strong> ${Math.ceil(emergency.eta)}s</div>` : '';
        
        return `
            <div class="emergency-card" style="border-left: 4px solid ${statusColor};">
                <div class="emergency-header">
                    <span class="emergency-id">${emergency.id}</span>
                    <span class="emergency-status" style="background: ${statusColor};">${emergency.status}</span>
                </div>
                <div class="emergency-details">
                    <div><strong>🚨 Type:</strong> ${emergency.distress_type}</div>
                    <div><strong>📍 Location:</strong> ${emergency.location}</div>
                    <div><strong>⏰ Time:</strong> ${waitTime}s ago</div>
                    ${patrolInfo}
                    ${etaInfo}
                    <div><strong>⚡ Priority:</strong> ${emergency.priority.toFixed(0)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderZoneIntelligence() {
    const zoneList = document.getElementById('zoneIntelligenceList');
    const zoneCount = document.getElementById('zoneCount');
    
    const zones = systemState.zoneIntelligence
        .sort((a, b) => b.risk_level - a.risk_level)
        .slice(0, 10); // Show top 10 riskiest zones
    
    zoneCount.textContent = systemState.zoneIntelligence.length;
    
    zoneList.innerHTML = zones.map(zone => {
        const riskPercent = (zone.risk_level / 10) * 100;
        const riskClass = zone.risk_level >= 7 ? 'risk-high' : zone.risk_level >= 4 ? 'risk-medium' : 'risk-low';
        
        return `
            <div class="zone-item">
                <div>
                    <div class="zone-item-name">${zone.zoneId}</div>
                    <div class="zone-item-stats">
                        Incidents: ${zone.past_incident_count}<br>
                        Type: ${zone.dominant_distress_type}
                    </div>
                </div>
                <div>
                    <div class="zone-item-risk">
                        <span>${zone.risk_level.toFixed(1)}</span>
                        <div class="risk-bar">
                            <div class="risk-bar-fill ${riskClass}" style="width: ${riskPercent}%"></div>
                        </div>
                    </div>
                    <div class="zone-item-stats">
                        Avg Response: ${zone.average_response_time.toFixed(1)}s
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================================================
// PATROL STATUS RENDERING
// ==================================================

function renderPatrolStatus() {
    const patrolList = document.getElementById('patrolStatusList');
    const patrolActive = document.getElementById('patrolActive');
    const patrolTotal = document.getElementById('patrolTotal');
    
    const patrols = systemState.patrols;
    const activeCount = patrols.filter(p => p.state !== 'IDLE').length;
    
    patrolActive.textContent = activeCount;
    patrolTotal.textContent = patrols.length;
    
    patrolList.innerHTML = patrols.map(patrol => {
        return `
            <div class="patrol-item state-${patrol.state}">
                <div class="patrol-item-header">
                    <span class="patrol-item-name">${patrol.name}</span>
                    <span class="patrol-item-state state-${patrol.state}">${patrol.state}</span>
                </div>
                <div class="patrol-item-details">
                    <div><strong>Location:</strong> ${patrol.locationName}</div>
                    ${patrol.assignedEmergency ? `<div><strong>Assigned:</strong> ${patrol.assignedEmergency}</div>` : ''}
                    ${patrol.eta > 0 ? `<div><strong>ETA:</strong> ${Math.ceil(patrol.eta)}s</div>` : ''}
                    ${patrol.isEmergencyUnit ? '<div><strong>⚠️ Emergency Unit</strong></div>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==================================================
// METRICS RENDERING
// ==================================================

function renderMetrics() {
    if (!systemState || !systemState.statistics) return;
    
    const stats = systemState.statistics;
    const allEmergencies = systemState.activeEmergencies || [];
    
    // Calculate average response time from resolved emergencies
    const resolvedEmergencies = allEmergencies.filter(e => e.status === 'RESOLVED' && e.responseTime);
    const avgResponse = resolvedEmergencies.length > 0
        ? resolvedEmergencies.reduce((sum, e) => sum + e.responseTime, 0) / resolvedEmergencies.length
        : 0;
    
    // Update metric elements
    const avgResponseEl = document.getElementById('avgResponseTime');
    if (avgResponseEl) {
        avgResponseEl.textContent = avgResponse > 0 ? `${avgResponse.toFixed(1)}s` : '--';
    }
    
    const highRiskEl = document.getElementById('highRiskZones');
    if (highRiskEl && stats.zones) {
        highRiskEl.textContent = stats.zones.highRiskZones || 0;
    }
    
    const totalIncidentsEl = document.getElementById('totalIncidents');
    if (totalIncidentsEl && stats.zones) {
        totalIncidentsEl.textContent = stats.zones.totalIncidents || 0;
    }
    
    const avgZoneRiskEl = document.getElementById('avgZoneRisk');
    if (avgZoneRiskEl && stats.zones) {
        avgZoneRiskEl.textContent = stats.zones.averageRisk ? stats.zones.averageRisk.toFixed(1) : '--';
    }
}

// ==================================================
// DIJKSTRA PATH ANALYSIS RENDERING
// ==================================================

function renderDijkstraAnalysis() {
    const pathAnalysisDiv = document.getElementById('pathAnalysis');
    if (!pathAnalysisDiv || !systemState) return;
    
    // Find active emergencies with assigned patrols
    const activeWithRoutes = systemState.activeEmergencies?.filter(e => 
        e.assignedPatrol && e.route && (e.status === 'ASSIGNED' || e.status === 'RESPONDING')
    ) || [];
    
    if (activeWithRoutes.length === 0) {
        pathAnalysisDiv.innerHTML = '<p style=\"color: #7f8c8d; text-align: center; padding: 15px;\">No active patrol routes<br><small>Routes appear when patrols are dispatched</small></p>';
        return;
    }
    
    // Show the most recent route
    const latest = activeWithRoutes[activeWithRoutes.length - 1];
    const route = latest.route;
    
    pathAnalysisDiv.innerHTML = `
        <div class=\"path-analysis-item\">
            <div class=\"path-header\">
                <strong>🚓 ${latest.assignedPatrol} → 🚨 ${latest.id}</strong>
                <span class=\"path-eta\">${Math.ceil(latest.eta || route.totalTime)}s ETA</span>
            </div>
            <div class=\"path-details\">
                <div class=\"path-stat\">
                    <span class=\"stat-label\">Path Length:</span>
                    <span class=\"stat-value\">${route.path?.length || 0} nodes</span>
                </div>
                <div class=\"path-stat\">
                    <span class=\"stat-label\">Total Time:</span>
                    <span class=\"stat-value\">${route.totalTime}s</span>
                </div>
                <div class=\"path-stat\">
                    <span class=\"stat-label\">Algorithm:</span>
                    <span class=\"stat-value\">Dijkstra (Risk-Weighted)</span>
                </div>
            </div>
            <div class=\"path-explanation\">
                <strong>⚡ Why this path?</strong>
                <ul style=\"margin: 5px 0; padding-left: 20px; font-size: 12px; color: #bdc3c7;\">
                    <li>Danger zones have 3x time penalty</li>
                    <li>Algorithm avoids high-risk areas when possible</li>
                    <li>Safety prioritized over raw distance</li>
                </ul>
            </div>
        </div>
    `;
}

// ==================================================
// EMERGENCY DETAILS MODAL
// ==================================================

function showEmergencyDetails(emergency) {
    selectedEmergency = emergency;
    
    const modal = document.getElementById('emergencyModal');
    const details = document.getElementById('emergencyDetails');
    
    const waitTime = Math.floor((Date.now() - emergency.timestamp) / 1000);
    
    details.innerHTML = `
        <div style="line-height: 2;">
            <p><strong>Emergency ID:</strong> ${emergency.id}</p>
            <p><strong>Type:</strong> ${emergency.distress_type}</p>
            <p><strong>Location:</strong> ${emergency.nodeId}</p>
            <p><strong>Status:</strong> ${emergency.status}</p>
            <p><strong>Priority:</strong> ${emergency.priority.toFixed(1)}</p>
            <p><strong>Zone Risk:</strong> ${emergency.zone_risk_level.toFixed(1)}/10</p>
            <p><strong>Wait Time:</strong> ${waitTime}s</p>
            ${emergency.assignedPatrol ? `<p><strong>Assigned Patrol:</strong> ${emergency.assignedPatrol}</p>` : ''}
            ${emergency.eta ? `<p><strong>ETA:</strong> ${Math.ceil(emergency.eta)}s</p>` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('emergencyModal').classList.add('hidden');
    selectedEmergency = null;
}

function resolveCurrentEmergency() {
    if (selectedEmergency && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'RESOLVE_EMERGENCY',
            payload: {
                emergencyId: selectedEmergency.id
            }
        }));
        
        closeModal();
    }
}

// ==================================================
// DANGER ZONE CONTROLS
// ==================================================

function toggleDangerZone(nodeId, isDanger) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'TOGGLE_DANGER_ZONE',
            payload: {
                nodeId: nodeId,
                isDanger: isDanger
            }
        }));
    }
}

function resetSystem() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'RESET_SYSTEM'
        }));
        
        // Immediately clear visuals
        const pathGroup = document.getElementById('patrolPaths');
        if (pathGroup) pathGroup.innerHTML = '';
        
        showNotification('✓ System Reset', 'All emergencies cleared', 'success');
    }
}

// ==================================================
// MAP CONTROLS
// ==================================================

let currentScale = 1;
let currentTranslateX = 0;
let currentTranslateY = 0;

function zoomMap(factor) {
    currentScale *= factor;
    currentScale = Math.max(0.5, Math.min(3, currentScale)); // Limit zoom range
    updateMapTransform();
}

function resetMap() {
    currentScale = 1;
    currentTranslateX = 0;
    currentTranslateY = 0;
    updateMapTransform();
}

function updateMapTransform() {
    mapGroup.setAttribute('transform', 
        `translate(${currentTranslateX}, ${currentTranslateY}) scale(${currentScale})`
    );
}

// ==================================================
// SVG HELPER FUNCTIONS
// ==================================================

function createSVGElement(tag, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    
    for (let [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    
    return element;
}

// Make showEmergencyDetails available globally for onclick handlers
window.showEmergencyDetails = showEmergencyDetails;
