local identifier = "mta-buses"

while GetResourceState("lb-phone") ~= "started" do
    Wait(500)
end

-- MTA Bus Routes (Based on Liberty City/NYC)
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

-- Active buses tracking
local activeBuses = {}
local playerRole = nil -- "passenger", "driver", or "dispatcher"

local function addApp()
    local added, errorMessage = exports["lb-phone"]:AddCustomApp({
        identifier = identifier,
        name = "MTA Bus",
        description = "New York MTA Bus System - Routes, Schedules & Real-Time Tracking",
        developer = "MTA",
        defaultApp = false,
        size = 89324,
        images = {
            "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/assets/screenshot.png"
        },
        ui = GetCurrentResourceName() .. "/ui/index.html",
        icon = "https://cfx-nui-" .. GetCurrentResourceName() .. "/ui/assets/icon.svg",
        fixBlur = true
    })

    if not added then
        print("Could not add MTA Bus app:", errorMessage)
    end
end

addApp()

AddEventHandler("onResourceStart", function(resource)
    if resource == "lb-phone" then
        addApp()
    end
end)

-- NUI Callbacks
RegisterNUICallback("setRole", function(data, cb)
    playerRole = data.role
    cb("ok")
end)

RegisterNUICallback("getRoutes", function(data, cb)
    cb(busRoutes)
end)

RegisterNUICallback("getActiveBuses", function(data, cb)
    cb(activeBuses)
end)

RegisterNUICallback("startDriving", function(data, cb)
    local routeId = data.routeId
    local playerPed = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(playerPed, false)
    
    if vehicle ~= 0 and GetPedInVehicleSeat(vehicle, -1) == playerPed then
        local busData = {
            driver = GetPlayerServerId(PlayerId()),
            routeId = routeId,
            vehicle = vehicle,
            passengers = 0,
            nextStop = 1
        }
        
        activeBuses[#activeBuses + 1] = busData
        
        exports["lb-phone"]:SendNotification({
            app = identifier,
            title = "MTA Bus",
            content = "You're now driving route " .. routeId
        })
        
        cb({ success = true })
    else
        cb({ success = false, message = "You must be driving a bus" })
    end
end)

RegisterNUICallback("stopDriving", function(data, cb)
    for i, bus in ipairs(activeBuses) do
        if bus.driver == GetPlayerServerId(PlayerId()) then
            table.remove(activeBuses, i)
            break
        end
    end
    
    exports["lb-phone"]:SendNotification({
        app = identifier,
        title = "MTA Bus",
        content = "You've ended your shift"
    })
    
    cb("ok")
end)

RegisterNUICallback("requestBus", function(data, cb)
    local pickup = data.pickup
    local destination = data.destination
    
    exports["lb-phone"]:SendNotification({
        app = identifier,
        title = "MTA Bus",
        content = "Searching for buses from " .. pickup .. " to " .. destination
    })
    
    cb({ success = true, eta = "8 min", busNumber = "M" .. math.random(1, 5) })
end)

RegisterNUICallback("planTrip", function(data, cb)
    local from = data.from
    local to = data.to
    
    -- Simple trip planning logic
    local trip = {
        routes = { "M1", "M4" },
        totalTime = 25,
        transfers = 1,
        fare = 2.75,
        steps = {
            { route = "M1", from = from, to = "Star Junction", duration = 15 },
            { type = "transfer", duration = 3 },
            { route = "M4", from = "Star Junction", to = to, duration = 7 }
        }
    }
    
    cb(trip)
end)

RegisterNUICallback("purchasePass", function(data, cb)
    local passType = data.passType
    local prices = {
        single = 2.75,
        day = 8.25,
        week = 33.00,
        month = 127.00
    }
    
    -- Here you would integrate with your economy system
    local price = prices[passType]
    
    exports["lb-phone"]:SendNotification({
        app = identifier,
        title = "MTA Bus",
        content = "Pass purchased for $" .. price
    })
    
    cb({ success = true })
end)

-- Update active buses positions periodically
CreateThread(function()
    while true do
        Wait(5000) -- Update every 5 seconds
        
        for i, bus in ipairs(activeBuses) do
            if DoesEntityExist(bus.vehicle) then
                local coords = GetEntityCoords(bus.vehicle)
                bus.coords = { x = coords.x, y = coords.y, z = coords.z }
                bus.heading = GetEntityHeading(bus.vehicle)
                bus.speed = GetEntitySpeed(bus.vehicle) * 2.23694 -- Convert to mph
            else
                table.remove(activeBuses, i)
            end
        end
        
        -- Send update to all phones with the app open
        exports["lb-phone"]:SendCustomAppMessage(identifier, {
            type = "busUpdate",
            buses = activeBuses
        })
    end
end)
