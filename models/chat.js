const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  name: String,
  message: String,
  timestamp: Date,
});

const chatSchema = mongoose.Schema({
  name: String,
  messages: [messageSchema],
});

const Chat = mongoose.model("chats", chatSchema);

module.exports.Chat = Chat;
