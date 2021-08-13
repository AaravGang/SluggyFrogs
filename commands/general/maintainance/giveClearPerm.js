module.exports = {
  name: "giv_cc_perm",
  aliases: ["gccp"],
  description: `Give a member permission to clear messages!`,
  execute: givPerm,
};

const dbHelper = require("../../../DBHelper");
const givePermission = dbHelper.givePermission;

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");
const prefix = process.env.PREFIX;

async function givPerm(client, msg, params, serverDetails) {
  if (!creators.includes(msg.author.id)) {
    return msg.reply(
      "You do not have permission to give people permission to clear messages!"
    );
  }

  const mentioned = msg.mentions.members;
  if (!mentioned.first())
    return msg.reply(
      "You need to mention the user(s) to whom u wanna give clearing permissions."
    );

  const memberIds = [];

  for (var member of mentioned) {
    memberIds.push(member[0]);
  }

  try {
    await givePermission(msg.guild, memberIds, "CLEAR_MESSAGES");
    msg.channel.send(
      `${mentioned.map(
        (member) => member.user.username
      )}\nThese members can now clear chats, using \`${prefix} cc <number>\``
    );
  } catch (err) {
    console.log(err);
    msg.channel.send("Error");
  }
}
