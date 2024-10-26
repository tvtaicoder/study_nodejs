const mongoDb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, description, imageUrl, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = new mongoDb.ObjectId(id);
    }

    save() {
        const db = getDb();
        let dbOp;

        // Kiểm tra nếu đối tượng có `_id` đã tồn tại
        if (this._id) {
            // Nếu có `_id`, sử dụng `updateOne` để cập nhật sản phẩm trong cơ sở dữ liệu
            dbOp = db.collection('products').updateOne(
                { _id: this._id }, // Điều kiện để tìm sản phẩm dựa trên `_id`
                { $set: this }                            // Cập nhật các trường của sản phẩm với giá trị từ đối tượng hiện tại
            );
        } else {
            // Nếu không có `_id`, sử dụng `insertOne` để thêm mới sản phẩm
            dbOp = db.collection('products').insertOne(this);
        }

        // Trả về kết quả của thao tác cơ sở dữ liệu
        return dbOp
            .then(result => {
                console.log(result); // Hiển thị kết quả khi thao tác thành công
            })
            .catch(err => {
                console.log('Error creating/updating product:', err); // Báo lỗi nếu có lỗi xảy ra
            });
    }


    static fetchAll(){
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(
                products =>{
                    console.log(products);
                    return products;
                }
            )
            .catch(err => {
                console.log(err);
            });
    }

    static findById(id){
        const db = getDb();
        return db.collection('products')
            .find({ _id: new mongoDb.ObjectId(id) })
            .next()
            .then(result => {
                console.log(result);
                return result;
            })
            .catch(err => {
                console.log(err);
            })
    }
}

module.exports = Product;
