module.exports = {
  name: "bal",
  aliases: ["balance", "wealth"],
  description: "Get you sluggy bank balance!",
  execute: getBal,
};

const dbHelper = require("../../../DBHelper");
const getMember = dbHelper.getMember;

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

async function getBal(client, msg, params, serverDetails) {
  let targetMember = msg.mentions.members.first();
  if (!targetMember) {
    targetMember = msg.author;
  } else {
    targetMember = targetMember.user;
  }

  try {
    let member = await getMember(msg.guild, targetMember.id);
    if (member) {
      return msg.channel.send({
        embed: {
          title: member.userName,
          color: "YELLOW",
          fields: [
            {
              name: "🤑Wealth🤑",
              value: `${member.bal}${animated.coinspin.ful}l`,
            },
          ],
          thumbnail: { url: targetMember.avatarURL() },
        },
      });
    }
    return msg.reply(
      "Provided member has not been registered into the database."
    );
  } catch (err) {
    msg.reply("Internal error while trying to get your balance.");
    console.log(err);
    return false;
  }
}
