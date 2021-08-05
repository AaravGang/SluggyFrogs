const dbHelper = require("../../../DBHelper");
const getServerStats = dbHelper.getServerStats;

module.exports = {
  name: "rich",
  aliases: ["richest", "rich-order"],
  description: "Find out where you stand in terms of your sluggy coin balance!",
  execute: getRichOrder,
};

async function getRichOrder(client, msg, params, serverDetails) {
  let rankEmbed = {
    title: "Sluggy Rich",
    description: "Petition for a better title.",
    color: "GREEN",
    fields: [],
  };

  let ind = 1;

  for ([key, value] of Object.entries(serverDetails.members).sort(
    ([, a], [, b]) => b.bal - a.bal
  )) {
    let field = {
      name: `${ind}) ${value.userName}`,
      value: `Wealth: ${value.bal}💰`,
    };
    if (msg.author.id == value.id) {
      field.name = `***${field.name}***`;
      field.value = `***${field.value}***`;
    }

    rankEmbed.fields.push(field);
    ind++;
  }

  msg.channel.send({
    embed: rankEmbed,
  });
}
