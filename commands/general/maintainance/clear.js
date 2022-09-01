const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split();

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

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

  if (!msg.guild.me.hasPermission("ADMINISTRATOR")) {
    msg.reply("IDIOT ADMIN DIDN'T GIVE ME PERMISSIONS.");
    return;
  }

  // if (creators.includes(msg.author.id)) console.log("yes", msg.author);

  if (
    (!serverDetails.members[`${msg.author.id}`].permissions ||
      !serverDetails.members[`${msg.author.id}`].permissions.includes(
        "CLEAR_MESSAGES"
      )) &&
    !creators.includes(msg.author.id)
  ) {
    // msg.reply("YOU AINT GOT PERMISSIONS.");
    msg.react("🚫")
    msg.react(animated.strechee.full);

    return;
  }

  let limit = 100;
  if (params[0] && !isNaN(params[0]) && 1 < params[0] < 100) {
    limit = parseInt(params[0]);
  }

  await msg.channel.messages
    .fetch({ limit: limit })
    .then((items) => msg.channel.bulkDelete(items))
    .catch((e) => {
      msg.channel.send(
        `ERROR! Can't delete past ${limit} messages, cuz they are too old to bulk delete!\n Specify the number of messages you wanna delete instead - \`cuss cc <number>\``
      );
      console.log(e);
    });
}
