var express = require('express');
const router = express.Router();
var fs = require('fs-extra');
const mkdirp = require('mkdirp');
const resizeImg = require('resize-img');
var path = require('path');

var moment = require('moment'); 

const { check, validationResult } = require('express-validator');


const Productoff = require('../models/productoff');



// GET CATEGORY MODEL
const Category = require('../models/category');

// GET PRODUCT
router.get('/oferta/:id', function(req, res) {
  var galleryImages = null;
  
  let ofId = req.params.id.toString();
    Productoff.findById(ofId, function(err, p) {
        if (err) {
            console.log(err);
        } else {
  var galleryDir = 'public/productoff_images/' + p._id + '/gallery';
  fs.readdir(galleryDir, (err, files) => {
    if (err){
      console.log(err)
    }
    else{
      galleryImages = files;
      
            res.render('user/oferta', {
                title: 'Todos los Ofertas',
                p: p,
                galleryImages: galleryImages

            })
    }
  });
          

        }
    });
});



// GET ADD OFERTA
router.get('/add-oferta', function(req, res) {
    Category.find(function(err, categories) {
        if (err) {
            console.log(err);
        } else {
            res.render('user/add_productoff', {
                title: 'Vende Algo',
                categories: categories

            })
        }
    });
});

// POST NEW OFFER
router.post('/add-productoff', (req, res) => {
  let user = req.user;
var now = moment().format('L').toString();

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    check('title', 'Se necesita Titulo').isLength({ min: 1 });
    check('price', 'Se necesita precio').isDecimal();
    check('desc', 'Se ncesita descripcion').isLength({ min: 1 });
    check('contact', 'Se ncesita Numero de Contacto').isLength({ min: 6 });
   
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
            res.render('user/add-productoff', {
                title: title,
                desc: desc,
                price: price,
                categories: categories,
                user: user,
                
                errors: errors.array(),
            });
        });

    } else {
        Productoff.findOne({
                slug: slug
            },
            (err, productoff) => {
                if (productoff) {
      
                    
      req.flash('Ya existe este elige oferta');
                    Category.find((err, categories) => {
                        res.render('user/add_productoff', {
                            title: title,
                            desc: desc,
                            price: price,
                            user: user,
                            categories:
                            
categories
                        });
                    });
                } else {
                    var price2 = parseFloat(price).toFixed(2);
                    var productoff = new Productoff({
                        title: title,
                        slug: slug,
                        desc: desc,
                        price: price2,user: user,
                        category: category,
                        date: now,
                        image:
                        
imageFile
                    });
                    productoff.save((err) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            mkdirp('public/productoff_images/' + productoff._id, function(err) {
                                if
                                
(err) return console.log(err);

                            })
                            mkdirp('public/productoff_images/' + productoff._id + '/gallery', function(err) {
                                if (err) return console.log(err);
                            })
                            mkdirp('public/productoff_images/' + productoff._id + '/gallery/thumbs', function(err) {
                                if (err) return console.log(err);

                            })

                            if (imageFile != "") {

                                var productImage = req.files.image;
                                
                       var path = 'public/productoff_images/' + productoff._id + '/' + imageFile;
                                productImage.mv(path, (err) => {
                                    if (err) return console.log(err);
                                });
                            }
                            req.flash
                                
('success', 'Producto añandido');
                            res.redirect('user_ofertas');
                        }
                    });
                }
            });
    }


});



// GET EDIT OFERTA
router.get('/edit-oferta/:id', (req, res) => {
    // if (req.session.errors) var errors = session.req.errors;
    // req.session.errors = null;
    let user = req.user

    Category.find((err, categories) => {
        Productoff.findById(req.params.id, (err, p) => {
            if (err) {
                console.log(err);
                res.redirect('/user/productoffs');
            } else {
                var galleryDir = 'public/productoff_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        io = files;
                        res.render('user/edit_oferta', {
                            title: p.title,
                            contact: p.contact,
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
router.post('/edit-oferta/:id', (req, res) => {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    check('title', 'Se necesita Titulo').isLength({ min: 1 });
    check('contact', 'Se necesita numero de contacto').isLength({min: 6});
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


    var user = req.user;
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var date = req.body.date;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
    var contact = req.body.contact

    const errors = validationResult(req);



    if (!errors.isEmpty()) {
        Category.find((err, categories) => {
            res.render('admin/edit_product', {
                title: title,
                desc: desc,
                price: price,
                contact: contact,
                user: user,
                categories: categories,
                errors: errors.array(),
                id: id,
            });
        });
    }
    Productoff.findOne({ slug: slug, _id: { 'ne': id } }, (err, p) => {
        if (err) console.log(err);

        if (p) {
            req.flash('danger', 'Ya existe titulo del producto elige otra');
            res.redirect('/admin/products/edit-product/' + id);
        } else {
            Productoff.findById(id, (err, p) => {
                if (err) console.log(err);
                p.user = user;
                p.contact = contact;
                p.title = title;
                p.date = date;
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
                            fs.remove('public/productoff_image/' + id + '/' + pimage, (err, ) => {
                                if (err) console.log(err);

                            });
                        }
                        var productImage = req.files.image;
                        var path = 'public/productoff_images/' + p._id + '/' + imageFile;
                        productImage.mv(path, (err) => {
                            if (err) return console.log(err);
                        });
                    }

                    req.flash('success', 'Oferta Editado');
                    res.redirect('/user/productoffs/edit-oferta/' + id);
                });
            });
        }
    });
});
        

// POST PRODUCT GALLERY
router.post('/productoff-gallery/:id', (req, res) => {
    var productoffImage = req.files.file;
    var id = req.params.id;
    var path = 'public/productoff_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/productoff_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productoffImage.mv(path, (err) => {
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



// GET USER OFERTAS
router.get('/user_ofertas', (req, res) => {
  let user = req.user;
  let who = user.toString();
  Productoff.find({user: who}, (err, ofertas) => {
    if (err){
      console.log(err)
    }else{
      let count = ofertas.length;
      res.render('user/ofertas',
      {
        title: 'Tus ofertas', 
        ofertas: ofertas,
        count: count
      });
    }
  });
});


// GET DELETE IMAGE
router.get('/delete-image/:image', function(req, res) {
    console.log(req.params.id);
    var originalImage = 'public/productoff_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/productoff_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Imagen Borrado');
                    res.redirect('/user/productoffs/edit-oferta/' + req.query.id);
                }
            });
        }
    })
})

// GET  DELETE  PRODUCCTOFF


// GET  DELETE  PRODUCT
router.get('/delete-oferta/:id', (req, res) => {

    var id = req.params.id;
    var path = 'public/productoff_images/' + id;

    fs.remove(path, (err) => {
        if (err) {
        console.log(err);
        } else {
            Productoff.findByIdAndRemove(id, (err) => {
                if (err) return console.log(err);
                req.flash('success', 'Producto Borrado');
                res.redirect('/user_ofertas');
            });
        }
    });
});
    
module.exports = router;