import React, { useState } from 'react';
import './PassengerDashboard.css';

export default function PassengerDashboard({ user, onLogout }) {
  const [activeRide, setActiveRide] = useState(null);
  const [requestingRide, setRequestingRide] = useState(false);
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Current Location');

  // Mock available drivers
  const [availableDrivers] = useState([
    { id: 1, name: 'John Smith', rating: 4.9, distance: '2 min away', car: 'Toyota Camry', plate: 'ABC123' },
    { id: 2, name: 'Sarah Johnson', rating: 4.8, distance: '5 min away', car: 'Honda Accord', plate: 'XYZ789' },
    { id: 3, name: 'Mike Wilson', rating: 4.95, distance: '3 min away', car: 'Tesla Model 3', plate: 'EV2024' }
  ]);

  const handleRequestRide = () => {
    if (!destination) return;
    
    setRequestingRide(true);
    
    // Simulate finding a driver
    setTimeout(() => {
      const driver = availableDrivers[0];
      setActiveRide({
        driver,
        pickup: pickupLocation,
        destination,
        status: 'driver_coming', // driver_coming, picked_up, completed
        estimatedTime: '2 min',
        fare: '$12.50'
      });
      setRequestingRide(false);
      setDestination('');
    }, 2000);
  };

  const handleCancelRide = () => {
    setActiveRide(null);
  };

  return (
    <div className="passenger-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>Hello, {user.name}!</h2>
          <p>Where to today?</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {!activeRide ? (
        <div className="ride-request-section">
          <div className="location-inputs">
            <div className="input-group">
              <span className="location-icon">📍</span>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Pickup location"
                className="location-input"
              />
            </div>
            <div className="input-group">
              <span className="location-icon">🎯</span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you going?"
                className="location-input"
              />
            </div>
          </div>

          <button
            className="request-ride-btn"
            onClick={handleRequestRide}
            disabled={!destination || requestingRide}
          >
            {requestingRide ? 'Finding Driver...' : 'Request Ride'}
          </button>

          <div className="available-drivers">
            <h3>Available Drivers Nearby</h3>
            <div className="drivers-list">
              {availableDrivers.map(driver => (
                <div key={driver.id} className="driver-card">
                  <div className="driver-avatar">
                    {driver.name.charAt(0)}
                  </div>
                  <div className="driver-details">
                    <h4>{driver.name}</h4>
                    <p>{driver.car} • {driver.plate}</p>
                    <div className="driver-meta">
                      <span className="rating">⭐ {driver.rating}</span>
                      <span className="distance">{driver.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="active-ride-section">
          <div className="ride-status">
            <h3>
              {activeRide.status === 'driver_coming' && 'Driver is on the way'}
              {activeRide.status === 'picked_up' && 'En route to destination'}
              {activeRide.status === 'completed' && 'Trip completed'}
            </h3>
            <p className="eta">Arriving in {activeRide.estimatedTime}</p>
          </div>

          <div className="driver-info-card">
            <div className="driver-header">
              <div className="driver-avatar-large">
                {activeRide.driver.name.charAt(0)}
              </div>
              <div>
                <h4>{activeRide.driver.name}</h4>
                <p>{activeRide.driver.car}</p>
                <p className="plate-number">{activeRide.driver.plate}</p>
              </div>
              <div className="driver-rating-large">
                ⭐ {activeRide.driver.rating}
              </div>
            </div>

            <div className="trip-details">
              <div className="trip-location">
                <span className="trip-icon">📍</span>
                <div>
                  <p className="label">Pickup</p>
                  <p className="value">{activeRide.pickup}</p>
                </div>
              </div>
              <div className="trip-divider"></div>
              <div className="trip-location">
                <span className="trip-icon">🎯</span>
                <div>
                  <p className="label">Destination</p>
                  <p className="value">{activeRide.destination}</p>
                </div>
              </div>
            </div>

            <div className="fare-estimate">
              <span>Estimated Fare</span>
              <span className="fare-amount">{activeRide.fare}</span>
            </div>
          </div>

          <div className="ride-actions">
            <button className="contact-driver-btn">
              📞 Contact Driver
            </button>
            <button className="cancel-ride-btn" onClick={handleCancelRide}>
              Cancel Ride
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
