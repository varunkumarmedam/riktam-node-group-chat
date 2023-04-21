const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const crypto = require("crypto");
const Middleware = require("../middleware/middleware");

// Creates a normal user and admin
// Pass user name, email and password to create
// Optionally pass admin previlage
router.post(
  "/",
  Middleware.isLogged,
  Middleware.isAdmin,
  async function (req, res) {
    try {
      if (!req.body.name) throw new Error("Username cant be empty");
      if (!req.body.email) throw new Error("Email ID cant be empty");
      if (!req.body.password) throw new Error("Password cant be empty");
      const password_hash = crypto
        .createHmac("sha256", req.body.password)
        .digest("hex");

      const client = new MongoClient(process.env.MAIN_CLUSTER);
      await client.connect();
      const users_collection = client.db("group-chat").collection("users");
      await users_collection.insertOne({
        name: req.body.name,
        email_id: req.body.email,
        password: password_hash,
        created_date: new Date().toISOString(),
        is_admin: req.body.is_admin ?? false,
      });
      client.close();
      res.status(200).send("User created").statusCode(200);
    } catch (e) {
      res
        .status(502)
        .send({ error: "User creation failed", message: e.message });
    }
  }
);

// Update user details
router.put(
  "/",
  Middleware.isLogged,
  Middleware.isAdmin,
  async function (req, res) {
    try {
      const obj = {};
      if (!req.body.id) throw new Error("User id cant be empty");
      if (req.body.email) obj.email_id = req.body.email;
      if (req.body.name) obj.name = req.body.name;
      const client = new MongoClient(process.env.MAIN_CLUSTER);
      await client.connect();
      const user_status = await client
        .db("group-chat")
        .collection("users")
        .updateOne({ _id: ObjectId(req.body.id) }, { $set: obj });
      if (!user_status) throw new Error("Cant update the given details");
      client.close();
      res.status(200).send(users_collection);
    } catch (e) {
      res.status(502).send({ error: "User update failed", message: e.message });
    }
  }
);

module.exports = router;
