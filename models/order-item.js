const Squelize = require('sequelize');
const squelize = require('../util/database');

const OderItem = squelize.define('orderItem', {
    id: {
        type: Squelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Squelize.INTEGER,
})

module.exports = OderItem;