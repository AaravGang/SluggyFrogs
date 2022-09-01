const dbHelper = require("../../../DBHelper");
const deleteImage = dbHelper.deleteImage;

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

module.exports = {
  name: "deletei",
  aliases: ["deleteimage", "delete_image"],
  description: `Delete an image from the DB!`,
  execute: deleteImageFromDB,
};

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

async function deleteImageFromDB(client, msg, params, serverDetail) {
  if (!params[0])
    return msg.reply(
      `Did not recieve name of the image you wanna delete. ${emojis.shrekdisgusted.full}`
    );
  await deleteImage(params[0]);
  // msg.reply("Deleted!");
  msg.react("👍");
}
