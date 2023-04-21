const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const Middleware = require("../middleware/middleware");

// Get all groups that current logged user is involved
router.get("/", Middleware.isLogged, async function (req, res) {
  try {
    let userId = req.session.user_id;
    const client = new MongoClient(process.env.MAIN_CLUSTER);
    await client.connect();
    const groups_collection = client.db("group-chat").collection("groups");
    const groups = await groups_collection
      .find({
        users: userId,
      })
      .toArray();
    client.close();
    res.status(200).send(groups);
  } catch (e) {
    res.status(502).send({ error: "Failed to get groups", message: e.message });
  }
});

// Create a group
// Pass group name in req.body.name
router.post("/", Middleware.isLogged, async (req, res) => {
  try {
    let userId = req.session.user_id;
    if (!req.body.name) throw new Error("Please provide group name");
    const client = new MongoClient(process.env.MAIN_CLUSTER);
    await client.connect();
    const groups_collection = client.db("group-chat").collection("groups");
    await groups_collection.insertOne({
      name: req.body.name,
      users: [userId],
      created_date: new Date().toISOString(),
    });
    client.close();
    res.status(200).send("Group created succesfully");
  } catch (e) {
    res
      .status(502)
      .send({ error: "Group creation failed", message: e.message });
  }
});

// Add members to the group
// Pass group id and user id you want to add
router.put("/", Middleware.isLogged, async function (req, res) {
  try {
    let userId = req.session.user_id;
    if (!req.body.group_id) throw new Error("Please provide group id");
    if (!req.body.member_id)
      throw new Error("Please provide a member ID you want to add");
    const client = new MongoClient(process.env.MAIN_CLUSTER);
    await client.connect();
    const msg_status = await client
      .db("group-chat")
      .collection("groups")
      .updateOne(
        { _id: ObjectId(req.body.group_id) },
        { $push: { users: req.body.member_id } }
      );
    client.close();
    res.status(200).send(msg_status);
  } catch (e) {
    res
      .status(502)
      .send({ error: "Group updation failed", message: e.message });
  }
});

// Delete group
// Pass group id
router.delete("/", Middleware.isLogged, async (req, res) => {
  try {
    let userId = req.session.user_id;
    if (!req.body.group_id) throw new Error("Please provide group id");
    const client = new MongoClient(process.env.MAIN_CLUSTER);
    await client.connect();
    const groups_collection = await client
      .db("group-chat")
      .collection("groups")
      .deleteOne({ _id: ObjectId(req.body.group_id), users: userId });
    client.close();
    res.status(200).send({
      status: groups_collection,
      message: "Group deleted succesfully",
    });
  } catch (e) {
    res
      .status(502)
      .send({ error: "Group deletion failed", message: e.message });
  }
});

module.exports = router;
