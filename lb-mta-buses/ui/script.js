let currentRole = null;
let busRoutes = [];
let activeBuses = [];

// Navigation
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Role selection
function selectRole(role) {
    currentRole = role;
    localStorage.setItem('mta_role', role);
    fetchNui('setRole', { role: role });
    
    if (role === 'passenger') {
        navigateTo('passenger-page');
        loadNearbyBuses();
    } else if (role === 'driver') {
        navigateTo('driver-page');
        loadRouteSelection();
    } else if (role === 'dispatcher') {
        navigateTo('dispatcher-page');
        startDispatcherUpdates();
    }
}

// Load routes from server
function loadRoutes() {
    fetchNui('getRoutes', {}, (routes) => {
        busRoutes = routes;
        displayRoutes();
    });
}

// Display routes list
function displayRoutes() {
    const routesList = document.getElementById('routes-list');
    if (!routesList) return;
    
    routesList.innerHTML = busRoutes.map(route => `
        <div class="route-card" onclick="viewRoute('${route.id}')" style="border-left: 4px solid ${route.color}">
            <div class="route-header">
                <span class="route-id">${route.id}</span>
                <span class="route-name">${route.name}</span>
            </div>
            <div class="route-info">
                <span class="route-schedule">${route.schedule}</span>
                <span class="route-frequency">${route.frequency}</span>
            </div>
        </div>
    `).join('');
}

// View route details
function viewRoute(routeId) {
    const route = busRoutes.find(r => r.id === routeId);
    if (!route) return;
    
    document.getElementById('route-detail-name').textContent = `Route ${route.id}`;
    document.getElementById('route-detail-content').innerHTML = `
        <div class="route-detail-card" style="border-left: 4px solid ${route.color}">
            <h3>${route.name}</h3>
            <div class="detail-section">
                <h4>Schedule</h4>
                <p>${route.schedule}</p>
                <p class="frequency">Frequency: ${route.frequency}</p>
            </div>
            <div class="detail-section">
                <h4>Fare</h4>
                <p class="fare-amount">$${route.fare.toFixed(2)}</p>
            </div>
            <div class="detail-section">
                <h4>Stops</h4>
                <div class="stops-list">
                    ${route.stops.map((stop, i) => `
                        <div class="stop-item">
                            <div class="stop-number">${i + 1}</div>
                            <div class="stop-name">${stop}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    navigateTo('route-detail');
}

// Trip Planning
function planTrip() {
    const from = document.getElementById('trip-from').value;
    const to = document.getElementById('trip-to').value;
    
    if (!from || !to) {
        showNotification('Please select both origin and destination');
        return;
    }
    
    fetchNui('planTrip', { from, to }, (trip) => {
        displayTripResults(trip);
    });
}

