module.exports = {
  name: "add_pp",
  description: `Add a pic of a member!`,
  execute: addPic,
};

const dbHelper = require("../../../DBHelper");
const addProfilePic = dbHelper.addProfilePic;

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");

async function addPic(client, msg, params, serverDetails) {
  if (!creators.include(msg.author.id)) {
    return msg.reply("You do not have permission to add profile pics!");
  }

  const imageLink = msg.attachments.first()
    ? msg.attachments.first().proxyURL
    : null;
  if (!imageLink) return msg.reply("Did not recieve an attachment.");

  const mentioned = msg.mentions.members.first();
  if (!mentioned)
    return msg.reply(
      "You need to mention the user whose picture you wanna set."
    );

  try {
    await addProfilePic(msg.guild, mentioned.id, imageLink);
    msg.channel.send("Added Picture!");
    return true;
  } catch (err) {
    console.log(err);
  }
}
