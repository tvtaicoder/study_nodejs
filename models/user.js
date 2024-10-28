const mongoDb = require("mongodb");
const getDb = require('../util/database').getDb;
const ObjectId = mongoDb.ObjectId;

class User {
    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product.id.toString();
        });

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new ObjectId(product._id),
                quantity: newQuantity,
                addedAt: new Date() // Lưu thời gian thêm sản phẩm vào giỏ hàng
            });
        }

        const updateCart = { items: updatedCartItems };

        const db = getDb();
        return db.collection('users')
            .updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: updateCart } }
            )
            .then()
            .catch(err => {
                console.log(err);
            });
    }

    cleanCart() {
        const maxAge = 30 * 60 * 1000; // 30 phút
        const now = new Date();

        this.cart.items = this.cart.items.filter(item => {
            return now - new Date(item.addedAt) < maxAge; // Giữ lại sản phẩm còn trong thời gian quy định
        });
    }


    getCart() {
        this.cleanCart(); // Xóa sản phẩm quá hạn trước khi lấy giỏ hàng

        const db = getDb();
        const productIds = this.cart.items.map(i => {
            return i.productId;
        });

        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i => {
                            return i.productId.toString() === p._id.toString();
                        }).quantity
                    };
                });
            })
            .catch(err => {
                console.log(err);
            });
    }


    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });

        const db = getDb();
        return db.collection('users')
            .updateOne(
                { _id: new ObjectId(this._id) },
                { $set: { cart: { items: updatedCartItems } } }
            )
            .then(() => {
                console.log('Product removed from cart');
            })
            .catch(err => {
                console.log('Error removing product from cart:', err);
            });
    }

    addOrder(){
        const db = getDb();
        return this.getCart().then(products =>{
            const order = {
                items: products,
                user: {
                    _id: new ObjectId(this._id),
                    name: this.name,
                }
            }
            return db.collection('orders')
                .insertOne(order)
        }).then(result =>{
                this.cart = {items: []};
                return db.collection('users')
                    .updateOne(
                        { _id: new ObjectId(this._id) },
                        { $set: { cart: { items: [] } } }
                    )
            })
            .catch(err =>{
            console.log(err);
        })
    }

    getOrders(){
        const db = getDb();
        return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
    }

    static findById(id){
        const db = getDb();
        return db.collection('users')
            .findOne({_id: new ObjectId(id)})
            .then(result =>{
                return result;
            })
            .catch(err => {
                console.log(err);
            }
            )
    }
}

module.exports = User;
