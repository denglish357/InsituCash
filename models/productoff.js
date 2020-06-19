let mongoose = require('mongoose');
  
  
  let ProductoffSchema = mongoose.Schema({
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
          required: true
      },
      price: {
          type: Number,
          required: true
      },
      contact: {
        type: Number
      },
      user : {
        type: String
      },
      date: {
        type: String
      }
  });
  
  let Productoff = module.exports = mongoose.model('Productoff', ProductoffSchema);