var express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
var path = require('path');

// GET Category MODEL
const Category = require('../models/category');

// GET CATEGORIES INDEX
router.get('/', isAdmin, (req, res) => {
    Category.find(function(err, categories) {
        if (err) return console.log(err);
        
        res.render('admin/categories', {
            categories: categories
        });
    });
});

// GET ADD CATEGORY
router.get('/add-category', isAdmin, (req, res) => {
    var title = '';

    res.render('admin/add_category', {
        title: title
    });
});

// POST ADD CATEGORY

router.post('/add-category', (req, res) => {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    check('title', 'Se necesita Titulo').isLength({ min: 1 });
    check('image', 'Se necesita subir Imagen').custom(function(value, filename) {
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
    const errors = validationResult(req);
    

    if (!errors.isEmpty()) {
        
            res.render('admin/add_category', {
                title: title,
                slug: slug,
                errors: errors.array(),
            });
        
   } else {
        Category.findOne({
                slug: slug
            },
            (err, category) => {
                if (category) {
                    req.flash('Ya existe este elige otra');
                    res.render(
                      'admin/add_category',
                      {
                        title: title
                      }
                      )
                    
                } else {
                    var category = new Category({
                        title: title,
                        image: imageFile,
                        slug: slug
                    });
                    
                   category.save((err) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            mkdirp('public/category_images/' + category._id, function(err) {
                                if (err) return console.log(err);
                                
                          })
                            mkdirp('public/category_images/' + category._id + '/gallery', function(err) {
                                if (err) return console.log(err);

                            })
                            mkdirp('public/category_images/'
+ category._id + '/gallery/thumbs', function(err) {
                                if (err) return console.log(err);

                            })

                            if (imageFile != "") {

                                var categoryImage = req.files.image;
                                var
                                
path = 'public/category_images/' + category._id + '/' + imageFile;
                                categoryImage.mv(path, (err) => {
                                    if (err) return console.log(err);
                                });
                            }
                            req.flash('success', 'Categoria añandido');
                            
               res.redirect('/admin/categories');
                        }
                    });
                }
            });
    }


});







// GET EDIT CATEGORY
router.get('/edit-category/:id', isAdmin, (req, res) => {
    Category.findById(req.params.id, function(err, category) {
        if (err)
            return console.log(err);




        res.render('admin/edit_category', {
            title: category.title,
            id: category._id,
            image: category.image
        });

    });

});






// POST EDIT CATEGORY

router.post('/edit-category/:id', isAdmin, (req, res) => {
  var id= req.params.id;
  
 var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
 var image = req.body.image;
 var title = req.body.title;
 
 var slug = title.replace(/\s+/g, '-').toLowerCase();
 

    var pimage = req.body.pimage;
    
    
  check('title', 'Se necesita Titulo').isLength({ min: 1 });
  
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
    
  const errors = validationResult(req);
  
  
    if (!errors.isEmpty()) {
        Category.find((err, categories) => {
            res.render('admin/edit_category', {
                title: title,
                categories: categories,
                errors: errors.array(),
                id: id,
            });
        });
    }else{
      
      
      Category.findById(id, (err, c) => {
        

 
        if(err){
          console.log(err);
        }
        else{
          c.title = title;
          c.image = image;
          c.slug = slug;
          
  if (imageFile != "") {
                    c.image = imageFile;
                }
                
 c.save((err) => {
                    if (err) console.log(err);
                    if (imageFile != "") {
                        if (pimage != "") {
                            fs.remove('public/category_image/' + id + '/' + pimage, (err, ) => {
                                if (err) console.log(err);

                            });
                        }
                        var categoryImage = req.files.image;
                        var path = 'public/category_images/' + c._id + '/' + imageFile;
                        categoryImage.mv(path, (err) => {
                            if (err) return console.log(err);
                        });
                    }

                    req.flash('success', 'Categoria Editado');
                    res.redirect('/admin/categories/edit-category/' + id);
                });
                
        }
        
      });
      
    }
  
    
});

// GET DELETE IMAGE
router.get('/delete-image/:image', function(req, res) {
    console.log(req.params.id);
    var originalImage = 'public/category_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/category_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Imagen Borrado');
                    res.redirect('/admin/categories/edit-category/' + req.query.id);
                }
            });
        }
    })
})

// DELETE CATEGORIES

router.get('/delete-category/:id', (req, res) => {

    var id = req.params.id;
    var path = 'public/category_images/' + id;

    fs.remove(path, (err) => {
        if (err) {
            console.log(err);
        } else {
            Category.findByIdAndRemove(id, (err) => {
                if (err) return console.log(err);
                req.flash('success', 'Categoria Borrado');
                res.redirect('/admin/categories');
            });
        }
    });
});

// Access control
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin == 1) {
        return next();
    } else {
        req.flash('danger', 'Please login as administator to use this function');
        res.redirect('/users/login');
    }
}


module.exports = router;