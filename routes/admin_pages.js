var express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// GET PAGE MODEL
const Page = require('../models/page');

// GET PAGES INDEX
router.get('/', isAdmin, (req, res) => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

// GET ADD PAGE
router.get('/add-page', isAdmin, (req, res) => {
    var title = '';
    var slug = '';
    var content = '';

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

// POST ADD PAGE
router.post('/add-page', isAdmin, [
    check('title', 'Se necesita Titulo').isLength({ min: 1 }),
    check('content', 'Se ncesita contenido').isLength({ min: 1 })
], (req, res) => {
    var title = req.body.title;
    var slug = req.body.slug
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    if (slug === "") {
        var slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('admin/add_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({
                slug: slug
            },
            (err, page) => {
                if (page) {
                    console.log('This page already exist');
                    req.flash('Ya existe este elige otra');
                    res.render('admin/add_page', {
                        title: title,
                        slug: slug,
                        content: content
                    });
                } else {
                    var page = new Page({
                        title: title,
                        slug: slug,
                        content: content,
                        sorting: 100
                    });
                    page.save((err) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            // GET ALL PAGES TO PASS TO HEADER.EJS
                            Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.app.locals.pages = pages;
                                }
                            });
                            req.flash('success', 'Pagina añandido');
                            res.redirect('/admin/pages');
                        }
                    });
                }
            });
    }


});

// SORT PAGES FUNCTION 
function sortPages(ids, isAdmin, callback) {
    count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++
        (function(count) {
            Page.findById(id, (err, page) => {
                page.sorting = count;
                page.save((err) => {
                    if (err) {
                        return console.log(err);
                    }
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count)
    }
}

// POST REORDER PAGES
router.post('/reorder-pages', isAdmin, (req, res) => {
    var ids = req.body['id[]'];

    sortPages(ids, function() {
        // GET ALL PAGES TO PASS TO HEADER.EJS
        Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });
});

// GET EDIT PAGE
router.get('/edit-page/:id', isAdmin, (req, res) => {
    Page.findById(req.params.id, function(err, page) {
        if (err)
            return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });

    });

});


// POST EDIT PAGE
router.post('/edit-page/:id', [
    check('title', 'Se necesita Titulo').isLength({ min: 1 }),
    check('content', 'Se ncesita contenido').isLength({ min: 1 })
], (req, res) => {
    var title = req.body.title;
    var slug = req.body.slug
    var id = req.params.id;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    if (slug === "") {
        var slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('admin/edit_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({
                slug: slug,
                _id: { '$ne': id }
            },
            (err, page) => {
                if (page) {
                    console.log('This page already exist');
                    req.flash('Ya existe este elige otra');
                    res.render('admin/edit_page', {
                        title: title,
                        slug: slug,
                        content: content,
                        id: id
                    });
                } else {
                    Page.findById(id, (err, page) => {
                        if (err) return console.log(err);
                        page.title = title;
                        page.slug = slug;
                        page.content = content;

                        page.save((err) => {
                            if (err) {
                                return console.log(err);
                            } else {

                                // GET ALL PAGES TO PASS TO HEADER.EJS
                                Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        req.app.locals.pages = pages;
                                    }
                                });
                                req.flash('success', 'Pagina Editado');
                                res.redirect('/admin/pages/edit-page/' + page.id);
                            }
                        });
                    });
                }
            });
    }
});


// GET PAGES DELETE
router.get('/delete-page/:id', isAdmin, (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if (err) return console.log(err);

        // GET ALL PAGES TO PASS TO HEADER.EJS
        Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        req.flash('success', 'Pagina Borrado');
        res.redirect('/admin/pages');

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