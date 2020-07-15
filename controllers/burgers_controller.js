
var express = require('express');
var burger = require('../models/burger.js');
var config = require('../config/config.js');

var router = express.Router();

router.get("/", 
    function(req, res) 
    {
        burger.selectAll( (data) => res.render("index", { burgers: data }) );
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
        var burgerName = req.body.burger_name;

        if (!burgerName) 
            return res.status(500).json("Burger string is empty!");

        if (burgerName.length > config.maxBurgerLength)
            return res.status(500).json("Exceeded max burger string length!");

        burger.count(
            function(result)
            {
                if (result[0].count >= config.maxBurgers)
                    return res.status(500).json("Too many burgers in database already!" );

                burger.insertOne("burger_name", burgerName, 
                    function(result)
                    {
                        res.json({ id: result.insertId });
                    }
                );
            }
        )
    }
);

router.put("/api/burgers/:id", 
    function(req, res) 
    {
        var id = req.params.id;
        var devoured = req.body.devoured;

        if (devoured === null) devoured = 0;
        if (devoured != 0 && devoured != 1)
            return res.status(500).json("Devoured value is invalid!");

        burger.updateOne("devoured", devoured, "id", id, "=",
            function(result)
            {
                if (!result.changedRows) 
                    return res.status(404).json("Database remains unchanged!  Contanct sytem admin.");
                
                res.status(200).end();
            }
        );
    }
);

router.delete("/api/burgers/:id", 
    function(req, res) 
    {
        var id = req.params.id;

        burger.delete("id", id, "=",
            function(result)
            {
                if (!result.affectedRows)
                    return res.status(404).json("Database remains unchanged!  Contanct sytem admin.");

                res.status(200).end();
            }
        );
    }
);

module.exports = router;