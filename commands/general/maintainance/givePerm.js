module.exports = {
  name: "giv_perm",
  aliases: ["gp"],
  description: `Give a member a specific permission!`,
  execute: givPerm,
};

const dbHelper = require("../../../DBHelper");
const givePermission = dbHelper.givePermission;

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");
const prefix = process.env.PREFIX;

const validPermissions = process.env.PERMISSIONS.split(" ");

async function givPerm(client, msg, params, serverDetails) {
  if (!creators.includes(msg.author.id)) {
    return msg.reply(
      "You do not have permission to give people permission to clear messages!"
    );
  }

  const mentioned = msg.mentions.members;
  if (!mentioned.first())
    return msg.reply(
      `You need to mention the user(s) to whom u wanna give clearing permissions.\n\`${prefix} giveperm <PERMISSON> <@member>\``
    );

  const permission = params[0].toUpperCase();
  if (!validPermissions.includes(permission)) {
    return msg.reply(`Invlaid permission string.\nChoose from: [${validPermissions}]`);
  }

  const memberIds = [];

  for (var member of mentioned) {
    memberIds.push(member[0]);
  }

  try {
    await givePermission(msg.guild, memberIds, permission);
    msg.channel.send(
      `${mentioned.map(
        (member) => member.user.username
      )}\nThese members can now have \`${permission}\` permision.`
    );
  } catch (err) {
    console.log(err);
    msg.channel.send("Error");
  }
}
