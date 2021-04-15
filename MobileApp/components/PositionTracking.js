const Trilaterate = require("../node_modules/trilateration"); // https://github.com/gheja/trilateration.js
const N = 4;
const MAX_SAMPLES = 12;
const TTL = 10;

/**
 * Position Tracking 
 * 
 * This class deals with updating position estimates using two tracking algorithms
 * It manages multiple samples of signal strength to reach greater accuracy and stability
 * 
 * This class will always use the 3 closest hubs to calculate position since their signals are
 * considered to be the most reliable
 * 
 * Constructor: No arguments -> Initialization has no dependencies
 */
class PositionTracking {
    constructor() {
        this.data = {
            EXAMPLE: {
                position: {},
                samples: [],    // Current list of RSSI samples
                sum: 0,         // Sum of all samples in the list
                distance: 1000, // Distance calculated from average of RSSI
                ttl: TTL        // Scan cycles left until readings are invalid (Renewed when new RSSI is received)
            }
        };
        this.position = {
            latitude: 1000, 
            longitude: 1000,
        }
        this.nearestHubs = {
            furthest: 0
        };
    }

    /**
     * Adds/Updates hub information recieved from bluetooth signal
     * Will use the new RSSI value to obtain a new distance estimate and find the user's position
     * 
     * @param {string} id MAC address of hub to update
     * @param {integer} rssi Negative integer representing signal strength
     * @return {object} position {latitude, longitude}
     */
    Update(id, rssi, position, measured_power) {
        console.log("ID: " + id + ", RSSI: " + rssi + ", MP: " + measured_power);
        // Locate or add entry to list
        if (!this.data.hasOwnProperty(id)) {
            let initData = {
                position: position,
                sum: 0,
                samples: [],
                distance: 1000,
                ttl: TTL
            }
            this.data[id] = initData;
        }
        else {
            this.data[id].ttl = TTL;

            // Remove oldest sample (first element)
            if (this.data[id].samples.length >= MAX_SAMPLES){
                this.data[id].sum -= this.data[id].samples.shift();
            }
        }
        
        this.data[id].samples.push(rssi);
        this.data[id].sum += rssi;

        // Retrieve user's position
        this.data[id].distance = this.RSSItoDistance(this.data[id].sum / this.data[id].samples.length, measured_power);
        console.log("New Distance: " + this.data[id].distance);
        this.ProcessPosition(id);

        return this.position;
    }

