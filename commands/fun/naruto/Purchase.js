const dbHelper = require("../../../DBHelper");
const updateMemberBal = dbHelper.updateMemberBal;
const updateToInventory = dbHelper.updateToInventory;
const Shop = require("./Shop.json");

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

module.exports = {
  name: "add",
  aliases: ["add_to_inventory", "ati", "buy", "purchase"],
  description: `Purchase an itemName and add it to your inventory!`,
  execute: addItem,
};

async function addItem(client, msg, params, serverDetails) {
  const itemName = params[0];
  if (!Shop[itemName]) {
    return msg.reply(
      `That item does not exist! ${animated.ghostconfused.full}`
    );
  }

  const item = Shop[itemName];
  // const member = await getMember(msg.guild, msg.author.id);
  const member = serverDetails.members[msg.author.id];
  const inventory = member.inventory ? member.inventory : {};
  const memberBal = member.bal;

  const alreadyPresentNumber = inventory[itemName] ? inventory[itemName] : 0;

  if (alreadyPresentNumber >= Shop[itemName].max) {
    return msg.reply(`Your storage for ${itemName} is already at its max!`);
  }

  const wantToAdd = !isNaN(params[1]) ? parseInt(params[1]) : 1;
  const number = Math.min(Shop[itemName].max, wantToAdd + alreadyPresentNumber);

  if (wantToAdd <= 0) {
    return msg.reply("Number of items to add must be a natural number!");
  }
  if (item.cost * (number - alreadyPresentNumber) > memberBal) {
    return msg.reply(
      `You don't have enough money to purchase ${
        number - alreadyPresentNumber
      } ${itemName} (${item.cost * (number - alreadyPresentNumber)}${
        animated.coinspin.full
      }).\nCurrent balance: ${memberBal}${animated.coinspin.full}`
    );
  }
  // console.log(item.cost * (number - alreadyPresentNumber) , memberBal);
  let updateBalanceStatus = await updateMemberBal(
    msg.guild,
    msg.author.id,
    -item.cost * (number - alreadyPresentNumber)
  );
  if (!updateBalanceStatus) {
    return msg.reply("Error while deducting money from your bank!");
  }

  let updateStatus = await updateToInventory(
    msg.guild,
    msg.author.id,
    itemName,
    number
  );
  if (updateStatus) {
    msg.reply(
      `Added item! Current stock of ${itemName}: ${number}\nMoney deducted from your wallet: ${
        item.cost * (number - alreadyPresentNumber)
      }${animated.coinspin.full}; Current Balance: ${
        memberBal - item.cost * (number - alreadyPresentNumber)
      }${animated.coinspin.full}`
    );
  } else {
    msg.reply("Error while trying to add item to your inventory.");
  }
}
