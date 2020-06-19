var express = require('express');
const router = express.Router();
let Product = require('../models/product');
const dotenv = require('dotenv');
var dateFormat = require('dateformat');


// LOAD DOTENV
dotenv.config();

// DECLARE ENV VARIABLES
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const stripe = require('stripe')(stripeSecretKey);

// MAKER SURE WE ARE ON LOCAL ENV THEN GET VARIABLES
if (process.env.NODE_ENV !== 'production') {
    const stripe = require('stripe')(stripeSecretKey);
}






// GET ADD PRODUCT TO CART
router.get('/add/:product', (req, res) => {
    var slug = req.params.product;

    Product.findOne({ slug: slug }, (err, p) => {
        if (err) console.log(err);
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p.id + '/' + p.image
                });
            }
        }
        req.flash('success', 'Producto añadido');
        res.redirect('back');
    });
});

//GET CHECKOUT PAGE
router.get('/checkout', isUser, (req, res) => {
    var user = req.user;
    
        if (req.session.cart && req.session.cart.length == 0) {
            delete req.session.cart;
            res.redirect('/cart/checkout');
        } else {
            res.render('checkout', {
                title: 'Checkout',
                cart: req.session.cart,
                stripePublicKey: stripePublicKey,
            });
        }
    
});
// GET UPDATE PRODUCT
router.get('/update/:product', (req, res) => {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;
    var getCred = false;
    if (action == "domi") {
       cart.push({
            title: 'entrega a domicilio',
            qty: 1,
            price: 20,
            image: '/images/delivery.png'
        });
  req.flash('success', 'Carro actualizado');
        res.redirect('/cart/checkout');
        
    } else {
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].title == slug) {
                switch (action) {
                    case "add":
                        cart[i].qty++;
                        break;
                    case "remove":
                        cart[i].qty--;
                        if (cart[i].qty < 1) cart.splice(i, 1);
                        break;
                    case "clear":
                        cart.splice(i, 1);
                        if (cart[i].qty == 0) delete req.session.cart
                        break;
                    default:
                        console.log('Update problem');
      break;
                }
                break;
            }
        }
      req.flash('success', 'Carro actualizado');
        res.redirect('/cart/checkout');
    }
});

//GET CLEAR CART
router.get('/clear', (req, res) => {
    delete req.session.cart;
    req.flash('success', 'Carro Vacio!');
    res.redirect('/checkout');
});

// PAY SUCCESS ROUTE
router.get('/success_pay', (req, res) => {
  
var cart = req.session.cart;
    var total = 0;
    var action = req.query.action;
    

   for (var i = 0; i < cart.length; i++) {
        var title = cart[i].title;
        var price = cart[i].price;
        var qty = cart[i].qty;
        var sub = price * qty;
}
    

    
    
    var amount = total.toFixed(2);
    
    
 var n = title.includes( 'entrega a domicilio');
 
    
    
    req.flash('success', 'Has pagado con éxito.gracias por comprar con nosotros!');
    if(n == true){
  res.render('charge', {
        title: "Confirmation",
        amount: amount
    });
    }else{
 delete req.session.cart;
  res.render('index', {
        title: "Confirmation",
        amount: amount
    });
      
    }

});


//STRIPE POST CHARGE
router.post('/charge', (req, res) => {
    var cart = req.session.cart;
    var total = 0;
    var action = req.query.action;
    
    

    for (var i = 0; i < cart.length; i++) {
        var title = cart[i].title;
        var price = cart[i].price;
        var qty = cart[i].qty;
        var sub = price * qty;

        total += +sub;
      
    }
    
    
    let amount = parseInt(total * 100);
    stripe.customers.create({
            email: req.body.email,
            card: req.body.id
        })
        .then(customer =>
            stripe.charges.create({
                amount,
                description: "Sample Charge",
                currency: "eur",
                customer: customer.id
            }))
        .then((charge) => {
            res.redirect('success_pay');
        })
        .catch(err => {
            console.log("Error:", err);
            res.status(500).send({ error: "Purchase Failed" });
        });
});



// Access control
function isUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;