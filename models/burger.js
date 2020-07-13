
var orm = require('../config/orm.js');

var burger = 
{
    all: function(cb)
    {
        orm.selectAll("table", (res) => cb(res));
    }
}

module.exports = burger;