function displayTripResults(trip) {
    const resultsDiv = document.getElementById('trip-results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <div class="trip-card">
            <div class="trip-header">
                <span class="trip-time">${trip.totalTime} min</span>
                <span class="trip-fare">$${trip.fare.toFixed(2)}</span>
            </div>
            <div class="trip-routes">
                ${trip.routes.map(r => `<span class="route-badge">${r}</span>`).join(' ')}
                ${trip.transfers > 0 ? `<span class="transfers">${trip.transfers} transfer${trip.transfers > 1 ? 's' : ''}</span>` : ''}
            </div>
            <div class="trip-steps">
                ${trip.steps.map(step => {
                    if (step.type === 'transfer') {
                        return `<div class="step transfer">↻ Transfer (${step.duration} min)</div>`;
                    }
                    return `
                        <div class="step">
                            <span class="step-route">${step.route}</span>
                            <span class="step-desc">${step.from} → ${step.to}</span>
                            <span class="step-time">${step.duration} min</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Load nearby buses
function loadNearbyBuses() {
    fetchNui('getActiveBuses', {}, (buses) => {
        activeBuses = buses;
        displayNearbyBuses();
    });
}

function displayNearbyBuses() {
    const nearbyList = document.getElementById('nearby-list');
    if (!nearbyList) return;
    
    if (activeBuses.length === 0) {
        nearbyList.innerHTML = '<p class="empty-state">No buses nearby</p>';
        return;
    }
    
    nearbyList.innerHTML = activeBuses.map(bus => {
        const route = busRoutes.find(r => r.id === bus.routeId);
        return `
            <div class="bus-card" style="border-left: 4px solid ${route?.color || '#0039A6'}">
                <div class="bus-route">${bus.routeId}</div>
                <div class="bus-info">
                    <div class="bus-speed">${Math.round(bus.speed || 0)} mph</div>
                    <div class="bus-passengers">${bus.passengers || 0} passengers</div>
                </div>
                <div class="bus-eta">8 min</div>
            </div>
        `;
    }).join('');
}

// Driver functions
function loadRouteSelection() {
    fetchNui('getRoutes', {}, (routes) => {
        busRoutes = routes;
        const routeSelection = document.getElementById('route-selection');
        routeSelection.innerHTML = routes.map(route => `
            <div class="route-select-card" onclick="startDriving('${route.id}')" style="border-left: 4px solid ${route.color}">
                <div class="route-id">${route.id}</div>
                <div class="route-name">${route.name}</div>
                <div class="route-stops">${route.stops.length} stops</div>
            </div>
        `).join('');
    });
}

function startDriving(routeId) {
    fetchNui('startDriving', { routeId }, (response) => {
        if (response.success) {
            document.getElementById('driver-idle').style.display = 'none';
            document.getElementById('driver-active').style.display = 'block';
            document.getElementById('current-route').textContent = routeId;
            
            const route = busRoutes.find(r => r.id === routeId);
            if (route) {
                document.getElementById('next-stop').textContent = route.stops[0];
            }
        } else {
            showNotification(response.message || 'Failed to start driving');
        }
    });
}

function stopDriving() {
    fetchNui('stopDriving', {}, () => {
        document.getElementById('driver-idle').style.display = 'block';
        document.getElementById('driver-active').style.display = 'none';
        showNotification('Shift ended');
    });
}

// Dispatcher functions
function startDispatcherUpdates() {
    setInterval(() => {
        fetchNui('getActiveBuses', {}, (buses) => {
            activeBuses = buses;
            updateDispatcherView();
        });
    }, 5000);
}

function updateDispatcherView() {
    document.getElementById('total-buses').textContent = activeBuses.length;
    
    let totalPassengers = 0;
    activeBuses.forEach(bus => {
        totalPassengers += bus.passengers || 0;
    });
    document.getElementById('total-passengers').textContent = totalPassengers;
    
    const busListDiv = document.getElementById('dispatcher-bus-list');
    if (activeBuses.length === 0) {
        busListDiv.innerHTML = '<p class="empty-state">No active buses</p>';
        return;
    }
    
    busListDiv.innerHTML = activeBuses.map(bus => {
        const route = busRoutes.find(r => r.id === bus.routeId);
        return `
            <div class="dispatcher-bus" style="border-left: 4px solid ${route?.color || '#0039A6'}">
                <div class="bus-header">
                    <span class="bus-route">${bus.routeId}</span>
                    <span class="bus-status status-good">On Time</span>
                </div>
                <div class="bus-stats">
                    <span>Driver #${bus.driver}</span>
                    <span>${bus.passengers || 0} passengers</span>
                    <span>${Math.round(bus.speed || 0)} mph</span>
                </div>
            </div>
        `;
    }).join('');
}

// Fare purchase
function purchasePass(passType) {
    fetchNui('purchasePass', { passType }, (response) => {
        if (response.success) {
            showNotification('Pass purchased successfully!');
        } else {
            showNotification('Failed to purchase pass');
        }
    });
}

// Notification helper
function showNotification(message) {
    // Simple notification - you can enhance this
    alert(message);
}

// NUI Communication
function fetchNui(event, data = {}, callback) {
    fetch(`https://${GetParentResourceName()}/${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(callback)
    .catch(err => console.error('NUI Error:', err));
}

// Listen for messages from client
window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data.type === 'busUpdate') {
        activeBuses = data.buses;
        if (currentRole === 'passenger') {
            displayNearbyBuses();
        } else if (currentRole === 'dispatcher') {
            updateDispatcherView();
        }
    }
});

// Auto-login if role is saved
window.addEventListener('load', () => {
    const savedRole = localStorage.getItem('mta_role');
    loadRoutes();
    
    if (savedRole) {
        currentRole = savedRole;
        if (savedRole === 'passenger') {
            navigateTo('passenger-page');
            loadNearbyBuses();
        } else if (savedRole === 'driver') {
            navigateTo('driver-page');
            loadRouteSelection();
        } else if (savedRole === 'dispatcher') {
            navigateTo('dispatcher-page');
            startDispatcherUpdates();
        }
    }
});
