
const Product = require("../models/product");

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
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save()
        .then(result => {
            console.log("Created Product");
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};
//
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit === 'true'; // Đảm bảo giá trị editMode là boolean
    console.log('Edit Mode:', editMode); // Kiểm tra giá trị editMode
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                console.log('Product not found');
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

    Product.findById(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;
            return product.save();
        })
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin/products');
        });
};


exports.getProducts = (req, res, next) => {
    Product.find()
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(
            products => {
                console.log(products);
                res.render('admin/products', {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products'
                });
            }
        ).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId; // Lấy ID sản phẩm từ request body
    Product.findByIdAndDelete(prodId) // Gọi phương thức xóa sản phẩm
        .then(() => {
            res.redirect('/admin/products'); // Chuyển hướng về trang danh sách sản phẩm sau khi xóa
        })
        .catch(err => {
            console.log(err); // In ra lỗi nếu có
            res.redirect('/admin/products'); // Chuyển hướng về trang danh sách sản phẩm trong trường hợp có lỗi
        });
};


