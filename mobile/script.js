/**
 * MOBILE INCIDENT GENERATOR - CLIENT-SIDE LOGIC
 * 
 * Single device simulating multiple users
 * Each tap creates an independent emergency alert
 */

// WebSocket connection
let ws;
let mapData = null;
let selectedNode = null;
let sentAlerts = [];

// SVG elements
let svg;
let mapGroup;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    initializeUI();
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
        updateConnectionStatus(true);
        
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
        updateConnectionStatus(false);
    };
    
    ws.onclose = () => {
        console.log('Disconnected from server. Reconnecting...');
        updateConnectionStatus(false);
        setTimeout(initializeWebSocket, 3000);
    };
}

function handleServerMessage(message) {
    switch (message.type) {
        case 'INITIAL_STATE':
            mapData = message.data.map;
            renderMap();
            break;
            
        case 'STATE_UPDATE':
            mapData = message.data.map;
            updateAlertStatuses(message.data.activeEmergencies);
            renderMap();
            
            // Clear sent alerts if no active emergencies
            if (!message.data.activeEmergencies || message.data.activeEmergencies.length === 0) {
                sentAlerts = [];
                const alertList = document.getElementById('alertList');
                if (alertList) alertList.innerHTML = '<p class="no-alerts">No alerts sent yet</p>';
            }
            break;
    }
}

function updateConnectionStatus(isConnected) {
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    
    if (isConnected) {
        statusText.textContent = 'Connected';
        statusDot.classList.add('connected');
    } else {
        statusText.textContent = 'Disconnected';
        statusDot.classList.remove('connected');
    }
}

// ==================================================
// UI INITIALIZATION
// ==================================================

function initializeUI() {
    svg = document.getElementById('mobileMap');
    mapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mapGroup.setAttribute('id', 'mapGroup');
    svg.appendChild(mapGroup);
    
    // Map click handler
    svg.addEventListener('click', handleMapClick);
    
    // Form controls
    document.getElementById('btnSendAlert').addEventListener('click', sendEmergencyAlert);
    document.getElementById('btnClearSelection').addEventListener('click', clearSelection);
    
    // Distress type change
    document.getElementById('distressType').addEventListener('change', updateSendButton);
}

// ==================================================
// MAP RENDERING
// ==================================================

function renderMap() {
    if (!mapData || !mapData.nodes) return;
    
    mapGroup.innerHTML = '';
    
    try {
        // Render edges
        if (mapData.edges) renderEdges();
        
        // Render danger zones
        if (mapData.dangerZones) renderDangerZones();
        
        // Render nodes
        renderNodes();
        
        // Render selected location marker
        if (selectedNode) {
            renderSelectedMarker();
        }
    } catch (error) {
        console.error('Error rendering map:', error);
    }
}

function renderEdges() {
    if (!mapData || !mapData.edges || !mapData.nodes) return;
    
    const edgeGroup = createSVGElement('g', { id: 'edges' });
    
    mapData.edges.forEach(edge => {
        const fromNode = mapData.nodes.find(n => n.id === edge.from);
        const toNode = mapData.nodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        const line = createSVGElement('line', {
            class: `map-edge ${edge.isDangerZone ? 'danger' : ''}`,
            x1: fromNode.x,
            y1: fromNode.y,
            x2: toNode.x,
            y2: toNode.y
        });
        
        edgeGroup.appendChild(line);
    });
    
    mapGroup.appendChild(edgeGroup);
}

function renderDangerZones() {
    if (!mapData || !mapData.dangerZones || !mapData.nodes) return;
    
    const dangerGroup = createSVGElement('g', { id: 'danger-zones' });
    
    mapData.dangerZones.forEach(zoneId => {
        const node = mapData.nodes.find(n => n.id === zoneId);
        if (!node) return;
        
        const circle = createSVGElement('circle', {
            cx: node.x,
            cy: node.y,
            r: '25',
            fill: 'rgba(233, 69, 96, 0.2)',
            stroke: '#e94560',
            'stroke-width': '1',
            'stroke-dasharray': '4,2'
        });
        
        dangerGroup.appendChild(circle);
    });
    
    mapGroup.appendChild(dangerGroup);
}

function renderNodes() {
    if (!mapData || !mapData.nodes || !mapData.dangerZones) return;
    
    const nodeGroup = createSVGElement('g', { id: 'nodes' });
    
    mapData.nodes.forEach(node => {
        const isDanger = mapData.dangerZones.includes(node.id);
        
        const nodeG = createSVGElement('g', {
            class: 'map-node',
            'data-node-id': node.id
        });
        
        const circle = createSVGElement('circle', {
            cx: node.x,
            cy: node.y,
            r: isDanger ? '10' : '7',
            fill: isDanger ? 'rgba(233, 69, 96, 0.4)' : 'rgba(52, 152, 219, 0.4)',
            stroke: isDanger ? '#e94560' : '#3498db',
            'stroke-width': '2'
        });
        
        const text = createSVGElement('text', {
            x: node.x,
            y: node.y - 12,
            'text-anchor': 'middle',
            'font-size': '9',
            fill: '#bdc3c7'
        });
        text.textContent = node.id;
        
        nodeG.appendChild(circle);
        nodeG.appendChild(text);
        nodeGroup.appendChild(nodeG);
    });
    
    mapGroup.appendChild(nodeGroup);
}

