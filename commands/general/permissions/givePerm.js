module.exports = {
  name: "give_perm",
  aliases: ["gp", "giv_perm"],
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
    return msg.reply("You do not have permission to give people permissions!");
  }

  const mentioned = msg.mentions.members;
  if (!mentioned.first())
    return msg.reply(
      `You need to mention the user(s) to whom u wanna give a permission.\n\`${prefix} give_perm <PERMISSON> <@member>\``
    );

  const permission = params[0].toUpperCase();
  if (!validPermissions.includes(permission)) {
    return msg.reply(
      `Invlaid permission string.\nChoose from: [${validPermissions}]`
    );
  }

  const memberIds = [];
  const allMemberIds = Object.keys(serverDetails.members);

  for (var member of mentioned) {
    if (allMemberIds.includes(member[0])) {
      memberIds.push(member[0]);
    }
  }

  if (memberIds.length == 0) {
    return msg.reply("The mentioned user are not in the data base.");
  }

  try {
    await givePermission(msg.guild, memberIds, permission);
    msg.channel.send(
      `${mentioned.map(
        (member) => member.user.username
      )}\nThese members now have \`${permission}\` permission.`
    );
  } catch (err) {
    console.log(err);
    msg.channel.send("Error");
  }
}