    /**
     * Determines which position tracking algorithm to use
     * 1. Single Hub 
     * 2. Trilateration
     * 
     * Trilateration is used when 3 hubs are nearby as it is most accurate
     * Single hub is used when fewer than 3 hubs are nearby or the trilateration returns no valid solution
     * 
     * This function updates the classes position value in a format that is ready to be placed on a map
     * 
     * @param {string} currentID MAC address of hub with new distance
     */
    ProcessPosition(currentID) {
        var ids = Object.keys(this.nearestHubs).slice(1, 4);
        let dist = this.data[currentID].distance;
        let solution = false;

        // Get position using trilateration
        if (ids.length >= 3) {
            console.log('--------------- START TRIPLE HUB LOGIC ---------------');
            // Hub is currently being used for triangulation
            if (this.nearestHubs.hasOwnProperty(currentID)) {
                this.nearestHubs[currentID] = dist;
            }
            // Use new hub if closer than furthest in current top 3
            else if (this.nearestHubs.furthest > dist) {
                // Last 3 elements (aka hub IDs)
                let nearestIds = Object.keys(this.nearestHubs).slice(1, 4);

                nearestIds.forEach( (id) => {
                    if (this.nearestHubs.furthest == this.nearestHubs[id]) {
                        delete this.nearestHubs[id]
                    }
                    else if (this.nearestHubs[id] > dist) {
                        // Furthest needs to be largest distance of set of new hubs
                        dist = this.nearestHubs[id];
                    }
                });
            }

            // Run algorithm for new position
            let hubs = Object.keys(this.nearestHubs).slice(1, 4);
            let latitude = this.data[hubs[0]].position.latitude;
            let longitude = this.data[hubs[0]].position.longitude;

            // Point definitions in meters
            let p1 = {x: 0, y: 0, z: 0, r: this.data[hubs[0]].distance};
            let p2 = {
                x: this.LongitudeDiffToMeters(this.data[hubs[1]].position.longitude, longitude, latitude), 
                y: this.LatitudeDiffToMeters(this.data[hubs[1]].position.latitude, latitude), 
                z: 0, 
                r: this.data[hubs[1]].distance
            };
            let p3 = {
                x: this.LongitudeDiffToMeters(this.data[hubs[2]].position.longitude, longitude, latitude), 
                y: this.LatitudeDiffToMeters(this.data[hubs[2]].position.latitude, latitude), 
                z: 0, 
                r: this.data[hubs[2]].distance
            };

            console.log('x: ' + p1.x + ', y: ' + p1.y + ', z: ' + p1.z + ', r: ' + p1.r);
            console.log('x: ' + p2.x + ', y: ' + p2.y + ', z: ' + p2.z + ', r: ' + p2.r);
            console.log('x: ' + p3.x + ', y: ' + p3.y + ', z: ' + p3.z + ', r: ' + p3.r);

            let p4 = Trilaterate(p1, p2, p3, true);

            // Update position if trilateration calculations return a result
            if (p4) {
                this.position = {
                    longitude: (this.MetersToLongitudeDiff(p4.x, latitude) + longitude + this.position.longitude) / 2,
                    latitude: (this.MetersToLatitiudeDiff(p4.y) + latitude + this.position.latitude) / 2
                };
                solution = true;
                
                console.log('--------------- TRILATERATION SOLUTION ---------------');
                console.log('x: ' + p4.x + ', y: ' + p4.y + ', z: ' + p4.z);
                console.log('lat: ' + this.position.latitude + ', long: ' + this.position.longitude);
            }
            console.log('--------------- END TRIPLE HUB LOGIC ---------------');
        }

        // Use nearest hub if < 3 hubs or no solution found
        if (!solution) {
            console.log('--------------- START NEAREST HUB LOGIC ---------------');
            let min = 1000;
            this.nearestHubs[currentID] = dist;

            // Use nearest hub as position
            ids.forEach( (id) => {
                if (this.data[id].distance < min) {
                    min = this.data[id].distance;
                    this.position = this.data[id].position;
                }
            });
            console.log('--------------- NEAREST HUB SOLUTION ---------------');
            console.log('lat: ' + this.position.latitude + ', long: ' + this.position.longitude);
            console.log('--------------- END NEAREST HUB LOGIC ---------------');
        }

        // Update furthest distance of closest 3
        if (this.nearestHubs.furthest < dist) {
            this.nearestHubs.furthest = dist;
        }
    }

    /**
     * RSSI -> Distance (meters)
     * 
     * @param {integer} rssi 
     * @param {integer} mp Measured Power (RSSI at distance of 1 meter from the hub) 
     * @return {integer} distance
     */
    RSSItoDistance(rssi, mp) {
        return 10**( (mp - rssi) / (10 * N) );
    }

    ExpiredEntry() {

    }

    /**
     * Converts a distance in meters to a latitude delta
     * 1deg of latitude = 111.133k
     * 
     * @param {integer} m Distance in meters
     * @returns {integer} Latitude Delta
     */
    MetersToLatitiudeDiff(m) {
        return m / 111133;
    }

    /**
     * Converts a distance in meters to a longitude delta
     * Distance between lines of longitude change with each degree of latitude so the latitude of 
     * one of the points must be provided
     * 
     * 1deg of longitude = 40075km * cos( latitude ) / 360
     * 
     * @param {integer} m Distance in meters
     * @param {integer} lat Latitude the distance is located at
     * @returns {integer} Longitude Delta
     */
    MetersToLongitudeDiff(m, lat) {
        return m / (111320 * Math.cos(lat * 0.0174533));    // Pi / 180 = 0.0174533
    }

    /**
     * Takes the latitude of two points and returns the distance in meters between them
     * 1deg of latitude = 111.133km
     * 
     * @param {integer} lat1 
     * @param {integer} lat2 
     * @returns {integer} Distance in meters
     */
    LatitudeDiffToMeters(lat1, lat2) {
        return 111133 * (lat1 - lat2);
    }

    /**
     * Takes the longitude of two points and returns the distance in meters between them
     * Distance between lines of longitude change with each degree of latitude so the latitude of 
     * one of the points must be provided
     * 
     * 1deg of longitude = 40075km * cos( latitude ) / 360
     * 
     * @param {integer} long1 
     * @param {integer} long2 
     * @param {integer} lat 
     * @returns {integer} Distance in meters
     */
    LongitudeDiffToMeters(long1, long2, lat) {
        return 111320 * (long1 - long2) * Math.cos(lat * 0.0174533);
    }
}

module.exports = PositionTracking;