var express = require('express');
const router = express.Router();

let Page = require('../models/page');
let Category = require('../models/category');
let Product = require('../models/product')
// GET HOME PAGE
router.get('/', (req, res) => {



if(req.query.search){
const regex = new RegExp(escapeRegex(req.query.search), 'gi');

Product.find({title: regex}, (err,products) => {
  if (err){
    console.log(err)
  }
  else{
    if(products.length < 1){
      noMatch = "No hay Productos"
    }
    res.render('index', {products: products, noMatch: noMatch});
  }
});
        
}
else{
  noMatch = null;
  products = null;
    Category.find((err, categories) => {
        if (err) console.log(err);
        res.render('index', {
            categories: categories
        });
    });
}
});
// GET PAGES
router.get('/:slug', (req, res) => {
    let slug = req.params.slug;

    Page.findOne({ slug: slug }, (err, page) => {
        if (err) console.log(err);
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: 'page.title',
                content: 'page.content',
            });
        }
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};





module.exports = router;