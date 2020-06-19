const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
var path = require('path');
var dateFormat = require('dateformat');


// current timestamp in milliseconds
let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();

var today = ( date +'/' + month + '/'+ year);

// GET PRODUCT MODEL
const Product = require('../models/product');
// GET CATEGORY MODEL
const Delivery = require('../models/delivery');
// GET CATEGORY MODEL
const User = require('../models/user');


var moment = require('moment'); // require

var now = moment().format('L');

//UPDATE DELIVERIES
router.get('/update', (req,res)=> {
  
  var filter = {};
  let origin= req.query.origin;
  let valu = req.query.valu;
  
    filter = {
      date: when
    }
    
   Delivery.find(filter,(err, deliveries) => {
        if (err) console.log(err);
      
      
        res.render('admin/deliveries', {
            title: 'Entregas de Hoy',
            deliveries: deliveries
        }, console.log(deliveries)
        );
    });
  
  
});


// GET DELIVERIES 
router.get('/', (req, res) => {
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
   Delivery.find(filter,(err, deliveries) => {
        if (err) console.log(err);
      if (deliveries.length < 1)
      { noMatch = "No hay entrengas hoy"}
        res.render('admin/deliveries', {
            title: 'Entregas de Hoy',
            deliveries: deliveries, 
            noMatch: noMatch
        }
        );
    });
});


router.get('/add-delivery', (req, res) => {
    res.render('admin/add_delivery', {
        title: "Add Delivery"
    });
});

router.post('/add-delivery', [
    check('name', 'Se necesita Nombre').isLength({ min: 4 }),
    check('total', 'Se ncesita total').isDecimal(),
    check('phone', 'Se ncesita Telephono').isLength({ min: 1 }),
    check('email', 'Se necesita correo').isEmail(),
    check('address', 'Se ncesita direccion').isLength({ min: 8 }),
    //check('date', 'Se ncesita fecha').isDate(),
    check('paid', 'Contesta Si o No es pagado').isLength({ min: 2 }),
    check('products', 'Se ncesita al menos un producto').isLength({ min: 2 })
], (req, res) => {


    const errors = validationResult(req);

    var postFrom = req.query.postFrom;
    var name = req.body.name;
    var total = req.body.total;
    var email = req.body.email;
    var address = req.body.address;
    var phone = req.body.phone;
    var date = moment(req.body.date).format('L');
    var cod = req.body.cod;
    var time = req.body.time;
    var paid = req.body.paid;
    var details = req.body.details;
    var products = req.body.products;


    if (!errors.isEmpty()) {
        if (postFrom = "user") {
            res.redirect('/cart/checkout?missCred=yes&addForm=yes');
            console.log('we got errors');
            console.log(errors.array());
        } else {
            res.render('admin/add_delivery', {
                title: "add Delivery",
                errors: errors.array(),
                user: null
            });
        }

    } else {
        Delivery.findOne({
            time: time,
            date: date
        }, (err, delivery) => {
            if (err) console.log(err);
            if (delivery) {
                if (postFrom = "user") {
                    res.redirect('/cart/checkout?missCred=yes&addForm=yes');
                } else {
                    req.flash('danger', 'Ya esta ocupado la hora');
                    res.render('admin/add_delivery', {
                        title: "Add Delivery",
                        user: null
                    });
                }
            } else {
                var delivery = new Delivery({
                    name: name,
                    total: total,
                    email: email,
                    address: address,
                    phone: phone,
                    date: moment(req.body.date).format('L').toString(),
                    cod: cod,
                    time: time,
                    paid: paid,
                    details: details,
                    products: products
                });

                delivery.save(err => {console.log(now); console.log(delivery.date);
                    if (err) console.log(err)
                    if (postFrom = "user") {
                        req.flash('success', 'Datos Actualizados');
                        res.redirect('/cart/checkout?missCred=no&addForm=no');
                    } else {
                        req.flash('success', 'Entrega añandido');
                        res.redirect('/admin/deliveries');
                    }
                });
            }
        });
    }
});

router.post('/update_delivery', (req, res) => {
    var dDate = moment(new Date(req.body.date)).format('L');
    var dName = req.body.name;
    var dProducts = req.body.products;
  Delivery.findOne({ date: dDate, name: dName, products: dProducts }, (err, delivery) => {
        if (err) console.log(err);
        console.log(delivery)
    });
});



// GET  DELETE  PRODUCT
router.get('/delete-delivery/:id', (req, res) => {

    var id = req.params.id;

            Delivery.findByIdAndRemove(id, (err) => {
                if (err) return console.log(err);
                req.flash('success', 'Entrega Borrado');
                res.redirect('/admin/deliveries');
            });
});



// GET ADD DELIVERIES

module.exports = router;