
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
    },
    count: function(cb)
    {
        orm
            .fetch("burgers", ['COUNT(*) AS `count`'])
            .then( (res) => cb(res) );
    },
    delete: function(whereKey, whereValue, operator, cb)
    {
        orm
            .delete("burgers", {[whereKey]: whereValue}, [operator])
            .then( (res) => cb(res) );
    }
}

module.exports = burger;
