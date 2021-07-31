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

const jutsuSchema = new mongoose.Schema({
  name: { type: String, require: true, unique: true },
  commandName: { type: String, require: true, unique: true },
  power: { type: Number, require: true },
  chakra: { type: Number, require: true },
  type: { type: String, require: true },
  description: { type: String, require: true },
  jutsuBranches: { type: Array, require: true },
  usageLeft: { type: Number, require: true },
});

const jutsuModel = mongoose.model("jutsu-models", jutsuSchema);

const chakraTypeSchema = new mongoose.Schema({
  name: { type: String, require: true },
  dominantOver: { type: Array },
});

const chakraTypesModel = mongoose.model(
  "chakra-types-models",
  chakraTypeSchema
);

module.exports = {
  serverModel: serverModel,
  jutsuModel: jutsuModel,
  jutsuSchema: jutsuSchema,
  chakraTypeSchema: chakraTypeSchema,
  chakraTypesModel: chakraTypesModel,
};








// chakraTypesModel
//   .create([
//     { name: "fire", dominantOver: ["wind"] },
//     { name: "water", dominantOver: ["fire", "lava"] },
//     { name: "wind", dominantOver: ["lightning"] },
//     { name: "lightning", dominantOver: ["water"] },
//     { name: "earth", dominantOver: ["water", "lightning"] },
//     {
//       name: "normal",
//       dominantOver: [
//         "fire",
//         "water",
//         "wind",
//         "lightning",
//         "earth",
//         "normal",
//         "wood",
//         "poison",
//       ],
//     },
//     { name: "wood", dominantOver: ["wind", "earth", "water", "normal"] },
//     {
//       name: "poison",
//       dominantOver: ["fire", "water", "wind", "lightning", "normal", "wood"],
//     },
//     { name: "healing", dominantOver: [] },
//     { name: "genjutsu", dominantOver: [] },
//   ])
//   .then((a) => console.log(a));

