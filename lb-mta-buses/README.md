# MTA Bus System for LB Phone

A comprehensive New York MTA bus system app for FiveM with real-time tracking, route planning, and multiple user roles.

## Features

### 🚏 Passenger Features
- **Trip Planning**: Plan routes between locations with transfer information
- **Real-Time Tracking**: See nearby buses and their ETA
- **Fare Information**: View and purchase single rides, day passes, weekly, and monthly passes
- **Route Information**: Browse all available bus routes with schedules and stops

### 🚌 Driver Features
- **Route Selection**: Choose from available bus routes to drive
- **Live Dashboard**: Monitor passengers, next stops, and schedule status
- **Shift Management**: Start and end driving shifts easily

### 📡 Dispatcher Features
- **Fleet Overview**: Monitor all active buses in real-time
- **Statistics**: View total buses, passengers, and on-time performance
- **Bus Status**: Track individual bus routes, speeds, and passenger counts

## Bus Routes

Based on Liberty City (GTA IV) locations:

- **M1**: Broker - Algonquin Express
- **M2**: Dukes - Bohan Line
- **M3**: Alderney Crosstown
- **M4**: Algonquin Downtown Loop
- **M5**: Airport Shuttle

## Installation

1. Ensure you have `lb-phone` resource installed and running
2. Copy the `lb-mta-buses` folder to your FiveM resources directory
3. Add `ensure lb-mta-buses` to your `server.cfg`
4. Restart your server

## Configuration

Edit `client.lua` to customize:
- Bus routes and stops
- Fare prices
- Route colors
- Schedule information

## Usage

### For Players
1. Open your phone (lb-phone)
2. Find and open the "MTA Bus" app
3. Select your role (Passenger, Driver, or Dispatcher)
4. Access features based on your role

### For Drivers
- Must be in a bus vehicle to start driving
- Select a route from the available options
- Follow the route and pickup passengers

### For Dispatchers
- View all active buses on the network
- Monitor fleet performance
- Track real-time statistics

## Requirements

- `lb-phone` resource (latest version)
- FiveM server

## Credits

Created for FiveM roleplay servers
Based on the New York MTA bus system
Uses GTA IV Liberty City location references

## License

See LICENSE file for details

## Support

For issues or questions, please create an issue on the repository.
