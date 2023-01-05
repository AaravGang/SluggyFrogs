module.exports = {
  name: "add_pp",
  description: `Add a pic of a member!`,
  execute: addPic,
};

const dbHelper = require("../../../DBHelper");
const addProfilePic = dbHelper.addProfilePic;

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

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
    // msg.reply("YOU AINT GOT PERMISSIONS.");
    msg.react("🚫");
    return;
  }

  const mentioned = msg.mentions.members.first();
  if (!mentioned)
    return msg.reply(
      `You need to mention the user whose picture you wanna set. ${emojis.shrekdisgusted.full}`
    );

  if (!msg.attachments.first()) {
    return msg.reply(
      `Did not recieve an attachment.${animated.ghostconfused.full}`
    );
  }
  msg.attachments.array().forEach(async (attachment) => {
    await addProfilePic(msg.guild, mentioned.id, attachment.url);
  });

  try {
    msg.channel.send("Added Picture(s)!");
    return true;
  } catch (err) {
    console.log(err);
  }
}
