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
  if (
    (!serverDetails.members[`${msg.author.id}`].permissions ||
      !serverDetails.members[`${msg.author.id}`].permissions.includes(
        "ADD_PFP"
      )) &&
    !creators.includes(msg.author.id)
  ) {
    msg.reply("YOU AINT GOT PERMISSIONS.");
    return;
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
