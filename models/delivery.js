let mongoose = require('mongoose');


let DeliverySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    paid: {
        type: String,
        required: true
    },
    cod: {
        type: Number,
        required: false
    },
    products: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: false
    }
});

let Delivery = module.exports = mongoose.model('Delivery', DeliverySchema);