const express = require('express');
const router = express.Router(); 
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const Middleware = require('../middleware/middleware');

// Login by providing email and password
router.post("/login", async function (req, res) {
    try {
        if (!req.body.email)
            throw new Error("Email ID cant be empty"); 
        if (!req.body.password)
            throw new Error("Password cant be empty");
        const password_hash = crypto.createHmac('sha256', req.body.password).digest('hex');
        const client = new MongoClient(process.env.MAIN_CLUSTER);
        await client.connect();
        const user = await client.db("group-chat").collection("users").findOne({
            email_id: req.body.email,
            password: password_hash
        });
        if (user == null)
            throw new Error("Ivalid user credentials");
        // set session
        req.session.user_id = user._id.toString().split('"')[0];
        req.session.is_admin = user.is_admin ?? false;
        res.status(200).send("Login Successful")

    } catch (error) {
        res.status(400).send({ error: "User login failed", message: error.message })
    }
})

router.get("/logout", Middleware.isLogged, async function (req, res) {
    try {
        req.session.destroy()
        res.status(200).send("Logout Successful")
    } catch (error) {
        res.status(400).send({ error: "User logout failed", message: e.message })
    }
})

module.exports = router