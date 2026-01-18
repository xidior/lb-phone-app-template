-- MTA Bus System Server
local activeBuses = {}
local busPassengers = {}
local playerPasses = {}

-- Bus routes configuration
local busRoutes = {
    {
        id = "M1",
        name = "Broker - Algonquin Express",
        color = "#0039A6",
        stops = {
            "Hove Beach Station",
            "Broker Bridge",
            "Star Junction",
            "Middle Park East",
            "North Holland"
        },
        fare = 2.75,
        schedule = "5:00 AM - 1:00 AM",
        frequency = "Every 10-15 min"
    },
    {
        id = "M2",
        name = "Dukes - Bohan Line",
        color = "#0039A6",
        stops = {
            "East Island City",
            "Willis Station",
            "Dukes Boulevard",
            "Northern Gardens",
            "Bohan Industrial"
        },
        fare = 2.75,
        schedule = "24/7",
        frequency = "Every 8-12 min"
    },
    {
        id = "M3",
        name = "Alderney Crosstown",
        color = "#FF6319",
        stops = {
            "Alderney City",
            "Port Tudor",
            "Acter Industrial",
            "Leftwood",
            "Alderney State Correctional"
        },
        fare = 2.75,
        schedule = "6:00 AM - 11:00 PM",
        frequency = "Every 15-20 min"
    },
    {
        id = "M4",
        name = "Algonquin Downtown Loop",
        color = "#6CBE45",
        stops = {
            "Castle Gardens",
            "City Hall",
            "Star Junction",
            "The Exchange",
            "Battery Park"
        },
        fare = 2.75,
        schedule = "24/7",
        frequency = "Every 5-8 min"
    },
    {
        id = "M5",
        name = "Airport Shuttle",
        color = "#996633",
        stops = {
            "Francis Intl Airport",
            "Beachgate",
            "Firefly Island",
            "Hove Beach",
            "Broker Navy Yard"
        },
        fare = 2.75,
        schedule = "24/7",
        frequency = "Every 20-30 min"
    }
}

-- Start driving a bus route
RegisterNetEvent('mta:startDriving', function(routeId)
    local src = source
    local route = nil
    
    for _, r in ipairs(busRoutes) do
        if r.id == routeId then
            route = r
            break
        end
    end
    
    if not route then
        TriggerClientEvent('mta:startDrivingResponse', src, { success = false, message = "Invalid route" })
        return
    end
    
    activeBuses[src] = {
        driver = src,
        routeId = routeId,
        route = route,
        currentStop = 1,
        passengers = 0,
        totalEarnings = 0,
        startTime = os.time()
    }
    
    busPassengers[src] = {}
    
    TriggerClientEvent('mta:startDrivingResponse', src, { 
        success = true, 
        route = route,
        busData = activeBuses[src]
    })
    
    -- Notify all dispatchers
    for playerId, bus in pairs(activeBuses) do
        TriggerClientEvent('mta:busUpdate', -1, activeBuses)
    end
end)

-- Stop driving
RegisterNetEvent('mta:stopDriving', function()
    local src = source
    local bus = activeBuses[src]
    
    if bus then
        local tripDuration = os.time() - bus.startTime
        local earnings = bus.totalEarnings
        
        -- Here you would integrate with your economy system
        -- Example: exports['your-economy']:AddMoney(src, earnings)
        
        TriggerClientEvent('mta:stopDrivingResponse', src, {
            success = true,
            earnings = earnings,
            duration = tripDuration,
            passengersServed = #busPassengers[src] or 0
        })
        
        activeBuses[src] = nil
        busPassengers[src] = nil
        
        -- Notify all dispatchers
        TriggerClientEvent('mta:busUpdate', -1, activeBuses)
    end
end)

-- Passenger boards bus
RegisterNetEvent('mta:boardBus', function(driverId)
    local src = source
    local bus = activeBuses[driverId]
    
    if not bus then
        TriggerClientEvent('mta:boardResponse', src, { success = false, message = "Bus not found" })
        return
    end
    
    -- Check if player has a valid pass
    local pass = playerPasses[src]
    local canBoard = false
    local fare = 0
    
    if pass and pass.expiresAt > os.time() then
        canBoard = true
    else
        fare = bus.route.fare
        -- Here you would check if player has enough money
        -- Example: local hasMoney = exports['your-economy']:GetMoney(src) >= fare
        canBoard = true -- For testing, always allow
    end
    
    if canBoard then
        if not busPassengers[driverId] then
            busPassengers[driverId] = {}
        end
        
        table.insert(busPassengers[driverId], src)
        bus.passengers = #busPassengers[driverId]
        
        if fare > 0 then
            bus.totalEarnings = bus.totalEarnings + fare
            -- Example: exports['your-economy']:RemoveMoney(src, fare)
        end
        
        TriggerClientEvent('mta:boardResponse', src, { 
            success = true, 
            route = bus.route,
            currentStop = bus.currentStop
        })
        
        TriggerClientEvent('mta:passengerBoarded', driverId, {
            passengerId = src,
            totalPassengers = bus.passengers
        })
        
        -- Update dispatchers
        TriggerClientEvent('mta:busUpdate', -1, activeBuses)
    else
        TriggerClientEvent('mta:boardResponse', src, { 
            success = false, 
            message = "Insufficient funds" 
        })
    end
end)

