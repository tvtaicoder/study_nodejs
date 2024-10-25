const Squelize = require('sequelize');
const squelize = require('../util/database');

const Cart = squelize.define('cart', {
    id: {
        type: Squelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = Cart;