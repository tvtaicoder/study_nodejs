const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errController = require('./controllers/404');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes  = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('671cbbf48150e9166d0d9ede')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();           // Tiếp tục đến middleware hoặc route tiếp theo
        })
        .catch(err => {
            console.log(err);
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errController.get404Page);

mongoConnect(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});
