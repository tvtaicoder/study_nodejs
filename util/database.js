const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) =>{
    MongoClient.connect('mongodb+srv://tester:faaJ8OzQ29fMHAIz@cluster0.maq21.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(client => {
            console.log('Connected successfully');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}
const getDb = () => {
    if (_db){
        return _db;
    }
    throw 'No database found.';
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;