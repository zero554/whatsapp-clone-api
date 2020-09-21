// imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const chats = require("./routes/chats");

const Pusher = require("pusher");

// app config
const app = express();
const PORT = process.env.PORT || 3001;

const pusher = new Pusher({
  appId: "1072553",
  key: "2cee973e5d67526ed990",
  secret: "d60866e8c4dfa9d06a65",
  cluster: "eu",
  encrypted: true,
});

// db config
mongoose
  .connect(
    "mongodb+srv://zolotov:XfWW3FpepYqQNKbL@blanktechproject01-ht8w9.mongodb.net/real-time-chat-db?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("Connected to mongoDB."))
  .catch((err) => console.log(err));

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connection established.");

  const chatsCollection = db.collection("chats");

  const changeStream = chatsCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "update") {
      let messageDetails = Object.values(
        change.updateDescription.updatedFields
      )[0];

      const { name, message, timestamp } = messageDetails;

      pusher.trigger("messages", "update", {
        name: name,
        message: message,
        timestamp: timestamp,
      });
    } else if (change.operationType === "insert") {
      let chatDetails = change.fullDocument;

      const { _id, name } = chatDetails;
      pusher.trigger("messages", "insert", {
        _id: _id,
        name: name,
      });
    } else {
      console.log(change.operationType);
      console.log("Error triggering pusher.");
    }
  });
});

// middleware
app.use(cors());
app.use(express.json());
app.use("/chats", chats);

// listen
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
