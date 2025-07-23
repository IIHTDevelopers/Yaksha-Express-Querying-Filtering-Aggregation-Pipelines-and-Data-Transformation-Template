// const request = require('supertest');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const app = require('../../app');  // Path to your Express app
// const Hotel = require('../../models/hotel');  // Hotel model

// let mongoServer;
// let createdHotelId;

// beforeAll(async () => {
//   // Start an in-memory MongoDB server before tests
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();
//   await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
// });

// afterAll(async () => {
//   // Close the in-memory MongoDB server after tests
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// let hotelRoutesBoundaryTest = `HotelRoutes boundary test`;

// describe('HotelRoutes', () => {
//   describe('boundary', () => {

//     // Test case for creating a hotel
//     it(`${hotelRoutesBoundaryTest} should create a new hotel`, async () => {
//       const hotelData = {
//         name: 'Sunset Resort',
//         location: 'California',
//         price: 200,
//         rooms: 50
//       };

//       const response = await request(app).post('/api/hotels').send(hotelData);

//       expect(response.status).toBe(201);  // Expect status 201 for created
//       createdHotelId = response.body._id;  // Save the ID for use in other tests
//     });

//     // Test case for getting all hotels
//     it(`${hotelRoutesBoundaryTest} should get all hotels`, async () => {
//       const response = await request(app).get('/api/hotels');

//       expect(response.status).toBe(200);  // Expect status 200 for successful GET
//       expect(Array.isArray(response.body)).toBe(true);  // Should be an array
//       expect(response.body.length).toBeGreaterThan(0);  // Should return at least one hotel
//     });
//   });
// });


const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');  // Path to your Express app
const Hotel = require('../../models/hotel');  // Hotel model

let mongoServer;
let createdHotelId;

beforeAll(async () => {
  // Start an in-memory MongoDB server before tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Close the in-memory MongoDB server after tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

let hotelRoutesBoundaryTest = `HotelRoutes boundary test`;

describe('HotelRoutes', () => {
  describe('boundary', () => {

    // Test case for creating a hotel
    it(`${hotelRoutesBoundaryTest} should create a new hotel`, async () => {
      const hotelData = {
        name: 'Sunset Resort',
        location: 'California',
        price: 200,
        rooms: 50
      };

      const response = await request(app).post('/api/hotels').send(hotelData);

      expect(response.status).toBe(201);  // Expect status 201 for created
      createdHotelId = response.body._id;  // Save the ID for use in other tests
    });

    // Test case for creating a hotel with missing fields
    it(`${hotelRoutesBoundaryTest} should return an error if required fields are missing`, async () => {
      const hotelData = {
        name: 'Ocean View Resort',
        location: 'Hawaii'
        // Missing price and rooms
      };

      const response = await request(app).post('/api/hotels').send(hotelData);

      expect(response.status).toBe(400);  // Status 400 for bad request
      expect(response.body.message).toBe('All fields are required and must be valid');
    });

    // Test case for getting all hotels with pagination, filtering, and sorting
    it(`${hotelRoutesBoundaryTest} should get all hotels with pagination, filtering, and sorting`, async () => {
      // Create multiple hotels for testing
      await request(app).post('/api/hotels').send({
        name: 'Beach Resort',
        location: 'California',
        price: 100,
        rooms: 20
      });

      await request(app).post('/api/hotels').send({
        name: 'Mountain Lodge',
        location: 'Switzerland',
        price: 150,
        rooms: 30
      });

      const response = await request(app)
        .get('/api/hotels?page=1&limit=2&sort=price')
        .query({ location: 'California', price: '50,150', rooms: '20,30' });

      expect(response.status).toBe(200);  // Status 200 for successful GET
      expect(Array.isArray(response.body)).toBe(true);  // Should return an array of hotels
      expect(response.body.length).toBeGreaterThan(0);  // Should return at least one hotel
    });

    // Test case for aggregating hotel data (average price, total rooms) by location
    it(`${hotelRoutesBoundaryTest} should aggregate hotel data (e.g., average price, total rooms) by location`, async () => {
      const response = await request(app)
        .get('/api/hotels/aggregate?location=California');

      expect(response.status).toBe(200);  // Status 200 for successful aggregation
      expect(Array.isArray(response.body)).toBe(true);  // Should return an array of aggregated data
      expect(response.body[0]).toHaveProperty('averagePrice');  // Should include averagePrice
      expect(response.body[0]).toHaveProperty('totalRooms');  // Should include totalRooms
    });

    // Test case for getting distinct hotel locations
    it(`${hotelRoutesBoundaryTest} should return distinct hotel locations`, async () => {
      const response = await request(app)
        .get('/api/hotels/distinct?field=location');

      expect(response.status).toBe(200);  // Status 200 for successful distinct query
      expect(Array.isArray(response.body)).toBe(true);  // Should return an array of distinct values
      expect(response.body).toContain('California');  // Example location to check
    });

  });
});
