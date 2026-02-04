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
let isEditDangerZoneMode = false;

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

        // Send heartbeat every 30 seconds to keep connection alive
        if (window.heartbeatInterval) clearInterval(window.heartbeatInterval);
        window.heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'PING' }));
            }
        }, 30000);
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
        if (window.heartbeatInterval) clearInterval(window.heartbeatInterval);
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

    // System controls - with error handling
    const resetBtn = document.getElementById('btnResetSystem');
    if (resetBtn) {
        console.log('✓ Reset button found, attaching event listener');
        resetBtn.addEventListener('click', resetSystem);
        // Also set onclick as backup
        resetBtn.onclick = resetSystem;
    } else {
        console.error('❌ Reset button not found in DOM!');
    }

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

// OLD openPanelModal removed - using new version with comprehensive modal rendering below

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
            'data-node-id': node.id,
            style: 'cursor: pointer;' // Visual feedback that node is clickable
        });

        // Node circle with hover effect
        const circle = createSVGElement('circle', {
            class: 'node-circle',
            cx: node.x,
            cy: node.y,
            r: isDanger ? '12' : '8',
            fill: isDanger ? 'rgba(233, 69, 96, 0.5)' : 'rgba(52, 152, 219, 0.3)',
            stroke: isDanger ? '#e94560' : '#3498db',
            'stroke-width': isDanger ? '3' : '2'
        });

        // Node label with color coding
        const text = createSVGElement('text', {
            class: 'node-label',
            x: node.x,
            y: node.y - 15,
            'text-anchor': 'middle',
            fill: isDanger ? '#e94560' : '#bdc3c7',
            'font-weight': isDanger ? 'bold' : 'normal'
        });
        text.textContent = node.name || node.id;

        // Increase clickable area with invisible circle
        const hitArea = createSVGElement('circle', {
            cx: node.x,
            cy: node.y,
            r: '20', // Larger hit target
            fill: 'transparent',
            stroke: 'none',
            style: 'pointer-events: auto;'
        });
        nodeG.appendChild(hitArea);

        nodeG.appendChild(circle);
        nodeG.appendChild(text);

        // Click to toggle danger zone with visual feedback
        nodeG.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Node clicked:', node.id, 'EditMode:', isEditDangerZoneMode);

            if (!isEditDangerZoneMode) {
                // If not in edit mode, maybe just show notification or do nothing
                showNotification(
                    'ℹ️ Info',
                    'Activate "Edit Danger Zones" mode to modify zones.',
                    'info'
                );
                return;
            }

            toggleDangerZone(node.id, !isDanger);
            showNotification(
                isDanger ? '✓ Zone Normalized' : '⚠️ Danger Zone Activated',
                `${node.name || node.id} is now ${isDanger ? 'safe' : 'a danger zone'}`,
                isDanger ? 'info' : 'warning'
            );
        });

        // Add hover effect
        nodeG.addEventListener('mouseenter', () => {
            circle.setAttribute('stroke-width', isDanger ? '4' : '3');
            circle.setAttribute('fill', isDanger ? 'rgba(233, 69, 96, 0.7)' : 'rgba(52, 152, 219, 0.5)');
        });

        nodeG.addEventListener('mouseleave', () => {
            circle.setAttribute('stroke-width', isDanger ? '3' : '2');
            circle.setAttribute('fill', isDanger ? 'rgba(233, 69, 96, 0.5)' : 'rgba(52, 152, 219, 0.3)');
        });

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
                    stroke: '#3498db',
                    'stroke-width': '2',
                    opacity: '0.8',
                    style: 'pointer-events: none;'
                });

                // Station icon text
                const stationIcon = createSVGElement('text', {
                    x: stationNode.x,
                    y: stationNode.y + 5,
                    'text-anchor': 'middle',
                    'font-size': '16',
                    'font-weight': 'bold',
                    fill: '#3498db',
                    style: 'pointer-events: none;'
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
        // Patrol vehicle icon (HUGE and visible)
        const vehicle = createSVGElement('circle', {
            cx: patrol.x,
            cy: patrol.y,
            r: '20',
            fill: patrol.isEmergencyUnit ? '#ff6b00' : '#8e44ad', // Purple for regular units
            stroke: '#ffffff',
            'stroke-width': '5',
            opacity: '1',
            filter: 'drop-shadow(0 0 10px rgba(142, 68, 173, 0.8))',
            style: 'pointer-events: none;' // Pass clicks through to nodes underneath
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

function toggleEditDangerZoneMode() {
    isEditDangerZoneMode = !isEditDangerZoneMode;
    const btn = document.getElementById('btnToggleEditMode');
    if (btn) {
        btn.textContent = isEditDangerZoneMode ? '💾 SAVE DANGER ZONES' : '⚠️ EDIT DANGER ZONES';
        btn.classList.toggle('active', isEditDangerZoneMode);
    }

    // Add a visual indicator to the map
    const mapPanel = document.querySelector('.map-panel');
    if (mapPanel) {
        mapPanel.classList.toggle('edit-mode', isEditDangerZoneMode);
    }

    showNotification(
        isEditDangerZoneMode ? '⚠️ Edit Mode ON' : '✓ Edit Mode OFF',
        isEditDangerZoneMode ? 'You can now click on nodes to toggle danger zones.' : 'Danger zone configurations saved.',
        isEditDangerZoneMode ? 'warning' : 'success'
    );
}

// Make toggleEditDangerZoneMode globally accessible
window.toggleEditDangerZoneMode = toggleEditDangerZoneMode;

function resetSystem() {
    console.log('🔄 Reset System button clicked');
    console.log('WebSocket state:', ws.readyState, 'OPEN=', WebSocket.OPEN);

    if (ws.readyState === WebSocket.OPEN) {
        console.log('Sending RESET_SYSTEM message to server...');
        ws.send(JSON.stringify({
            type: 'RESET_SYSTEM'
        }));

        // Immediately clear ALL client-side state
        if (systemState) {
            systemState.activeEmergencies = [];
            systemState.emergencyQueue = [];
            systemState.resolutionHistory = [];
            systemState.zoneIntelligence = [];
            if (systemState.hashTableInternals) {
                systemState.hashTableInternals.zones = [];
                systemState.hashTableInternals.usedBuckets = 0;
                systemState.hashTableInternals.loadFactor = 0;
                systemState.hashTableInternals.totalCollisions = 0;
                systemState.hashTableInternals.maxChainLength = 0;
                systemState.hashTableInternals.buckets = [];
            }
        }

        // Immediately clear ALL UI sections

        // 1. Clear patrol paths
        const pathGroup = document.getElementById('patrolPaths');
        if (pathGroup) pathGroup.innerHTML = '';

        // 2. Clear emergency list and counter
        const emergencyList = document.getElementById('emergencyList');
        const emergencyCount = document.getElementById('emergencyCount');
        if (emergencyList) emergencyList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No active emergencies</p>';
        if (emergencyCount) emergencyCount.textContent = '0';

        // 3. Clear priority queue
        const queueList = document.getElementById('priorityQueueList');
        const queueSize = document.getElementById('queueSize');
        if (queueList) queueList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Queue empty</p>';
        if (queueSize) queueSize.textContent = '0';

        // 4. Clear zone intelligence (hash table section)
        const zoneList = document.getElementById('zoneIntelligenceList');
        const zoneCount = document.getElementById('zoneCount');
        if (zoneList) zoneList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No zone data yet</p>';
        if (zoneCount) zoneCount.textContent = '0';

        // 5. Clear resolution history
        const historyList = document.getElementById('historyList');
        if (historyList) historyList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No resolution history</p>';

        // Request fresh state from server
        setTimeout(() => {
            ws.send(JSON.stringify({ type: 'REQUEST_STATE' }));
        }, 100);

        showNotification('✓ System Reset', 'All emergencies and historical data cleared', 'success');
        console.log('✓ Reset message sent successfully - all sections cleared');
    } else {
        console.error('❌ WebSocket not connected! State:', ws.readyState);
        showNotification('❌ Connection Error', 'Not connected to server. Please refresh the page.', 'error');
    }
}

// Make resetSystem globally accessible for inline onclick
window.resetSystem = resetSystem;

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

// ==================================================
// PANEL MODAL FUNCTIONS (Detailed View)
// ==================================================

function openPanelModal(panelType) {
    const modal = document.getElementById('panelModal');
    const title = document.getElementById('panelModalTitle');
    const body = document.getElementById('panelModalBody');

    if (!systemState) {
        body.innerHTML = '<p style="text-align: center; padding: 20px;">Loading...</p>';
        return;
    }

    switch (panelType) {
        case 'priorityQueue':
            title.textContent = '📊 Priority Queue Analysis (Max-Heap)';
            body.innerHTML = renderPriorityQueueModal();
            break;
        case 'systemMetrics':
            title.textContent = '📈 System Performance Metrics';
            body.innerHTML = renderSystemMetricsModal();
            break;
        case 'zoneIntelligence':
            title.textContent = '🗂️ Hash Table Internals & Zone Intelligence';
            body.innerHTML = renderZoneIntelligenceModal();
            break;
        case 'dijkstraAnalysis':
            title.textContent = '🛣️ Dijkstra Path Analysis History';
            body.innerHTML = renderDijkstraModal();
            break;
        case 'activeEmergencies':
            title.textContent = '🚨 Active Emergencies - Live View';
            body.innerHTML = renderActiveEmergenciesModal();
            break;
        case 'patrolStatus':
            title.textContent = '🚓 Patrol Unit Status - Live View';
            body.innerHTML = renderPatrolStatusModal();
            break;
        default:
            title.textContent = 'Information';
            body.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for this section.</p>';
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePanelModal() {
    const modal = document.getElementById('panelModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Priority Queue Modal Content
function renderPriorityQueueModal() {
    const history = systemState.resolutionHistory || [];
    const currentQueue = systemState.emergencyQueue || [];

    let html = '<div style="max-height: 600px; overflow-y: auto;">';

    // Current Queue
    html += `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                🔴 Current Emergency Queue (${currentQueue.length})
            </h3>
            ${currentQueue.length === 0 ?
            '<p style="color: #7f8c8d; padding: 20px;">No emergencies in queue</p>' :
            currentQueue.map((e, idx) => `
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; margin: 10px 0; border-left: 4px solid #3498db;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 16px;">#${idx + 1} - ${e.id}</strong>
                            <span style="background: #3498db; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">
                                Priority: ${e.priority.toFixed(1)}
                            </span>
                        </div>
                        <div style="margin-top: 10px; color: #bdc3c7;">
                            <div><strong>Type:</strong> ${e.distress_type.toUpperCase()}</div>
                            <div><strong>Location:</strong> ${e.nodeId} (${e.location})</div>
                            <div style="margin-top: 10px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                                <div style="color: #f39c12;"><strong>📊 Priority Calculation Breakdown:</strong></div>
                                <div style="margin-left: 15px; font-size: 13px;">
                                    • <strong>Severity Score:</strong> ${e.distress_type === 'assault' || e.distress_type === 'kidnap' ? '50' : '30'} points (${e.distress_type} emergency)
                                    <br>• <strong>Time Waiting:</strong> ${Math.min(((Date.now() - e.timestamp) / 1000) * 2, 30).toFixed(1)} points (increases 2 pts/sec, max 30)
                                    <br>• <strong>Zone Risk Multiplier:</strong> ${(e.zone_risk_level * 5).toFixed(1)} points (${e.zone_risk_level.toFixed(1)}/10 risk × 5)
                                    <br>• <strong>Availability Bonus:</strong> 10 points (patrol available)
                                </div>
                                <div style="margin-top: 5px; color: #2ecc71; font-weight: bold;">
                                    = Total Priority: ${e.priority.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
        }
        </div>
    `;

    // Resolution History
    html += `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2ecc71; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
                ✅ Recently Resolved (Last ${Math.min(history.length, 10)})
            </h3>
            ${history.length === 0 ?
            '<p style="color: #7f8c8d; padding: 20px;">No resolution history yet</p>' :
            history.slice(0, 10).map(h => `
                    <div style="background: rgba(46, 204, 113, 0.1); padding: 15px; margin: 10px 0; border-left: 4px solid #2ecc71;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>${h.id}</strong>
                            <span style="color: #7f8c8d; font-size: 12px;">${new Date(h.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style="margin-top: 10px; color: #bdc3c7; font-size: 14px;">
                            <div><strong>🚨 Type:</strong> ${h.distressType.toUpperCase()} at ${h.location}</div>
                            <div><strong>🚓 Saved by:</strong> ${h.patrolName} (${h.patrolType})</div>
                            <div><strong>⏱️ Response Time:</strong> ${h.responseTime.toFixed(1)}s | Queue Position: #${h.queuePosition}</div>
                            <div style="margin-top: 10px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                                <div style="color: #f39c12;"><strong>📊 How It Was Prioritized:</strong></div>
                                <div style="margin-left: 15px; font-size: 12px;">
                                    • Severity: ${h.priorityBreakdown.severityScore} pts
                                    <br>• Wait Time: ${h.priorityBreakdown.timeScore.toFixed(1)} pts
                                    <br>• Zone Risk: ${h.priorityBreakdown.zoneRisk.toFixed(1)} pts (risk ${h.zoneRisk.toFixed(1)}/10)
                                    <br>• Availability: ${h.priorityBreakdown.availabilityBonus} pts
                                </div>
                                <div style="margin-top: 5px; color: #e74c3c; font-weight: bold;">
                                    = Final Priority: ${h.priority.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')
        }
        </div>
    `;

    html += '</div>';
    return html;
}

// System Metrics Modal
function renderSystemMetricsModal() {
    const history = systemState.resolutionHistory || [];
    const patrols = systemState.patrols || [];

    // Calculate metrics
    const avgResponseTime = history.length > 0 ?
        (history.reduce((sum, h) => sum + h.responseTime, 0) / history.length).toFixed(1) : '0';

    const typeBreakdown = {};
    history.forEach(h => {
        typeBreakdown[h.distressType] = (typeBreakdown[h.distressType] || 0) + 1;
    });

    const patrolStats = {};
    patrols.forEach(p => {
        const resolved = history.filter(h => h.patrolId === p.id);
        if (resolved.length > 0) {
            const avgTime = resolved.reduce((sum, h) => sum + h.responseTime, 0) / resolved.length;
            patrolStats[p.name] = {
                count: resolved.length,
                avgTime: avgTime.toFixed(1)
            };
        }
    });

    let html = '<div style="max-height: 600px; overflow-y: auto;">';

    // Overall Stats
    html += `
        <div style="background: rgba(52, 152, 219, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #3498db; margin-top: 0;">📊 Overall Performance</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
                    <div style="color: #7f8c8d; font-size: 12px;">Total Resolved</div>
                    <div style="font-size: 32px; font-weight: bold; color: #2ecc71;">${history.length}</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
                    <div style="color: #7f8c8d; font-size: 12px;">Avg Response Time</div>
                    <div style="font-size: 32px; font-weight: bold; color: #3498db;">${avgResponseTime}s</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
                    <div style="color: #7f8c8d; font-size: 12px;">Active Patrols</div>
                    <div style="font-size: 32px; font-weight: bold; color: #f39c12;">${patrols.filter(p => p.state !== 'IDLE').length}</div>
                </div>
            </div>
        </div>
    `;

    // Emergency Type Breakdown
    html += `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #e74c3c;">🚨 Emergency Type Breakdown</h3>
            ${Object.keys(typeBreakdown).length === 0 ?
            '<p style="color: #7f8c8d;">No data yet</p>' :
            Object.entries(typeBreakdown).map(([type, count]) => {
                const percent = ((count / history.length) * 100).toFixed(1);
                return `
                        <div style="margin: 10px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span style="text-transform: uppercase; font-weight: bold;">${type}</span>
                                <span>${count} (${percent}%)</span>
                            </div>
                            <div style="background: rgba(0,0,0,0.3); height: 20px; border-radius: 10px; overflow: hidden;">
                                <div style="background: #e74c3c; height: 100%; width: ${percent}%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `;
            }).join('')
        }
        </div>
    `;

    // Patrol Performance
    html += `
        <div>
            <h3 style="color: #2ecc71;">🚓 Patrol Performance</h3>
            ${Object.keys(patrolStats).length === 0 ?
            '<p style="color: #7f8c8d;">No data yet</p>' :
            Object.entries(patrolStats).map(([name, stats]) => `
                    <div style="background: rgba(46, 204, 113, 0.1); padding: 15px; margin: 10px 0; border-left: 4px solid #2ecc71;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${name}</strong>
                            <span style="color: #7f8c8d;">${stats.count} resolved</span>
                        </div>
                        <div style="margin-top: 5px; color: #bdc3c7;">
                            Avg Response: ${stats.avgTime}s
                        </div>
                    </div>
                `).join('')
        }
        </div>
    `;

    html += '</div>';
    return html;
}

// Zone Intelligence Modal (Database Overview)
function renderZoneIntelligenceModal() {
    const zones = systemState.zoneIntelligence || [];
    const internals = systemState.hashTableInternals || {};

    let html = '<div style="max-height: 600px; overflow-y: auto;">';

    // Database Overview Statistics
    const totalIncidents = zones.reduce((sum, z) => sum + z.past_incident_count, 0);
    const avgRisk = zones.length > 0 ? (zones.reduce((sum, z) => sum + z.risk_level, 0) / zones.length) : 0;
    const highRiskCount = zones.filter(z => z.risk_level >= 7).length;
    const mediumRiskCount = zones.filter(z => z.risk_level >= 4 && z.risk_level < 7).length;

    html += `
        <div style="background: rgba(155, 89, 182, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #9b59b6; margin-top: 0;">📊 Zone Intelligence Overview</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; text-align: center;">
                    <div style="color: #7f8c8d; font-size: 12px;">Total Zones Tracked</div>
                    <div style="font-size: 28px; font-weight: bold; color: #9b59b6;">${zones.length}</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; text-align: center;">
                    <div style="color: #7f8c8d; font-size: 12px;">High Risk Zones</div>
                    <div style="font-size: 28px; font-weight: bold; color: #e74c3c;">${highRiskCount}</div>
                    <div style="font-size: 10px; color: #7f8c8d;">(≥7/10)</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; text-align: center;">
                    <div style="color: #7f8c8d; font-size: 12px;">Medium Risk Zones</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${mediumRiskCount}</div>
                    <div style="font-size: 10px; color: #7f8c8d;">(4-7/10)</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; text-align: center;">
                    <div style="color: #7f8c8d; font-size: 12px;">Total Incidents</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${totalIncidents}</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; text-align: center;">
                    <div style="color: #7f8c8d; font-size: 12px;">Avg Risk Level</div>
                    <div style="font-size: 28px; font-weight: bold; color: ${avgRisk >= 7 ? '#e74c3c' : avgRisk >= 4 ? '#f39c12' : '#2ecc71'};">${avgRisk.toFixed(1)}/10</div>
                </div>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px; font-size: 13px; color: #bdc3c7;">
                <strong style="color: #f39c12;">💡 How Zone Intelligence Works:</strong><br>
                • <strong>Learning System:</strong> Every emergency teaches the system which areas need more attention<br>
                • <strong>Risk Calculation:</strong> Higher risk = more frequent incidents + more severe emergency types<br>
                • <strong>Smart Routing:</strong> High-risk zones get 3x priority weight for faster patrol dispatch
            </div>
        </div>
    `;

    // All Zones Summary
    const allZonesSorted = zones.sort((a, b) => b.risk_level - a.risk_level);
    if (allZonesSorted.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #3498db;">📍 All Tracked Zones (Sorted by Risk)</h3>
                <div style="font-size: 13px; color: #7f8c8d; margin-bottom: 10px;">
                    Showing all ${allZonesSorted.length} zones with incident data
                </div>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${allZonesSorted.map((zone, idx) => {
            const riskColor = zone.risk_level >= 7 ? '#e74c3c' : zone.risk_level >= 4 ? '#f39c12' : '#2ecc71';
            return `
                        <div style="background: rgba(52, 152, 219, 0.1); padding: 12px; margin: 8px 0; border-left: 4px solid ${riskColor}; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold; color: #3498db;">${idx + 1}. ${zone.zoneId}</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 3px;">
                                    ${zone.past_incident_count} incidents | ${zone.dominant_distress_type}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 20px; font-weight: bold; color: ${riskColor};">
                                    ${zone.risk_level.toFixed(1)}/10
                                </div>
                                <div style="font-size: 11px; color: #7f8c8d;">
                                    ${zone.average_response_time.toFixed(0)}s avg
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    // High Risk Zones
    const highRiskZones = zones.filter(z => z.risk_level >= 7).sort((a, b) => b.risk_level - a.risk_level);
    html += `
        <div>
            <h3 style="color: #e74c3c;">⚠️ High-Risk Zones (Risk ≥ 7/10)</h3>
            ${highRiskZones.length === 0 ?
            '<p style="color: #7f8c8d;">No high-risk zones currently</p>' :
            highRiskZones.map(zone => `
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 15px; margin: 10px 0; border-left: 4px solid #e74c3c;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong style="font-size: 16px;">${zone.zoneId}</strong>
                            <span style="background: #e74c3c; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">
                                ${zone.risk_level.toFixed(1)}/10
                            </span>
                        </div>
                        <div style="margin-top: 10px; color: #bdc3c7; font-size: 14px;">
                            <div><strong>📊 Past Incidents:</strong> ${zone.past_incident_count}</div>
                            <div><strong>🚨 Dominant Type:</strong> ${zone.dominant_distress_type.toUpperCase()}</div>
                            <div><strong>⏱️ Avg Response:</strong> ${zone.average_response_time.toFixed(1)}s</div>
                            <div style="margin-top: 5px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 3px; font-size: 12px;">
                                <strong style="color: #f39c12;">🎯 Impact on Routing:</strong><br>
                                Dijkstra applies <span style="color: #e74c3c; font-weight: bold;">3x time penalty</span> to edges through this zone
                            </div>
                        </div>
                    </div>
                `).join('')
        }
        </div>
    `;

    html += '</div>';
    return html;
}

// Dijkstra Analysis Modal
function renderDijkstraModal() {
    const history = systemState.resolutionHistory || [];

    let html = '<div style="max-height: 600px; overflow-y: auto;">';

    if (history.length === 0) {
        html += '<p style="text-align: center; color: #7f8c8d; padding: 40px;">No path analysis data yet. Paths will appear as emergencies are resolved.</p>';
    } else {
        html += `
            <h3 style="color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                🛣️ Last ${Math.min(history.length, 10)} Pathfinding Decisions
            </h3>
        `;

        history.slice(0, 10).forEach((h, idx) => {
            const dangerPenalty = h.dangerZonesAvoided * 3; // Estimated time added/saved

            html += `
                <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; margin: 15px 0; border-left: 4px solid #3498db;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 16px;">${idx + 1}. ${h.patrolName} → ${h.id}</strong>
                        <span style="color: #7f8c8d; font-size: 12px;">${new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                    
                    <div style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
                        <div style="color: #f39c12; font-weight: bold; margin-bottom: 10px;">📊 Path Analysis:</div>
                        <div style="color: #bdc3c7; font-size: 14px; line-height: 1.8;">
                            <div><strong>Path Length:</strong> ${h.pathLength} nodes</div>
                            <div><strong>Total Time:</strong> ${h.totalTime}s</div>
                            <div><strong>Algorithm:</strong> Dijkstra (Risk-Weighted Shortest Path)</div>
                            <div><strong>Nodes Explored:</strong> ~${h.alternativePathsConsidered} (shows algorithm efficiency)</div>
                        </div>
                        
                        <div style="margin-top: 15px; padding: 10px; background: rgba(155, 89, 182, 0.2); border-left: 3px solid #9b59b6; border-radius: 3px;">
                            <div style="color: #9b59b6; font-weight: bold; margin-bottom: 8px;">🎯 Why This Path?</div>
                            <ul style="margin: 0; padding-left: 20px; color: #bdc3c7; font-size: 13px; line-height: 1.6;">
                                <li>Danger zones in path: <strong style="color: ${h.dangerZonesAvoided > 0 ? '#e74c3c' : '#2ecc71'};">${h.dangerZonesAvoided}</strong></li>
                                <li>Zone risk at destination: <strong>${h.zoneRisk.toFixed(1)}/10</strong></li>
                                ${h.dangerZonesAvoided > 0 ?
                    `<li style="color: #e74c3c;">⚠️ Unavoidable danger zones (safest path still goes through ${h.dangerZonesAvoided} risky areas)</li>` :
                    `<li style="color: #2ecc71;">✓ Clean path - no danger zones crossed</li>`
                }
                                <li>Estimated danger penalty: ~${dangerPenalty}s added to travel time</li>
                            </ul>
                        </div>
                        
                        <div style="margin-top: 10px; padding: 10px; background: rgba(46, 204, 113, 0.2); border-left: 3px solid #2ecc71; border-radius: 3px;">
                            <div style="color: #2ecc71; font-weight: bold; margin-bottom: 5px;">✅ Outcome:</div>
                            <div style="color: #bdc3c7; font-size: 13px;">
                                Emergency resolved in <strong>${h.responseTime.toFixed(1)}s</strong> | 
                                Zone had ${h.zonePastIncidents} past incidents
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    return html;
}

// Active Emergencies Modal
function renderActiveEmergenciesModal() {
    const emergencies = systemState.emergencies || [];

    let html = '<div style="max-height: 600px; overflow-y: auto;">';

    if (emergencies.length === 0) {
        html += '<p style="text-align: center; padding: 40px; color: #7f8c8d;">No active emergencies at the moment</p>';
    } else {
        html += `<h3 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">🚨 ${emergencies.length} Active Emergency${emergencies.length > 1 ? 'ies' : ''}</h3>`;

        emergencies.forEach(e => {
            const statusColor = {
                'PENDING': '#f39c12',
                'ASSIGNED': '#3498db',
                'RESPONDING': '#9b59b6',
                'ENGAGED': '#2ecc71'
            }[e.status] || '#7f8c8d';

            const waitTime = ((Date.now() - e.timestamp) / 1000).toFixed(1);

            html += `
                <div style="background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(155, 89, 182, 0.1)); padding: 20px; margin: 15px 0; border-left: 5px solid ${statusColor}; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h4 style="margin: 0; color: #ecf0f1; font-size: 18px;">${e.id}</h4>
                            <span style="color: #95a5a6; font-size: 13px;">Reported ${waitTime}s ago</span>
                        </div>
                        <span style="background: ${statusColor}; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 13px;">
                            ${e.status}
                        </span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div>
                            <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">📍 LOCATION</div>
                            <div style="color: #ecf0f1; font-weight: bold;">${e.location}</div>
                            <div style="color: #95a5a6; font-size: 12px;">Node: ${e.nodeId}</div>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">🚨 EMERGENCY TYPE</div>
                            <div style="color: #ecf0f1; font-weight: bold; text-transform: uppercase;">${e.distress_type}</div>
                        </div>
                    </div>
                    
                    ${e.assignedPatrol ? `
                        <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                            <div style="color: #3498db; font-size: 12px; margin-bottom: 5px;">🚓 ASSIGNED PATROL</div>
                            <div style="color: #ecf0f1;">${e.assignedPatrol.name}</div>
                            <div style="color: #95a5a6; font-size: 12px;">${e.assignedPatrol.type.toUpperCase()} • ${e.assignedPatrol.currentLocation || 'En route'}</div>
                        </div>
                    ` : `
                        <div style="margin-top: 15px; padding: 10px; background: rgba(243, 156, 18, 0.2); border-radius: 5px;">
                            <div style="color: #f39c12;">⏳ Waiting for patrol assignment...</div>
                        </div>
                    `}
                    
                    <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 5px;">
                        <div style="color: #f39c12; font-size: 12px; margin-bottom: 8px;">📊 PRIORITY CALCULATION</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; color: #bdc3c7;">
                            <div>• Severity: ${e.distress_type === 'assault' || e.distress_type === 'kidnap' ? '50' : '30'} pts</div>
                            <div>• Zone Risk: ${(e.zone_risk_level * 5).toFixed(1)} pts</div>
                            <div>• Wait Time: ${(waitTime * 2).toFixed(1)} pts</div>
                            <div style="color: #2ecc71; font-weight: bold;">= Priority: ${e.priority ? e.priority.toFixed(1) : 'Calculating...'}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    return html;
}

// Patrol Status Modal
function renderPatrolStatusModal() {
    const patrols = systemState.patrols || [];

    let html = '<div style="max-height: 600px; overflow-y: auto;">';

    if (patrols.length === 0) {
        html += '<p style="text-align: center; padding: 40px; color: #7f8c8d;">No patrol units available</p>';
    } else {
        const availableCount = patrols.filter(p => p.status === 'IDLE').length;
        const activeCount = patrols.length - availableCount;

        html += `
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1; background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold;">${availableCount}</div>
                    <div style="font-size: 13px; color: rgba(255,255,255,0.9);">AVAILABLE</div>
                </div>
                <div style="flex: 1; background: linear-gradient(135deg, #3498db, #2980b9); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold;">${activeCount}</div>
                    <div style="font-size: 13px; color: rgba(255,255,255,0.9);">ON DUTY</div>
                </div>
            </div>
        `;

        // Group by status
        const idle = patrols.filter(p => p.status === 'IDLE');
        const active = patrols.filter(p => p.status !== 'IDLE');

        if (active.length > 0) {
            html += `<h3 style="color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px;">🚓 On Active Duty (${active.length})</h3>`;

            active.forEach(p => {
                const statusColor = {
                    'RESPONDING': '#f39c12',
                    'ENGAGED': '#e74c3c',
                    'RETURNING': '#9b59b6'
                }[p.status] || '#3498db';

                html += `
                    <div style="background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(155, 89, 182, 0.15)); padding: 18px; margin: 12px 0; border-left: 5px solid ${statusColor}; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div>
                                <h4 style="margin: 0; color: #ecf0f1; font-size: 17px;">${p.name}</h4>
                                <span style="color: #95a5a6; font-size: 12px;">${p.type.toUpperCase()}</span>
                            </div>
                            <span style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 15px; font-weight: bold; font-size: 12px;">
                                ${p.status}
                            </span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                            <div>
                                <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 3px;">📍 CURRENT LOCATION</div>
                                <div style="color: #ecf0f1; font-size: 13px;">${p.currentLocation || 'Unknown'}</div>
                            </div>
                            ${p.targetEmergency ? `
                                <div>
                                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 3px;">🎯 TARGET EMERGENCY</div>
                                    <div style="color: #ecf0f1; font-size: 13px;">${p.targetEmergency}</div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${p.path && p.path.length > 0 ? `
                            <div style="margin-top: 12px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                                <div style="color: #3498db; font-size: 11px; margin-bottom: 5px;">🗺️ ROUTE</div>
                                <div style="color: #bdc3c7; font-size: 12px;">${p.path.join(' → ')}</div>
                                <div style="color: #95a5a6; font-size: 11px; margin-top: 5px;">${p.pathIndex || 0}/${p.path.length} waypoints completed</div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }

        if (idle.length > 0) {
            html += `<h3 style="color: #2ecc71; border-bottom: 2px solid #2ecc71; padding-bottom: 10px; margin-top: 30px;">✅ Available Patrols (${idle.length})</h3>`;

            idle.forEach(p => {
                html += `
                    <div style="background: rgba(46, 204, 113, 0.15); padding: 18px; margin: 12px 0; border-left: 5px solid #2ecc71; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0; color: #ecf0f1; font-size: 17px;">${p.name}</h4>
                                <span style="color: #95a5a6; font-size: 12px;">${p.type.toUpperCase()}</span>
                            </div>
                            <span style="background: #2ecc71; color: white; padding: 6px 12px; border-radius: 15px; font-weight: bold; font-size: 12px;">
                                READY
                            </span>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 3px;">📍 STATIONED AT</div>
                            <div style="color: #ecf0f1; font-size: 13px;">${p.currentLocation || p.startNode}</div>
                        </div>
                    </div>
                `;
            });
        }
    }

    html += '</div>';
    return html;
}

// Make functions globally available
window.openPanelModal = openPanelModal;
window.closePanelModal = closePanelModal;
