const Item = require("./Items");
const itemDetails = require("./Shop.json");

const dbHelper = require("../../../DBHelper.js");
const updateNarutoGameStats = dbHelper.updateNarutoGameStats;
const updateToInventory = dbHelper.updateToInventory;
const getServerStats = dbHelper.getServerStats;

module.exports = {
  name: "equip",
  aliases: ["e", "ew"],
  description: "Equip with your self with items in your inventory!",
  execute: equip,
};

async function equip(client, msg, params) {
  const serverDetails = await getServerStats(msg.guild);

  let player;
  let playerRef;
  // validate player
  if (msg.author.id == serverDetails.narutoGame.player1.id) {
    player = serverDetails.narutoGame.player1;
    playerRef = "player1";
  } else if (msg.author.id == serverDetails.narutoGame.player2.id) {
    player = serverDetails.narutoGame.player2;
    playerRef = "player2";
  } else {
    msg.reply("You need to be in a game to use this command!");
    return false;
  }

  if (player.shinobi) {
    msg.react("🚫");
    return false;
  }

  const itemName = params[0];
  // shinobi with that name does not exist
  if (!itemDetails[itemName]) {
    msg.reply("Invalid item name.");
    return false;
  }

  if (
    !serverDetails.members[player.id].inventory ||
    !serverDetails.members[player.id].inventory[itemName] ||
    serverDetails.members[player.id].inventory[itemName] <= 0
  ) {
    // msg.reply(`The item you wanna use is not in your inventory!`);
    msg.react("🚫");
    return false;
  }
  if (
    serverDetails.narutoGame[playerRef].items &&
    serverDetails.narutoGame[playerRef].items.includes(itemName)
  ) {
    // msg.reply("You have already used this item!");
    msg.react("🚫");
    return false;
  }

  //update the inventory of player
  serverDetails.narutoGame[playerRef].items
    ? serverDetails.narutoGame[playerRef].items.push(itemName)
    : (serverDetails.narutoGame[playerRef].items = [itemName]);
  let updateStatus = await updateNarutoGameStats(
    msg.guild,
    serverDetails.narutoGame
  );

  // error while updating
  if (!updateStatus) {
    msg.reply("Internal error while trying to update your game stats.");
    return false;
  }

  updateStatus = await updateToInventory(
    msg.guild,
    msg.author.id,
    itemName,
    serverDetails.members[player.id].inventory[itemName] - 1
  );
  // error while updating
  if (!updateStatus) {
    msg.reply("Internal error while trying to update your inventory.");
    return false;
  }

  //update successful
  msg.reply(`You are now using ${serverDetails.narutoGame[playerRef].items}`);
  return true;
}
