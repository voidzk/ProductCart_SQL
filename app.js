const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

//---- PART DB SQL
//
// db.execute('SELECT * FROM products')
//     .then((result) => {
//         console.log(`result length : ${result.length} \n \n \n`);
//         console.log(result[0], result[1]);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

//-------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//-----MW FOR USERS
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch();
});

//------------------------------------------
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// app.post('/coa', (req, res, next) => {
//     console.log('\n UHGHHHHHHHHHHHHHHHHHHHHHHHHHHHH \n \n \n \n \n ');
//     res.redirect('/');
// });
app.use(errorController.get404);
//-----------------------------------
//-------PART SEQUELIZE-DB
//----- sync models of using define()
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

//--------------
sequelize
    .sync()
    // .sync({ force: true })
    .then(results => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'Voidy',
                email: 'intoNone@yahoo.com',
            });
        }
        return user;
    })
    .then(user => {
        // console.log(user);
        return user.createCart();
    })
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
