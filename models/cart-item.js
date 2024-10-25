const Squelize = require('sequelize');
const squelize = require('../util/database');
const {Sequelize} = require("sequelize");

const CartItem = squelize.define('cartItem', {
    id: {
        type: Squelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Squelize.INTEGER,
})

module.exports = CartItem;