const Squelize = require('sequelize');
const squelize = require('../util/database');

const Order = squelize.define('order', {
    id: {
        type: Squelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = Order;