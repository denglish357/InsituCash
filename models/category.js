let mongoose = require('mongoose');


let CategorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
      slug: {
        type: String,
        required: false
    },
    image: {
      type: String
    }
});

let Category = module.exports = mongoose.model('Category', CategorySchema);