-- Passenger exits bus
RegisterNetEvent('mta:exitBus', function(driverId)
    local src = source
    local bus = activeBuses[driverId]
    
    if bus and busPassengers[driverId] then
        for i, passengerId in ipairs(busPassengers[driverId]) do
            if passengerId == src then
                table.remove(busPassengers[driverId], i)
                break
            end
        end
        
        bus.passengers = #busPassengers[driverId]
        
        TriggerClientEvent('mta:exitResponse', src, { success = true })
        TriggerClientEvent('mta:passengerExited', driverId, {
            passengerId = src,
            totalPassengers = bus.passengers
        })
        
        -- Update dispatchers
        TriggerClientEvent('mta:busUpdate', -1, activeBuses)
    end
end)

-- Update bus stop
RegisterNetEvent('mta:updateStop', function(stopNumber)
    local src = source
    local bus = activeBuses[src]
    
    if bus then
        bus.currentStop = stopNumber
        TriggerClientEvent('mta:stopUpdated', src, { stop = stopNumber })
        
        -- Update dispatchers
        TriggerClientEvent('mta:busUpdate', -1, activeBuses)
    end
end)

-- Purchase a pass
RegisterNetEvent('mta:purchasePass', function(passType)
    local src = source
    local prices = {
        single = 2.75,
        day = 8.25,
        week = 33.00,
        month = 127.00
    }
    
    local durations = {
        single = 3600, -- 1 hour (single use)
        day = 86400,
        week = 604800,
        month = 2592000
    }
    
    local price = prices[passType]
    local duration = durations[passType]
    
    if not price or not duration then
        TriggerClientEvent('mta:purchaseResponse', src, { success = false, message = "Invalid pass type" })
        return
    end
    
    -- Check if player has enough money
    -- Example: local hasMoney = exports['your-economy']:GetMoney(src) >= price
    local hasMoney = true -- For testing
    
    if hasMoney then
        -- Remove money
        -- Example: exports['your-economy']:RemoveMoney(src, price)
        
        playerPasses[src] = {
            type = passType,
            purchasedAt = os.time(),
            expiresAt = os.time() + duration
        }
        
        TriggerClientEvent('mta:purchaseResponse', src, { 
            success = true, 
            pass = playerPasses[src] 
        })
    else
        TriggerClientEvent('mta:purchaseResponse', src, { 
            success = false, 
            message = "Insufficient funds" 
        })
    end
end)

-- Get all active buses (for dispatcher)
RegisterNetEvent('mta:getActiveBuses', function()
    local src = source
    TriggerClientEvent('mta:activeBusesList', src, activeBuses)
end)

-- Get bus routes
RegisterNetEvent('mta:getRoutes', function()
    local src = source
    TriggerClientEvent('mta:routesList', src, busRoutes)
end)

-- Get player pass info
RegisterNetEvent('mta:getPassInfo', function()
    local src = source
    local pass = playerPasses[src]
    
    if pass and pass.expiresAt > os.time() then
        TriggerClientEvent('mta:passInfo', src, pass)
    else
        TriggerClientEvent('mta:passInfo', src, nil)
    end
end)

-- Cleanup on disconnect
AddEventHandler('playerDropped', function()
    local src = source
    
    -- If player was driving a bus
    if activeBuses[src] then
        -- Drop all passengers
        if busPassengers[src] then
            for _, passengerId in ipairs(busPassengers[src]) do
                TriggerClientEvent('mta:busEnded', passengerId, { reason = "Driver disconnected" })
            end
        end
        
        activeBuses[src] = nil
        busPassengers[src] = nil
        
        -- Update dispatchers
        TriggerClientEvent('mta:busUpdate', -1, activeBuses)
    end
    
    -- Remove from any bus as passenger
    for driverId, passengers in pairs(busPassengers) do
        for i, passengerId in ipairs(passengers) do
            if passengerId == src then
                table.remove(passengers, i)
                if activeBuses[driverId] then
                    activeBuses[driverId].passengers = #passengers
                end
                break
            end
        end
    end
end)

-- Periodic update to sync bus positions
CreateThread(function()
    while true do
        Wait(5000) -- Every 5 seconds
        
        -- Send update to all dispatchers
        for playerId, _ in pairs(GetPlayers()) do
            TriggerClientEvent('mta:busUpdate', playerId, activeBuses)
        end
    end
end)

-- Debug commands
RegisterCommand('mta:status', function(source)
    print("=== MTA Bus Status ===")
    print("Active Buses:", json.encode(activeBuses, { indent = true }))
    print("Total Active Buses:", #activeBuses)
end, true)

RegisterCommand('mta:passes', function(source)
    print("=== MTA Passes ===")
    print(json.encode(playerPasses, { indent = true }))
end, true)
