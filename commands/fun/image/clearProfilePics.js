module.exports = {
  name: "del_pp",
  aliases: ["clear_pp"],
  description: `Delete all pics of a member!`,
  execute: clearPics,
};

const dbHelper = require("../../../DBHelper");
const clearProfilePics = dbHelper.clearProfilePics;

async function clearPics(client, msg, params, serverDetails) {
  const mentioned = msg.mentions.members.first();
  if (!mentioned)
    return msg.reply(
      "You need to mention the user whose pictures you wanna delete."
    );
  try {
    await clearProfilePics(msg.guild, mentioned.id);
    msg.channel.send("Cleared all pictures!");
    return true;
  } catch (err) {
    console.log(err);
  }
}
