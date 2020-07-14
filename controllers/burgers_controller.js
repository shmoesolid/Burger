
var express = require('express');
var burger = require('../models/burger.js');
var config = require('../config/config.js');

var router = express.Router();

router.get("/", 
    function(req, res) 
    {
        burger.selectAll(
            function(data) 
            {
                console.log(data);
                res.render("index", { burgers: data });
            }
        );
    }
);

router.get("/api/burgers", 
    function(req, res) 
    {
        burger.selectAll( (data) => res.json(data) );
    }
);

router.post("/api/burgers", 
    function(req, res) 
    {
        var burgerName = req.body.name;

        if (!burgerName) 
            return res.status(500).json("Burger string is empty!");

        if (burgerName.length > config.maxBurgerLength)
            return res.status(500).json("Exceeded max burger string length!");

        burger.insertOne("burger_name", burgerName, 
            function(result)
            {
                if (!result.changedRows) 
                    return res.status(404).end();
                
                res.status(200).end();
            }
        );
    }
);

router.put("/api/burgers/:id", 
    function(req, res) 
    {
        var id = req.params.id;
        var devoured = req.body.devoured;

        if (devoured != 0 && devoured != 1)
            return res.json(false);

        burger.updateOne("devoured", devoured, "id", id, "=",
            function(result)
            {
                if (!result.changedRows) 
                    return res.status(404).end();
                
                res.status(200).end();
            }
        );
    }
);

module.exports = router;