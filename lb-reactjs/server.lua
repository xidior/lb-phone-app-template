-- Ubby Ride-Sharing Server
local activeRides = {}
local availableDrivers = {}
local rideRequests = {}

-- Register a driver as available
RegisterNetEvent('ubby:registerDriver', function(driverData)
    local src = source
    availableDrivers[src] = {
        id = src,
        name = driverData.name,
        vehicle = driverData.vehicle,
        location = driverData.location,
        rating = driverData.rating or 5.0,
        active = true
    }
    print("Driver registered:", src, driverData.name)
end)

-- Unregister a driver
RegisterNetEvent('ubby:unregisterDriver', function()
    local src = source
    availableDrivers[src] = nil
    print("Driver unregistered:", src)
end)

-- Request a ride
RegisterNetEvent('ubby:requestRide', function(rideData)
    local src = source
    local rideId = "ride_" .. os.time() .. "_" .. src
    
    rideRequests[rideId] = {
        id = rideId,
        passenger = src,
        passengerName = rideData.passengerName,
        pickup = rideData.pickup,
        destination = rideData.destination,
        fare = rideData.fare or math.random(10, 30),
        timestamp = os.time()
    }
    
    -- Notify nearby drivers
    for driverId, driver in pairs(availableDrivers) do
        if driver.active then
            TriggerClientEvent('ubby:newRideRequest', driverId, rideRequests[rideId])
        end
    end
    
    TriggerClientEvent('ubby:rideRequested', src, { success = true, rideId = rideId })
end)

-- Driver accepts ride
RegisterNetEvent('ubby:acceptRide', function(rideId)
    local src = source
    local request = rideRequests[rideId]
    
    if not request then
        TriggerClientEvent('ubby:rideAcceptFailed', src, { message = "Ride request not found" })
        return
    end
    
    -- Create active ride
    activeRides[rideId] = {
        id = rideId,
        driver = src,
        driverName = availableDrivers[src].name,
        passenger = request.passenger,
        passengerName = request.passengerName,
        pickup = request.pickup,
        destination = request.destination,
        fare = request.fare,
        status = 'accepted', -- accepted, en_route, arrived, in_progress, completed
        timestamp = os.time()
    }
    
    -- Remove from requests
    rideRequests[rideId] = nil
    
    -- Mark driver as busy
    if availableDrivers[src] then
        availableDrivers[src].active = false
    end
    
    -- Notify both parties
    TriggerClientEvent('ubby:rideAccepted', request.passenger, {
        rideId = rideId,
        driver = availableDrivers[src]
    })
    
    TriggerClientEvent('ubby:rideStarted', src, activeRides[rideId])
end)

-- Update ride status
RegisterNetEvent('ubby:updateRideStatus', function(rideId, newStatus)
    local src = source
    local ride = activeRides[rideId]
    
    if not ride then return end
    
    ride.status = newStatus
    
    -- Notify passenger
    TriggerClientEvent('ubby:rideStatusUpdated', ride.passenger, {
        rideId = rideId,
        status = newStatus
    })
    
    -- Notify driver
    TriggerClientEvent('ubby:rideStatusUpdated', ride.driver, {
        rideId = rideId,
        status = newStatus
    })
    
    -- If completed, handle payment and cleanup
    if newStatus == 'completed' then
        -- Here you would integrate with your economy system
        -- Example: exports['your-economy']:RemoveMoney(ride.passenger, ride.fare)
        -- Example: exports['your-economy']:AddMoney(ride.driver, ride.fare * 0.8) -- 80% to driver
        
        TriggerClientEvent('ubby:rideCompleted', ride.passenger, {
            fare = ride.fare,
            driver = ride.driverName
        })
        
        TriggerClientEvent('ubby:rideCompleted', ride.driver, {
            earnings = ride.fare * 0.8,
            passenger = ride.passengerName
        })
        
        -- Make driver available again
        if availableDrivers[ride.driver] then
            availableDrivers[ride.driver].active = true
        end
        
        -- Remove from active rides
        activeRides[rideId] = nil
    end
end)

-- Cancel ride
RegisterNetEvent('ubby:cancelRide', function(rideId)
    local src = source
    local ride = activeRides[rideId]
    
    if not ride then return end
    
    -- Notify both parties
    TriggerClientEvent('ubby:rideCancelled', ride.passenger, { rideId = rideId })
    TriggerClientEvent('ubby:rideCancelled', ride.driver, { rideId = rideId })
    
    -- Make driver available again
    if availableDrivers[ride.driver] then
        availableDrivers[ride.driver].active = true
    end
    
    -- Remove from active rides
    activeRides[rideId] = nil
end)

-- Get available drivers (for passenger)
RegisterNetEvent('ubby:getAvailableDrivers', function()
    local src = source
    local drivers = {}
    
    for driverId, driver in pairs(availableDrivers) do
        if driver.active then
            table.insert(drivers, {
                id = driver.id,
                name = driver.name,
                rating = driver.rating,
                vehicle = driver.vehicle
            })
        end
    end
    
    TriggerClientEvent('ubby:availableDrivers', src, drivers)
end)

-- Get active rides (for driver)
RegisterNetEvent('ubby:getActiveRides', function()
    local src = source
    local rides = {}
    
    for rideId, ride in pairs(activeRides) do
        if ride.driver == src then
            table.insert(rides, ride)
        end
    end
    
    TriggerClientEvent('ubby:activeRides', src, rides)
end)

-- Update driver location
RegisterNetEvent('ubby:updateDriverLocation', function(location)
    local src = source
    if availableDrivers[src] then
        availableDrivers[src].location = location
    end
end)

-- Cleanup on disconnect
AddEventHandler('playerDropped', function()
    local src = source
    
    -- Remove from available drivers
    availableDrivers[src] = nil
    
    -- Handle active rides
    for rideId, ride in pairs(activeRides) do
        if ride.driver == src or ride.passenger == src then
            -- Notify the other party
            local otherParty = ride.driver == src and ride.passenger or ride.driver
            TriggerClientEvent('ubby:rideCancelled', otherParty, { 
                rideId = rideId, 
                reason = "Other party disconnected" 
            })
            
            -- Make driver available if passenger disconnected
            if ride.passenger == src and availableDrivers[ride.driver] then
                availableDrivers[ride.driver].active = true
            end
            
            activeRides[rideId] = nil
        end
    end
    
    -- Remove ride requests
    for rideId, request in pairs(rideRequests) do
        if request.passenger == src then
            rideRequests[rideId] = nil
        end
    end
end)

-- Debug command
RegisterCommand('ubby:status', function(source)
    print("=== Ubby Status ===")
    print("Available Drivers:", #availableDrivers)
    print("Active Rides:", #activeRides)
    print("Ride Requests:", #rideRequests)
end, true)
