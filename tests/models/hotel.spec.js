const mongoose = require('mongoose');
const Hotel = require('../../models/hotel');  // Path to your Hotel model
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Start an in-memory MongoDB server before tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Close the in-memory MongoDB server after tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

let hotelBoundaryTest = `HotelModel boundary test`;

describe('Hotel Model', () => {
    describe('boundary', () => {
        // Test case for creating a valid hotel
        it(`${hotelBoundaryTest} should create a valid hotel`, async () => {
            const hotelData = {
                name: 'Sunset Resort',
                location: 'California',
                price: 200,
                rooms: 50
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            // Check if the hotel was created successfully
            expect(hotel).toHaveProperty('_id');
            expect(hotel.name).toBe(hotelData.name);
            expect(hotel.location).toBe(hotelData.location);
            expect(hotel.price).toBe(hotelData.price);
            expect(hotel.rooms).toBe(hotelData.rooms);
        });

        // Test case for missing required fields (name)
        it(`${hotelBoundaryTest} should throw an error when name is missing`, async () => {
            const hotelData = {
                location: 'California',
                price: 200,
                rooms: 50
            };

            const hotel = new Hotel(hotelData);
            try {
                await hotel.save();
            } catch (error) {
                expect(error.errors.name).toBeDefined();
                expect(error.errors.name.message).toBe('Path `name` is required.');
            }
        });

        // Test case for missing required fields (location)
        it(`${hotelBoundaryTest} should throw an error when location is missing`, async () => {
            const hotelData = {
                name: 'Ocean View',
                price: 150,
                rooms: 30
            };

            const hotel = new Hotel(hotelData);
            try {
                await hotel.save();
            } catch (error) {
                expect(error.errors.location).toBeDefined();
                expect(error.errors.location.message).toBe('Path `location` is required.');
            }
        });

        // Test case for successfully finding a hotel by name
        it(`${hotelBoundaryTest} should find a hotel by name`, async () => {
            const hotelData = {
                name: 'Blue Lagoon',
                location: 'Bali',
                price: 300,
                rooms: 75
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            const foundHotel = await Hotel.findOne({ name: 'Blue Lagoon' });
            expect(foundHotel).not.toBeNull();
            expect(foundHotel.name).toBe('Blue Lagoon');
        });

        // Test case for deleting a hotel
        it(`${hotelBoundaryTest} should delete a hotel by id`, async () => {
            const hotelData = {
                name: 'Desert Oasis',
                location: 'Dubai',
                price: 500,
                rooms: 100
            };

            const hotel = new Hotel(hotelData);
            await hotel.save();

            const hotelId = hotel._id;
            await Hotel.findByIdAndDelete(hotelId);

            const deletedHotel = await Hotel.findById(hotelId);
            expect(deletedHotel).toBeNull();
        });
    });
});

