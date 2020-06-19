const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
var path = require('path');





// GET PRODUCT MODEL
const Product = require('../models/product');
// GET CATEGORY MODEL
const Category = require('../models/category');

// GET PRODUCTS INDEX
router.get('/', (req, res) => {
    var count;

    Product.countDocuments((err, c) => {
        count = c;
    });
    Product.find((err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

// GET ADD PRODUCT
router.get('/add-product', (req, res) => {
    var title = '';
    var desc = '';
    var price = '';

    Category.find((err, categories) => {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            price: price,
            categories: categories,
        });
    });
});

// POST ADD PRODUCT
router.post('/add-product', (req, res) => {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    check('title', 'Se necesita Titulo').isLength({ min: 1 });
    check('price', 'Se ncesita precio').isDecimal();
    check('desc', 'Se ncesita descripcion').isLength({ min: 1 });
    check('image', 'Se ncesita subir Imagen').custom(function(value, filename) {
        var extension = (path.extname(filename)).toLowerCase();
        switch (extension) {
            case '.jpg':
                return '.jpg';
            case '.jpeg':
                return '.jpeg';
            case '.png':
                return '.png';
            case "":
                return '.jpg';
            default:
                return false;
        }
    });



    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        Category.find((err, categories) => {
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                price: price,
                categories: categories,
                errors: errors.array(),
                admin: null
            });
        });

    } else {
        Product.findOne({
                slug: slug
            },
            (err, product) => {
                if (product) {
                    console.log('This page already exist');
                    req.flash('Ya existe este elige otra');
                    Category.find((err, categories) => {
                        res.render('admin/add_product', {
                            title: title,
                            desc: desc,
                            price: price,
                            categories: categories
                        });
                    });
                } else {
                    var price2 = parseFloat(price).toFixed(2);
                    var product = new Product({
                        title: title,
                        slug: slug,
                        desc: desc,
                        price: price2,
                        category: category,
                        image: imageFile
                    });
                    product.save((err) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            mkdirp('public/product_images/' + product._id, function(err) {
                                if (err) return console.log(err);

                            })
                            mkdirp('public/product_images/' + product._id + '/gallery', function(err) {
                                if (err) return console.log(err);

                            })
                            mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function(err) {
                                if (err) return console.log(err);

                            })

                            if (imageFile != "") {

                                var productImage = req.files.image;
                                var path = 'public/product_images/' + product._id + '/' + imageFile;
                                productImage.mv(path, (err) => {
                                    if (err) return console.log(err);
                                });
                            }
                            req.flash('success', 'Producto añandido');
                            res.redirect('/admin/products');
                        }
                    });
                }
            });
    }


});


// GET EDIT PRODUCT
router.get('/edit-product/:id', (req, res) => {
    // if (req.session.errors) var errors = session.req.errors;
    // req.session.errors = null;

    Category.find((err, categories) => {
        Product.findById(req.params.id, (err, p) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        io = files;
                        res.render('admin/edit_product', {
                            title: p.title,
                            //errors: errors,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            desc: p.desc,
                            price: p.price,
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        })
                    }
                });
            }
        });

    });
});

// POST EDIT PRODUCT
router.post('/edit-product/:id', (req, res) => {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    check('title', 'Se necesita Titulo').isLength({ min: 1 });
    check('price', 'Se ncesita precio').isDecimal();
    check('desc', 'Se ncesita descripcion').isLength({ min: 1 });
    check('image', 'Se ncesita subir Imagen').custom(function(value, filename) {
        var extension = (path.extname(filename)).toLowerCase();
        switch (extension) {
            case '.jpg':
                return '.jpg';
            case '.jpeg':
                return '.jpeg';
            case '.png':
                return '.png';
            case "":
                return '.jpg';
            default:
                return false;
        }
    });



    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    const errors = validationResult(req);



    if (!errors.isEmpty()) {
        Category.find((err, categories) => {
            res.render('admin/edit_product', {
                title: title,
                desc: desc,
                price: price,
                categories: categories,
                errors: errors.array(),
                id: id,
            });
        });
    }
    Product.findOne({ slug: slug, _id: { 'ne': id } }, (err, p) => {
        if (err) console.log(err);

        if (p) {
            req.flash('danger', 'Ya existe titulo del producto elige otra');
            res.redirect('/admin/products/edit-product/' + id);
        } else {
            Product.findById(id, (err, p) => {
                if (err) console.log(err);
                p.title = title;
                p.slug = slug;
                p.desc = desc;
                p.price = parseFloat(price).toFixed(2);
                p.category = category;

                if (imageFile != "") {
                    p.image = imageFile;
                }
                p.save((err) => {
                    if (err) console.log(err);
                    if (imageFile != "") {
                        if (pimage != "") {
                            fs.remove('public/product_image/' + id + '/' + pimage, (err, ) => {
                                if (err) console.log(err);

                            });
                        }
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + p._id + '/' + imageFile;
                        productImage.mv(path, (err) => {
                            if (err) return console.log(err);
                        });
                    }

                    req.flash('success', 'Producto Editado');
                    res.redirect('/admin/products/edit-product/' + id);
                });
            });
        }
    });
});


// POST PRODUCT GALLERY
router.post('/product-gallery/:id', (req, res) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, (err) => {
        if (err) console.log(err);
        resizeImg(fs.readFileSync(path), {
            width: 100,
            height: 100
        }).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });
    res.sendStatus(200);
});



// GET DELETE IMAGE
router.get('/delete-image/:image', function(req, res) {
    console.log(req.params.id);
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Imagen Borrado');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    })
})


// GET  DELETE  PRODUCT
router.get('/delete-product/:id', (req, res) => {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, (err) => {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, (err) => {
                if (err) return console.log(err);
                req.flash('success', 'Producto Borrado');
                res.redirect('/admin/products');
            });
        }
    });
});

// Access control
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        return next();
    } else {
        req.flash('danger', 'Please login as administator to use this function');
        res.redirect('/users/login');
    }
}


module.exports = router;