function renderSelectedMarker() {
    const node = mapData.nodes.find(n => n.id === selectedNode);
    if (!node) return;
    
    const marker = createSVGElement('g', {
        class: 'selected-location-marker'
    });
    
    // Outer pulse ring
    const ring = createSVGElement('circle', {
        cx: node.x,
        cy: node.y,
        r: '15',
        fill: 'none',
        stroke: '#e94560',
        'stroke-width': '2'
    });
    
    // Inner marker
    const dot = createSVGElement('circle', {
        cx: node.x,
        cy: node.y,
        r: '8',
        fill: '#e94560'
    });
    
    // Person icon (simplified)
    const person = createSVGElement('text', {
        x: node.x,
        y: node.y + 4,
        'text-anchor': 'middle',
        'font-size': '12',
        fill: '#fff',
        'font-weight': 'bold'
    });
    person.textContent = '👤';
    
    marker.appendChild(ring);
    marker.appendChild(dot);
    marker.appendChild(person);
    
    mapGroup.appendChild(marker);
}

// ==================================================
// MAP INTERACTION
// ==================================================

function handleMapClick(event) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Convert screen coordinates to SVG coordinates
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Find nearest node
    const nearestNode = findNearestNode(x, y);
    
    if (nearestNode) {
        selectLocation(nearestNode);
    }
}

function findNearestNode(x, y) {
    if (!mapData) return null;
    
    // Get patrol station locations to avoid
    const patrolStations = [
        { x: 910, y: 605 },  // PATROL_1 - C7
        { x: 210, y: 385 },  // PATROL_2 - UCN2
        { x: 350, y: 825 },  // PATROL_3 - LCS3
        { x: 70, y: 605 },   // PATROL_4 - C1
        { x: 1330, y: 605 }, // PATROL_5 - C10
        { x: 1190, y: 165 }  // PATROL_6 - UN9
    ];
    
    let nearest = null;
    let minDistance = Infinity;
    
    mapData.nodes.forEach(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if node is far enough from all patrol stations
        const farFromPatrols = patrolStations.every(station => {
            const sdx = node.x - station.x;
            const sdy = node.y - station.y;
            const stationDistance = Math.sqrt(sdx * sdx + sdy * sdy);
            return stationDistance > 200; // Minimum 200px away from any patrol
        });
        
        if (distance < minDistance && distance < 30 && farFromPatrols) {
            minDistance = distance;
            nearest = node;
        }
    });
    
    // If no valid node found (all too close to patrols), show warning
    if (!nearest) {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = 'Too close to patrol! Pick another spot';
            statusText.style.color = '#e74c3c';
            setTimeout(() => {
                statusText.textContent = 'Connected';
                statusText.style.color = '';
            }, 2000);
        }
    }
    
    return nearest;
}

function selectLocation(node) {
    selectedNode = node.id;
    
    document.getElementById('selectedLocation').textContent = `${node.name} (${node.id})`;
    
    // Show tap indicator
    showTapIndicator(node.x, node.y);
    
    updateSendButton();
    renderMap();
}

function showTapIndicator(x, y) {
    const indicator = document.getElementById('tapIndicator');
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Convert SVG coordinates to screen coordinates
    const scaleX = rect.width / viewBox.width;
    const scaleY = rect.height / viewBox.height;
    
    const screenX = x * scaleX;
    const screenY = y * scaleY;
    
    indicator.style.left = `${screenX - 20}px`;
    indicator.style.top = `${screenY - 20}px`;
    indicator.style.display = 'block';
    
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 1500);
}

function clearSelection() {
    selectedNode = null;
    document.getElementById('selectedLocation').textContent = 'None';
    updateSendButton();
    renderMap();
}

function updateSendButton() {
    const btn = document.getElementById('btnSendAlert');
    btn.disabled = !selectedNode;
}

// ==================================================
// SEND EMERGENCY ALERT
// ==================================================

function sendEmergencyAlert() {
    if (!selectedNode || !mapData) {
        showToast('Please select a location first', 'error');
        return;
    }
    
    if (ws.readyState !== WebSocket.OPEN) {
        showToast('Not connected to server', 'error');
        return;
    }
    
    const distressType = document.getElementById('distressType').value;
    const description = document.getElementById('description').value;
    
    const node = mapData.nodes.find(n => n.id === selectedNode);
    
    if (!node) {
        showToast('Invalid location selected', 'error');
        return;
    }
    
    const alert = {
        type: 'NEW_EMERGENCY',
        payload: {
            nodeId: selectedNode,
            location: node.name,
            distress_type: distressType,
            description: description
        }
    };
    
    ws.send(JSON.stringify(alert));
    
    // Add to local alert list
    const localAlert = {
        id: `LOCAL_${Date.now()}`,
        nodeId: selectedNode,
        location: node.name,
        distress_type: distressType,
        status: 'PENDING',
        timestamp: Date.now()
    };
    
    sentAlerts.unshift(localAlert);
    
    showToast(`Emergency alert sent from ${node.name}!`, 'success');
    
    // Clear form
    document.getElementById('description').value = '';
    clearSelection();
    
    // Update alert list
    renderAlertList();
}

