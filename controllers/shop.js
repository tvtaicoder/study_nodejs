const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req,res,next)=> {
    Product.find()
        .then(products => {
            console.log(products);
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
            });
        }).catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId; // Lấy ID sản phẩm từ tham số URL

    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => {
            console.log(err);
        });
};


exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index',{
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    }).catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            // const products = user.cart.items;
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            });
        })
        .catch(err => console.log(err));
};


exports.postCart = (req, res, next) => {
    // Lấy `productId` từ dữ liệu gửi lên thông qua biểu mẫu (POST request)
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(
            res.redirect('./cart')
        )
        .then(result => {
            console.log(result);
        })
        .catch(err =>{
            console.log(err);
        })
};


exports.postCartDeleteProduct = (req, res, next) => {
    const prodID = req.body.productId;
    req.user.removeFromCart(prodID)
        .then(result => {
            // Sau khi xóa thành công, chuyển hướng về trang giỏ hàng
            res.redirect('/cart');
        })
        .catch(err => console.log(err))  // Xử lý nếu có lỗi xảy ra
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: i.productId }; // Lấy dữ liệu sản phẩm đầy đủ
            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(() => {
            // Làm trống giỏ hàng sau khi đặt hàng
            req.user.cart.items = [];
            return req.user.save();
        })
        .then(() => {
            res.redirect('/orders'); // Chuyển hướng đến trang đơn hàng
        })
        .catch(err => {
            console.log(err); // Ghi lỗi ra console
            res.status(500).send('An error occurred while processing your order.'); // Phản hồi lỗi đến người dùng
        });
};



exports.getOrders = (req, res, next) => {
    req.user.find()
        .then(
            orders => {
                res.render('shop/orders', {
                    pageTitle: 'Your Orders',
                    path: '/orders',
                    orders: orders
                })
            }
        )
        .catch(err => console.log(err));
}
