module.exports = {
  name: "get_perm",
  aliases: ["perm", "permissions", "perms", "get_perms"],
  description: `Give a member a specific permission!`,
  execute: givPerm,
};

const dbHelper = require("../../../DBHelper");

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");
const prefix = process.env.PREFIX;

async function givPerm(client, msg, params, serverDetails) {
  const mentioned = msg.mentions.members;
  const memberIds = [];
  if (!mentioned.first()) memberIds.push(msg.author.id);

  const allMemberIds = Object.keys(serverDetails.members);

  for (var member of mentioned) {
    if (allMemberIds.includes(member[0])) {
      memberIds.push(member[0]);
    }
  }

  if (memberIds.length == 0) {
    return msg.reply("The mentioned user(s) are not in the data base.");
  }

  try {
    const permEmbed = {
      title: "Sluggy Permissons",
      description: "Permissions mentioned users have.",
      color: "YELLOW",
      fields: [],
    };
    const members = serverDetails.members;
    for (let id of memberIds) {
      console.log(members[id]);
      permEmbed.fields.push({
        name: members[id].userName,
        value: `PERMISSIONS: \`${
          members[id].permissions && members[id].permissions.length
            ? members[id].permissions
            : "None"
        }\``,
      });
    }
    console.log(permEmbed);
    msg.channel.send({ embed: permEmbed });
  } catch (err) {
    console.log(err);
    msg.channel.send("Error");
  }
}
