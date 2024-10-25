const Product = require('../models/product');
const {where} = require("sequelize");

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    Product.create({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user.id
    })
        .then(result => {
            // console.log(result);
            console.log("Created Product");
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    console.log('Edit Mode:', editMode); // Kiểm tra giá trị editMode
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    req.user.getProducts({ where: { id: prodId } })
        .then(products => {
            const product = products[0];  // Lấy sản phẩm đầu tiên từ mảng kết quả
            if (!product) {
                console.log('Product not found');  // Kiểm tra nếu sản phẩm không được tìm thấy
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch(err => console.log(err));
};



exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

    Product.findByPk(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/admin/products'); // Nếu không tìm thấy sản phẩm
            }

            // Cập nhật thông tin sản phẩm
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDesc;

            return product.save(); // Lưu sản phẩm
        })
        .then(result => {
            // Khi lưu thành công, chuyển hướng đến trang sản phẩm admin
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/products'); // Xử lý lỗi và chuyển hướng nếu có
        });
};


exports.getProducts = (req, res, next) => {
    req.user.getProducts().then(
        products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }
    ).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    console.log(prodId);
    Product.findByPk(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/admin/products');
            }
            return product.destroy();
        })
        .then(result => {
            console.log('DESTROY PRODUCT!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/products');
        });
};


