
var orm = require('../config/orm.js');

var burger = 
{
    all: function(cb)
    {
        orm.fetch("burgers", ['*']).then( (res) => cb(res) );
    }
}

module.exports = burger;