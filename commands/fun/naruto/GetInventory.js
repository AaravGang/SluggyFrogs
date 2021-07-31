module.exports = {
  name: "my-inv",
  aliases: ["my_inv", "inventory", "inv"],
  description: `Get a list of all items in your inventory!`,
  execute: getInventoryEmbed,
};

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;


async function getInventoryEmbed(client, msg, params, serverDetails) {
  let inventoryEmbed = {
    title: "Your inventory",
    description: "List of all items in your inventory",
    color: "#00FFFF",
    fields: [],
  };
  const member = serverDetails.members[msg.author.id];
  const inventory =
    member.inventory && Object.keys(member.inventory).length
      ? member.inventory
      : { "💩": "infinite" };
  for ([itemName, number] of Object.entries(inventory)) {
    inventoryEmbed.fields.push({
      name: `Item Name : ${itemName}`,
      value: `Number: ${number}\nUsage (in game only): \`${prefix} equip ${itemName}\``,
    });
  }

  msg.reply({ embed: inventoryEmbed });
}
