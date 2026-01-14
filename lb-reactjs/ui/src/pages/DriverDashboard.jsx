import React, { useState } from 'react';
import './DriverDashboard.css';

export default function DriverDashboard({ user, onLogout }) {
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [rideRequests, setRideRequests] = useState([
    {
      id: 1,
      passenger: 'Emily Davis',
      pickup: '123 Main Street',
      destination: 'Downtown Shopping Mall',
      distance: '3.2 miles',
      fare: '$12.50',
      rating: 4.8
    },
    {
      id: 2,
      passenger: 'Robert Chen',
      pickup: 'Central Park Entrance',
      destination: 'International Airport',
      distance: '8.5 miles',
      fare: '$28.00',
      rating: 4.9
    },
    {
      id: 3,
      passenger: 'Lisa Anderson',
      pickup: 'Riverside Apartments',
      destination: 'Tech Campus Building B',
      distance: '5.1 miles',
      fare: '$16.75',
      rating: 5.0
    }
  ]);

  const [earnings, setEarnings] = useState({
    today: 125.50,
    thisWeek: 678.25,
    totalTrips: 23
  });

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptRide = (request) => {
    setActiveRide({
      ...request,
      status: 'heading_to_pickup', // heading_to_pickup, arrived, picked_up, completed
      startTime: new Date()
    });
    setRideRequests(rideRequests.filter(r => r.id !== request.id));
  };

  const handleDeclineRide = (requestId) => {
    setRideRequests(rideRequests.filter(r => r.id !== requestId));
  };

  const handleCompleteRide = () => {
    // Update earnings
    const rideFare = parseFloat(activeRide.fare.replace('$', ''));
    setEarnings({
      today: earnings.today + rideFare,
      thisWeek: earnings.thisWeek + rideFare,
      totalTrips: earnings.totalTrips + 1
    });
    setActiveRide(null);
  };

  const handleUpdateRideStatus = (newStatus) => {
    setActiveRide({ ...activeRide, status: newStatus });
  };

  return (
    <div className="driver-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>Welcome, {user.name}</h2>
          <p className="driver-badge">🚙 Driver</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Online/Offline Toggle */}
      <div className="status-toggle">
        <button
          className={`toggle-btn ${isOnline ? 'online' : 'offline'}`}
          onClick={handleToggleOnline}
        >
          <span className="status-indicator"></span>
          <span className="status-text">
            {isOnline ? 'You are Online' : 'You are Offline'}
          </span>
        </button>
        <p className="status-description">
          {isOnline
            ? 'Accepting ride requests'
            : 'Turn online to start accepting rides'}
        </p>
      </div>

      {/* Earnings Card */}
      <div className="earnings-card">
        <h3>💰 Your Earnings</h3>
        <div className="earnings-grid">
          <div className="earning-item">
            <p className="earning-label">Today</p>
            <p className="earning-value">${earnings.today.toFixed(2)}</p>
          </div>
          <div className="earning-item">
            <p className="earning-label">This Week</p>
            <p className="earning-value">${earnings.thisWeek.toFixed(2)}</p>
          </div>
          <div className="earning-item">
            <p className="earning-label">Total Trips</p>
            <p className="earning-value">{earnings.totalTrips}</p>
          </div>
        </div>
      </div>

      {/* Active Ride or Ride Requests */}
      {activeRide ? (
        <div className="active-ride-section">
          <div className="ride-status-header">
            <h3>
              {activeRide.status === 'heading_to_pickup' && '🚗 Heading to pickup'}
              {activeRide.status === 'arrived' && '📍 Arrived at pickup'}
              {activeRide.status === 'picked_up' && '🎯 En route to destination'}
            </h3>
          </div>

          <div className="active-ride-card">
            <div className="passenger-info">
              <div className="passenger-avatar">
                {activeRide.passenger.charAt(0)}
              </div>
              <div>
                <h4>{activeRide.passenger}</h4>
                <p className="passenger-rating">⭐ {activeRide.rating}</p>
              </div>
              <div className="ride-fare-large">
                {activeRide.fare}
              </div>
            </div>

            <div className="trip-route">
              <div className="route-point">
                <span className="route-icon">📍</span>
                <div>
                  <p className="route-label">Pickup</p>
                  <p className="route-address">{activeRide.pickup}</p>
                </div>
              </div>
              <div className="route-line"></div>
              <div className="route-point">
                <span className="route-icon">🎯</span>
                <div>
                  <p className="route-label">Destination</p>
                  <p className="route-address">{activeRide.destination}</p>
                </div>
              </div>
            </div>

            <div className="trip-distance">
              <span>Distance</span>
              <span>{activeRide.distance}</span>
            </div>
          </div>

          <div className="ride-action-buttons">
            {activeRide.status === 'heading_to_pickup' && (
              <>
                <button
                  className="action-btn primary"
                  onClick={() => handleUpdateRideStatus('arrived')}
                >
                  I've Arrived
                </button>
                <button className="action-btn secondary">
                  📞 Call Passenger
                </button>
              </>
            )}
            {activeRide.status === 'arrived' && (
              <>
                <button
                  className="action-btn primary"
                  onClick={() => handleUpdateRideStatus('picked_up')}
                >
                  Start Trip
                </button>
                <button className="action-btn secondary">
                  📞 Call Passenger
                </button>
              </>
            )}
            {activeRide.status === 'picked_up' && (
              <button
                className="action-btn primary full-width"
                onClick={handleCompleteRide}
              >
                Complete Trip
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="ride-requests-section">
          <h3>
            {isOnline
              ? rideRequests.length > 0
                ? '📲 Ride Requests'
                : '🔍 Looking for ride requests...'
              : '⏸️ Go online to see requests'}
          </h3>

          {isOnline && (
            <div className="requests-list">
              {rideRequests.length > 0 ? (
                rideRequests.map(request => (
                  <div key={request.id} className="ride-request-card">
                    <div className="request-header">
                      <div className="passenger-info-small">
                        <div className="passenger-avatar-small">
                          {request.passenger.charAt(0)}
                        </div>
                        <div>
                          <h4>{request.passenger}</h4>
                          <p>⭐ {request.rating}</p>
                        </div>
                      </div>
                      <div className="request-fare">
                        {request.fare}
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-icon">📍</span>
                        <span className="detail-text">{request.pickup}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">🎯</span>
                        <span className="detail-text">{request.destination}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">🛣️</span>
                        <span className="detail-text">{request.distance}</span>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleAcceptRide(request)}
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => handleDeclineRide(request.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-requests">
                  <p>No ride requests at the moment</p>
                  <p className="no-requests-sub">Stay online to receive requests</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
