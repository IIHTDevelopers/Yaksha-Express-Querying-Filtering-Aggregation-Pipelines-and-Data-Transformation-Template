const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');  // Your Express app
const Hotel = require('../../models/hotel');  // Hotel model

let mongoServer;

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

let hotelControllerBoundaryTest = `HotelController boundary test`;

describe('Hotel Controller', () => {
    describe('boundary', () => {

        let createdHotelId;

        // Test case for creating a hotel (POST /api/hotels)
        it(`${hotelControllerBoundaryTest} should create a new hotel when all required fields are provided`, async () => {
            const hotelData = {
                name: 'Sunset Resort',
                location: 'California',
                price: 200,
                rooms: 50
            };

            const response = await request(app)
                .post('/api/hotels')
                .send(hotelData);

            expect(response.status).toBe(201);  // Status 201 for created
            expect(response.body.message).toBe('Hotel successfully added!');
            createdHotelId = response.body._id;  // Save the ID for future use
        });

        // Test case for creating a hotel with missing fields
        it(`${hotelControllerBoundaryTest} should return an error if required fields are missing`, async () => {
            const hotelData = {
                name: 'Ocean View Resort',
                location: 'Hawaii'
                // Missing price and rooms
            };

            const response = await request(app)
                .post('/api/hotels')
                .send(hotelData);

            expect(response.status).toBe(400);  // Status 400 for bad request
            expect(response.body.message).toBe('All fields are required and must be valid');
        });

        // Test case for creating a hotel with empty strings
        it(`${hotelControllerBoundaryTest} should return an error if name or location is an empty string`, async () => {
            const hotelData = {
                name: '',
                location: 'California',
                price: 200,
                rooms: 50
            };

            const response = await request(app)
                .post('/api/hotels')
                .send(hotelData);

            expect(response.status).toBe(400);  // Status 400 for bad request
            expect(response.body.message).toBe('All fields are required and must be valid');
        });

        // Test case for getting all hotels with pagination, filtering, and sorting (GET /api/hotels)
        it(`${hotelControllerBoundaryTest} should get hotels with pagination, filtering, and sorting`, async () => {
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
        });

        // Test case for aggregation of hotel data (GET /api/hotels/aggregate)
        it(`${hotelControllerBoundaryTest} should aggregate hotel data (e.g., average price and total rooms)`, async () => {
            const response = await request(app)
                .get('/api/hotels/aggregate?location=California');

            expect(response.status).toBe(200);  // Status 200 for successful aggregation
            expect(Array.isArray(response.body)).toBe(true);  // Should return an array of aggregated data
            expect(response.body[0]).toHaveProperty('averagePrice');  // Should include averagePrice
            expect(response.body[0]).toHaveProperty('totalRooms');  // Should include totalRooms
        });

        // Test case for distinct hotel locations (GET /api/hotels/distinct)
        it(`${hotelControllerBoundaryTest} should return distinct hotel locations`, async () => {
            const response = await request(app)
                .get('/api/hotels/distinct?field=location');

            expect(response.status).toBe(200);  // Status 200 for successful distinct query
            expect(Array.isArray(response.body)).toBe(true);  // Should return an array of distinct values
            expect(response.body).toContain('California');  // Example location to check
        });

    });
});
