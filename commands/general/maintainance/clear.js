const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split();

module.exports = {
  name: "clear",
  aliases: ["c", "cc"],
  description: `Clear past 100 messages in a channel!`,
  execute: clearMessages,
};

async function clearMessages(client, msg, params, serverDetails) {
  // if (
  //   !creators.includes(msg.author.id) &&
  //   !msg.member.hasPermission("ADMINISTRATOR")
  // ) {
  //   return msg.reply("You do not have permission to use this command!");
  // }

  if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
    msg.reply("IDIOT ADMIN DIDN'T GIVE ME PERMISSIONS.");
    return;
  }

  let limit = 100;
  if (params[0] && !isNaN(params[0]) && 1 < params[0] < 100) {
    limit = parseInt(params[0]);
  }

  await msg.channel.messages
    .fetch({ limit: limit })
    .then((items) => msg.channel.bulkDelete(items))
    // .then((_) =>
    //   msg.channel.send(`Deleted past ${limit} messages in this channel!`)
    // )
    .catch((e) => msg.reply("ERROR!"));
}
