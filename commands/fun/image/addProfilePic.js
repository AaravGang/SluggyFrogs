module.exports = {
  name: "add_pp",
  description: `Add a pic of a member!`,
  execute: addPic,
};

const dbHelper = require("../../../DBHelper");
const addProfilePic = dbHelper.addProfilePic;
const getProfilePics = dbHelper.getProfilePics;

async function addPic(client, msg, params, serverDetails) {
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
