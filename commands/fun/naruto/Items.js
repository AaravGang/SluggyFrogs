const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

class Item {
  constructor({
    name,
    commandName,
    max,
    cost,
    healthBoost,
    chakraBoost,
    powerBoost,
  }) {
    this.name = name;
    this.commandName = commandName;
    this.max = max;
    this.cost = cost;
    this.healthBoost = healthBoost;
    this.chakraBoost = chakraBoost;
    this.powerBoost = powerBoost;
  }
  use(shinobi) {
    shinobi.health += this.healthBoost;
    shinobi.chakraBoost += this.chakraBoost;
    shinobi.powerBoost += this.powerBoost;
  }
  getDetailsForEmbed() {
    return `Name: ${this.name}\n\nCommand Name: ${this.commandName}\n\nMax Storage: ${this.max}\n\nCost: ${this.cost}\n\nHealth Boost: ${this.healthBoost}\n\nChakra Boost: ${this.chakraBoost}\n\nPower Boost: ${this.powerBoost}`;
  }
}

const itemDetails = require("./Shop.json");

const items = {};
for ([key, value] of Object.entries(itemDetails)) {
  items[key] = new Item(value);
}

async function getItemsDetails(client, msg, params = null) {
  const itemsListEmbed = {
    color: "BLUE",
    title: "Choose your item(s)!",
    fields: [],
  };

  for (let [itemKey, item] of Object.entries(items)) {
    itemsListEmbed.fields.push({
      name: item.name,
      value: `Use \`${prefix} add ${item.commandName}\` | [hover for details](${
        msg.url
      } "${item.getDetailsForEmbed()}")`,
      inline: false,
    });
  }
  await msg.channel.send({ embed: itemsListEmbed });
}

module.exports = {
  name: "shop",
  aliases: ["equip-opts", "e-o", "e-opts", "equip-options"],
  description: "Equip yourself with some power items!",
  execute: getItemsDetails,
  // itemDetails: itemDetails,
  Item: Item,
};
