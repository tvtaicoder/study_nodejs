const Product = require('../models/product');
const Order = require('../models/order');


exports.getProducts = (req,res,next)=> {
    Product.findAll().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        });
    }).catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId; // Lấy ID sản phẩm từ tham số URL

    Product.findByPk(prodId) // Sử dụng findByPk để tìm sản phẩm theo ID
        .then(product => {
            // if (!product) {
            //     // Nếu không tìm thấy sản phẩm, trả về lỗi 404
            //     return res.status(404).render('404', { pageTitle: 'Product Not Found', path: '/404' });
            // }
            // Nếu tìm thấy sản phẩm, render trang chi tiết sản phẩm
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
    Product.findAll().then(products => {
        res.render('shop/index',{
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    }).catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
                .then(
                    products => {res.render('shop/cart', {
                        pageTitle: 'Your Cart',
                        path: '/cart',
                        products: products
                    })}).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
    // Lấy `productId` từ dữ liệu gửi lên thông qua biểu mẫu (POST request)
    const prodId = req.body.productId;

    // Biến để lưu trữ giỏ hàng lấy được và số lượng sản phẩm mới
    let fetchedCart;
    let newQuantity = 1;

    // Lấy giỏ hàng của người dùng hiện tại
    req.user.getCart()
        .then(cart => {
            // Gán giỏ hàng vừa lấy vào biến `fetchedCart`
            fetchedCart = cart;

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa bằng cách tìm theo `prodId`
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            // Biến để lưu trữ sản phẩm (nếu tìm thấy trong giỏ hàng)
            let product;

            // Nếu sản phẩm đã tồn tại trong giỏ hàng (mảng `products` có phần tử), gán sản phẩm đó vào biến `product`
            if (products.length > 0) {
                product = products[0]; // Lấy sản phẩm đầu tiên trong mảng (do tìm theo id nên chỉ có 1 sản phẩm)
            }

            // Nếu sản phẩm đã có trong giỏ hàng
            if (product) {
                // Lấy số lượng cũ của sản phẩm trong giỏ hàng
                const oldQuantity = product.cartItem.quantity;

                // Tăng số lượng sản phẩm trong giỏ hàng lên 1
                newQuantity = oldQuantity + 1;

                // Trả về sản phẩm để tiếp tục xử lý
                return product;
            }

            // Nếu sản phẩm chưa có trong giỏ hàng, tìm sản phẩm trong cơ sở dữ liệu theo `prodId`
            return Product.findByPk(prodId);
        })
        .then(product => {
            // Sau khi đã có sản phẩm (có thể là sản phẩm đã có trong giỏ hàng hoặc sản phẩm mới),
            // thêm sản phẩm vào giỏ hàng với số lượng mới (hoặc ban đầu là 1)
            return fetchedCart.addProduct(product, {
                through: {
                    quantity: newQuantity // Ghi chú rằng đây là thông tin của bảng `CartItem` với cột `quantity`
                }
            });
        })
        .then(() => {
            // Sau khi đã thêm sản phẩm vào giỏ hàng, chuyển hướng người dùng về trang giỏ hàng
            res.redirect('/cart');
        })
        .catch(err => {
            // Xử lý lỗi nếu có và in ra console
            console.log(err);
        });
};


exports.postCartDeleteProduct = (req, res, next) => {
    const prodID = req.body.productId;  // Lấy productId từ dữ liệu gửi lên qua form (POST request)

    req.user.getCart()  // Tìm giỏ hàng hiện tại của người dùng
        .then(cart => {
            // Tìm sản phẩm trong giỏ hàng có ID = prodID
            return cart.getProducts({ where: { id: prodID } });
        })
        .then(products => {
            const product = products[0];  // Lấy sản phẩm đầu tiên (vì chỉ có một sản phẩm có ID này trong giỏ)
            // Xóa sản phẩm này khỏi bảng CartItem, nghĩa là xóa sản phẩm khỏi giỏ hàng
            return product.cartItem.destroy();
        })
        .then(result => {
            // Sau khi xóa thành công, chuyển hướng về trang giỏ hàng
            res.redirect('/cart');
        })
        .catch(err => console.log(err))  // Xử lý nếu có lỗi xảy ra
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts(); // Lấy các sản phẩm từ giỏ hàng
        })
        .then(products => {
            if (!products || products.length === 0) {  // Kiểm tra nếu products không tồn tại hoặc rỗng
                console.log('No products in the cart.');
                return res.redirect('/cart');  // Quay lại trang giỏ hàng nếu không có sản phẩm
            }
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };  // Thêm quantity vào orderItem
                        return product;
                    }));
                });
        })
        .then(() => {
            // Xóa tất cả sản phẩm khỏi giỏ hàng
            return fetchedCart.setProducts(null);
        })
        .then(() => {
            res.redirect('/orders'); // Chuyển hướng đến trang đơn hàng
        })
        .catch(err => {
            console.error(err); // Ghi lỗi ra console
            res.status(500).send('An error occurred while processing your order.'); // Phản hồi lỗi đến người dùng
        });
};


exports.getOrders = (req, res, next) => {
    req.user.getOrders( {include: ['products']})
        .then(
            orders => {
                console.log(orders);
                res.render('shop/orders', {
                    pageTitle: 'Your Orders',
                    path: '/orders',
                    orders: orders
                })
            }
        )
        .catch(err => console.log(err));
}
