var express = require('express');
const router = express.Router();
var fs = require('fs-extra');

// GET PRODUCT MODEL
const Product = require('../models/product');

// GET CATEGORY MODEL
const Category = require('../models/category');

// GET ALL PRODUCTS
router.get('/', function(req, res) {
    Product.find(function(err, products) {
        if (err) {
            console.log(erer);
        } else {
            res.render('all_products', {
                title: 'Todos los Productos',
                products: products,

            })
        }
    });
});


// GET PRODUCTS BY CATEGORY
router.get('/:category', function(req, res) {

  
    var categorySlug = req.params.category;
    Category.findOne({ slug: categorySlug }, (err, c) => {
        Product.find({ category: categorySlug }, function(err, products) {
          
    var count = products.length;

          
            if (err) {
                console.log(erer);
            } else {
              console.log(count)
                res.render('cat_products', {
                    title: c.title,
                    products: products,
                    count: count
                })
            }
        });
    });
});

// GET PRODUCTS DETAILS
router.get('/:category/:product', function(req, res) {
    var galleryImages = null;

    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({ slug: req.params.product }, (err, product) => {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';
            fs.readdir(galleryDir, (err, files) => {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });

        }
    });

});

module.exports = router;