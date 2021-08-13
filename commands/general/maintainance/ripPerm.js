module.exports = {
  name: "rip_perm",
  aliases: ["rp"],
  description: `Strip a member's permission!`,
  execute: ripClearPerm,
};

const dbHelper = require("../../../DBHelper");
const ripPermission = dbHelper.ripPermission;

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");
const prefix = process.env.PREFIX;

const validPermissions = process.env.PERMISSIONS.split(" ");

async function ripClearPerm(client, msg, params, serverDetails) {
  if (!creators.includes(msg.author.id)) {
    return msg.reply(
      "You do not have permission to rip permissions from people!"
    );
  }

  const mentioned = msg.mentions.members;
  if (!mentioned.first())
    return msg.reply(
      "You need to mention the user(s) whose permission you wanna take away."
    );

  const permission = params[0].toUpperCase();
  if (!validPermissions.includes(permission)) {
    return msg.reply(
      `Invlaid permission string.\nChoose from: [${validPermissions}]`
    );
  }

  const memberIds = [];

  for (var member of mentioned) {
    memberIds.push(member[0]);
  }

  try {
    await ripPermission(msg.guild, memberIds, permission);
    msg.channel.send(
      `${mentioned.map(
        (member) => member.user.username
      )}\nRipped permission \`${permission}\` from above members.`
    );
  } catch (err) {
    console.log(err);
    msg.channel.send("Error");
  }
}