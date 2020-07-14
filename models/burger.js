
var orm = require('../config/orm.js');

var burger = 
{
    selectAll: function(cb)
    {
        orm
        .fetch("burgers", ['*'])
        .then( (res) => cb(res) );
    },
    insertOne: function(key, value, cb)
    {
        orm
        .insert("burgers", {[key]: value, devoured: 0})
        .then( (res) => cb(res) );
    },
    updateOne: function(tableCol, value, whereKey, whereValue, operator, cb)
    {
        orm
        .update("burgers", {[tableCol]: value}, {[whereKey]: whereValue}, [operator])
        .then( (res) => cb(res) );
    }
}

module.exports = burger;