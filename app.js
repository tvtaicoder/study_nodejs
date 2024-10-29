const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errController = require('./controllers/404');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes  = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('671f8b481af65fb10572bca9')
        .then(user => {
            req.user = user;
            next();           // Tiếp tục đến middleware hoặc route tiếp theo
        })
        .catch(err => {
            console.log(err);
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errController.get404Page);

mongoose.connect('mongodb+srv://tester:faaJ8OzQ29fMHAIz@cluster0.maq21.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
    .then(result => {
        User.findOne().then(user =>{
            if (!user){
                const user = new User({
                    name: 'Tai',
                    email: 'taika@gmail.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        })
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

