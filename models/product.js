let mongoose = require('mongoose');


let ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: false
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    }
});

let Product = module.exports = mongoose.model('Product', ProductSchema);