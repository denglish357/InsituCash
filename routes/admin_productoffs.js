var express = require('express');
const router = express.Router();
var fs = require('fs-extra');
const mkdirp = require('mkdirp');
const resizeImg = require('resize-img');
var path = require('path');

var dateFormat = require('dateformat');



var moment = require('moment'); // require

var now = moment().format('L');

const { check, validationResult } = require('express-validator');
// GET PRODUCT MODEL
const Productoff = require('../models/productoff');

// GET CATEGORY MODEL
const Category = require('../models/category');


// GET USER OFERTAS
router.get('/admin_ofertas', (req, res) => {

var filter = {};
 if(req.query.date){
 var when = moment(req.query.date).format('L').toString();
   filter= {
     date: when
   }
 }
    else{
    filter ={
      date: now.toString()
    }
    }


  
  //let user = req.user;
  //let who = user.toString();
  Productoff.find(filter, (err, ofertas) => {
    if (err){
      console.log(err)
    }else{
      let count = ofertas.length;
      res.render('admin/ofertas',
      {
        title: 'Ofertas de Hoy', 
        ofertas: ofertas,
        count: count
      });
    }
  });
});


    
module.exports = router;