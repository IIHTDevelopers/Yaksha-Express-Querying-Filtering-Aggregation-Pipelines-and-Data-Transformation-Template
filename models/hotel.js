const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema();

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
