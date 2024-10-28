
const Product = require('../models/product');

exports.getProducts = (req,res,next)=> {
    Product.fetchAll()
        .then(
            products => {
                res.render('shop/product-list', {
                    prods: products,
                    pageTitle: 'All Products',
                    path: '/products',
                });
            }).catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId; // Lấy ID sản phẩm từ tham số URL

    Product.findById(prodId) // Sử dụng findByPk để tìm sản phẩm theo ID
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
    Product.fetchAll().then(products => {
        res.render('shop/index',{
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    }).catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(products => {
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
    req.user.deleteItemFromCart(prodID)
        .then(result => {
            // Sau khi xóa thành công, chuyển hướng về trang giỏ hàng
            res.redirect('/cart');
        })
        .catch(err => console.log(err))  // Xử lý nếu có lỗi xảy ra
}

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then(() => {
            res.redirect('/orders'); // Chuyển hướng đến trang đơn hàng
        })
        .catch(err => {
            console.error(err); // Ghi lỗi ra console
            res.status(500).send('An error occurred while processing your order.'); // Phản hồi lỗi đến người dùng
        });
};


exports.getOrders = (req, res, next) => {
    req.user.getOrders()
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
