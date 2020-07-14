
var express = require('express');
var burger = require('../models/burger.js');

var router = express.Router();

router.get("/", 
    function(req, res) 
    {
        burger.all(
            function(data) 
            {
                //var hbsObject = { cats: data };
                console.log(data);
                //res.render("index", hbsObject);
            }
        );
    }
);

module.exports = router;