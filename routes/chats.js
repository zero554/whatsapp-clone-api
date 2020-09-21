const express = require("express");
const mongoose = require("mongoose");
const { Chat } = require("../models/chat");

const router = express.Router();

// GETS
router.get("/sync", async (req, res) => {
  const chats = await Chat.find();

  res.status(200).send(chats);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    res.status(500).send("Invalid chat id");

  const chat = await Chat.findById(req.params.id);

  res.status(200).send(chat);
});

router.get("/sync/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const chat = await Chat.findById(id);
    res.status(200).send(chat.messages);
  } catch (e) {
    res.status(500).send("Invalid chat id");
  }
});

// POST
router.post("/new/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const message = req.body;

    const chat = await Chat.findByIdAndUpdate(
      { _id: id },
      { $push: { messages: message } }
    );

    res.status(201).send(message);
  } catch (e) {
    res.status(500).send("Invalid chat id");
  }
});

router.post("/new", async (req, res) => {
  const chat = req.body;
  Chat.create(chat, (error, chat) => {
    if (error) res.status(500).send(error);
    else res.status(201).send(chat);
  });
});

module.exports = router;
