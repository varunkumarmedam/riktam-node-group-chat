const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const Middleware = require("../middleware/middleware");

// Send message to a group
// Expects group id and message
router.post("/", Middleware.isLogged, async (req, res) => {
  try {
    let userId = req.session.user_id;
    if (!req.body.group_id) throw new Error("Please provide group id");
    if (!req.body.message) throw new Error("Message cant be empty");
    const client = new MongoClient(process.env.MAIN_CLUSTER);
    await client.connect();
    const msg_status = await client
      .db("group-chat")
      .collection("groups")
      .updateOne(
        { _id: new ObjectId(req.body.group_id), users: userId },
        {
          $push: {
            chat: {
              id: Date.now(),
              user_id: userId,
              message: req.body.message,
            },
          },
        }
      );
    client.close();
    res.status(200).send(msg_status);
  } catch (e) {
    res
      .status(502)
      .send({ error: "Posting Message failed", message: e.message });
  }
});

// Add a like to a message in a group
// Expects group id and message id
router.post("/like", Middleware.isLogged, async (req, res) => {
  try {
    let userId = req.session.user_id;
    if (!req.body.group_id) throw new Error("Please provide group id");
    if (!req.body.message_id) throw new Error("Message cant be empty");
    const client = new MongoClient(process.env.MAIN_CLUSTER);
    await client.connect();
    let likes = [userId];
    const msg_status = await client
      .db("group-chat")
      .collection("groups")
      .updateMany(
        {
          _id: new ObjectId(req.body.group_id),
          users: userId,
          "chat.id": req.body.message_id,
        },
        // [{
        //     $set: {
        //         likes: {
        //             $setUnion: "$likes"
        //         }
        //     }
        // }]       // Makes like array to act as Set
        {
          $set: {
            "chat.$.likes": [userId],
          },
        }
      );
    client.close();
    res.status(200).send(msg_status);
  } catch (e) {
    res
      .status(502)
      .send({ error: "Posting Message failed", message: e.message });
  }
});

module.exports = router;
