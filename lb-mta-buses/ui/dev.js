// Development helper for testing outside FiveM
if (!window.GetParentResourceName) {
    window.GetParentResourceName = () => 'mta-buses';
}

// Mock NUI responses for development
if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
    console.log('Development mode enabled');
    
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes('mta-buses')) {
            const event = url.split('/').pop();
            console.log('Mock NUI Call:', event, options);
            
            // Mock responses
            const mockResponses = {
                getRoutes: [
                    {
                        id: "M1",
                        name: "Broker - Algonquin Express",
                        color: "#0039A6",
                        stops: ["Hove Beach Station", "Broker Bridge", "Star Junction", "Middle Park East", "North Holland"],
                        fare: 2.75,
                        schedule: "5:00 AM - 1:00 AM",
                        frequency: "Every 10-15 min"
                    },
                    {
                        id: "M2",
                        name: "Dukes - Bohan Line",
                        color: "#0039A6",
                        stops: ["East Island City", "Willis Station", "Dukes Boulevard", "Northern Gardens", "Bohan Industrial"],
                        fare: 2.75,
                        schedule: "24/7",
                        frequency: "Every 8-12 min"
                    }
                ],
                getActiveBuses: [
                    { routeId: "M1", driver: 1001, passengers: 8, speed: 25 }
                ],
                planTrip: {
                    routes: ["M1", "M4"],
                    totalTime: 25,
                    transfers: 1,
                    fare: 2.75,
                    steps: [
                        { route: "M1", from: "Hove Beach", to: "Star Junction", duration: 15 },
                        { type: "transfer", duration: 3 },
                        { route: "M4", from: "Star Junction", to: "Castle Gardens", duration: 7 }
                    ]
                },
                startDriving: { success: true },
                purchasePass: { success: true }
            };
            
            return Promise.resolve({
                json: () => Promise.resolve(mockResponses[event] || { success: true })
            });
        }
        return originalFetch.call(this, url, options);
    };
}