// ==================================================
// RANDOM ALERTS (TESTING)
// ==================================================

function sendRandomAlert(type) {
    if (!mapData || ws.readyState !== WebSocket.OPEN) return;
    
    const randomNode = mapData.nodes[Math.floor(Math.random() * mapData.nodes.length)];
    
    const alert = {
        type: 'NEW_EMERGENCY',
        payload: {
            nodeId: randomNode.id,
            location: randomNode.name,
            distress_type: type,
            description: `Random ${type} incident for testing`
        }
    };
    
    ws.send(JSON.stringify(alert));
    
    showToast(`Random ${type} alert sent!`, 'success');
}

function sendMultipleAlerts(count) {
    if (!mapData || ws.readyState !== WebSocket.OPEN) return;
    
    const types = ['harassment', 'stalking', 'assault'];
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const randomType = types[Math.floor(Math.random() * types.length)];
            sendRandomAlert(randomType);
        }, i * 500); // Stagger alerts by 500ms
    }
    
    showToast(`Sending ${count} alerts to test system overload...`, 'success');
}

// ==================================================
// ALERT LIST
// ==================================================

function renderAlertList() {
    const alertList = document.getElementById('alertList');
    const alertCount = document.getElementById('alertCount');
    
    alertCount.textContent = sentAlerts.length;
    
    if (sentAlerts.length === 0) {
        alertList.innerHTML = '<p class="empty-message">No alerts sent yet</p>';
        return;
    }
    
    alertList.innerHTML = sentAlerts.map(alert => {
        const elapsed = Math.floor((Date.now() - alert.timestamp) / 1000);
        const statusClass = `status-${alert.status.toLowerCase()}`;
        
        // Status icon and human-readable message
        const statusIcon = {
            'PENDING': '🟡',
            'ASSIGNED': '🟠',
            'RESPONDING': '🔵',
            'ENGAGED': '🔴',
            'RESOLVED': '✅'
        }[alert.status] || '⚪';
        
        const statusText = {
            'PENDING': 'Waiting for patrol...',
            'ASSIGNED': 'Patrol assigned!',
            'RESPONDING': 'Help on the way!',
            'ENGAGED': 'Patrol at scene - Helping!',
            'RESOLVED': '✓ Emergency Resolved - You are Safe!'
        }[alert.status] || alert.status;
        
        const patrolDisplay = alert.assignedPatrol ? 
            `<div><strong>🚓 Patrol:</strong> ${alert.assignedPatrol}</div>` : 
            '<div style="color: #f39c12;"><em>⏳ No patrol assigned yet...</em></div>';
        
        const resolutionMessage = alert.status === 'RESOLVED' && alert.responseTime ? 
            `<div style="background: #2ecc71; color: white; padding: 8px; border-radius: 4px; margin-top: 8px; text-align: center; font-weight: bold;">
                ✓ WOMAN SAVED! Response time: ${alert.responseTime.toFixed(0)}s
            </div>` : '';
        
        return `
            <div class="alert-item ${alert.status === 'RESOLVED' ? 'resolved' : ''}">
                <div class="alert-item-header">
                    <span class="alert-item-id">${alert.id}</span>
                    <span class="alert-item-status ${statusClass}">${statusIcon} ${statusText}</span>
                </div>
                <div class="alert-item-details">
                    <div><strong>Type:</strong> ${alert.distress_type}</div>
                    <div><strong>Location:</strong> ${alert.location}</div>
                    <div><strong>Time:</strong> ${elapsed}s ago</div>
                    ${patrolDisplay}
                    ${resolutionMessage}
                </div>
            </div>
        `;
    }).join('');
}

function updateAlertStatuses(activeEmergencies) {
    if (!activeEmergencies) return;
    
    // Update local alert statuses based on server data
    sentAlerts.forEach(localAlert => {
        // Try to match by ID first (if server assigned one)
        let serverAlert = activeEmergencies.find(e => e.id === localAlert.id);
        
        // If no ID match, try matching by location and timestamp (within 5 seconds)
        if (!serverAlert && localAlert.id.startsWith('LOCAL_')) {
            serverAlert = activeEmergencies.find(e => 
                e.nodeId === localAlert.nodeId && 
                Math.abs(e.timestamp - localAlert.timestamp) < 5000
            );
        }
        
        if (serverAlert) {
            localAlert.id = serverAlert.id;
            localAlert.status = serverAlert.status;
            localAlert.assignedPatrol = serverAlert.assignedPatrol;
            localAlert.responseTime = serverAlert.responseTime;
        }
    });
    
    renderAlertList();
}

// ==================================================
// TOAST NOTIFICATIONS
// ==================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
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

// Make functions available globally for onclick handlers
window.sendRandomAlert = sendRandomAlert;
window.sendMultipleAlerts = sendMultipleAlerts;
