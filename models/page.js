let mongoose = require('mongoose');


let PageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number,
        required: false
    }
});

let Page = module.exports = mongoose.model('Page', PageSchema);