const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errController = require('./controllers/404');
const mongoConnect = require('./util/database').mongoConnect;

const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes  = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    // User.findByPk(1)
    //     .then(user => {
    //         req.user = user;  // Gán người dùng tìm thấy vào req.user
    //         next();           // Tiếp tục đến middleware hoặc route tiếp theo
    //     })
    //     .catch(err => {
    //         console.log(err);
            next();  // Gọi next() ngay cả khi có lỗi để không làm ứng dụng bị treo
    //     });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errController.get404Page);

mongoConnect(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});
