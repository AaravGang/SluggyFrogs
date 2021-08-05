const dbHelper = require("../../../DBHelper");
const getServerStats = dbHelper.getServerStats;

module.exports = {
  name: "rich",
  aliases: ["richest", "rich-order"],
  description: "Find out where you stand in terms of your sluggy coin balance!",
  execute: getRichOrder,
};

const rankEmojis = ["🥇", "🥈", "🥉"];

async function getRichOrder(client, msg, params, serverDetails) {
  let rankEmbed = {
    title: "Sluggy Rich",
    description: "Petition for a better title.",
    color: "GREEN",
    fields: [],
  };

  let ind = 1;
  let authorMentioned = false;
  const rankOrder = Object.entries(serverDetails.members).sort(
    ([, a], [, b]) => b.bal - a.bal
  );

  for ([key, value] of rankOrder) {
    if (ind > 3 && key != msg.author.id) {
      ind++;
      continue;
    }
    let field = {
      name: `${
        rankEmojis[ind - 1] ? rankEmojis[ind - 1] : ind.toString() + ")"
      } ${value.userName}`,
      value: `Wealth: ${value.bal}💰`,
      inline: false,
    };
    if (msg.author.id == value.id) {
      field.name = `***${field.name}***`;
      field.value = `***${field.value}***`;
      authorMentioned = true;
    }

    rankEmbed.fields.push(field);
    ind++;
  }

  msg.channel.send({
    embed: rankEmbed,
  });
}
