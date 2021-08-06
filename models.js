const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const databaseUrl = process.env.MONGODB_SRV;

mongoose
  .connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((data) => {
    console.log("connected to model!");
  })
  .catch((err) => console.log(err));

const serverSchema = new mongoose.Schema({
  serverID: { type: String, require: true, unique: true },
  members: { type: Object },
  narutoGame: {
    type: Object,
    default: {
      player1: {
        id: null,
        name: null,
        shinobi: null,
      },
      player2: {
        id: null,
        name: null,
        shinobi: null,
      },
      gameID: null,
    },
  },
});
const serverModel = mongoose.model("server-models", serverSchema);

const imageSchema = new mongoose.Schema({
  url: { type: String, require: true },
  name: { type: String, require: true, unique: true },
  avatarSize: { type: Number, require: true },
  avatarX: { type: Number, require: true },
  avatarY: { type: Number, require: true },
});

const imageModel = mongoose.model("image-model", imageSchema);

module.exports = {
  serverModel: serverModel,
  imageModel: imageModel,
};
