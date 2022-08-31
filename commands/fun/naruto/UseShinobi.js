const Shinobis = require("./Shinobis");
const shinobiDetails = Shinobis.shinobiDetails;
const rankOrder = Shinobis.rankOrder;

const beginGame = require("./BeginGame").beginGame;

const dbHelper = require("../../../DBHelper.js");
const updateNarutoGameStats = dbHelper.updateNarutoGameStats;
const updateMemberBal = dbHelper.updateMemberBal;
const getServerStats = dbHelper.getServerStats;
const updateMemberPrevShinobi = dbHelper.updateMemberPrevShinobi;

module.exports = {
  name: "hire",
  description: "hire a shinobi",
  execute: hireShinobi,
};

async function hireShinobi(client, msg, params) {
  const serverDetails = await getServerStats(msg.guild);

  let player;
  let playerRef;
  let opponent;
  let opponentRef;
  // validate player
  if (msg.author.id == serverDetails.narutoGame.player1.id) {
    player = serverDetails.narutoGame.player1;
    playerRef = "player1";
    opponent = serverDetails.narutoGame.player2;
    opponentRef = "player2";
  } else if (msg.author.id == serverDetails.narutoGame.player2.id) {
    player = serverDetails.narutoGame.player2;
    playerRef = "player2";
    opponent = serverDetails.narutoGame.player1;
    opponentRef = "player1";
  } else {
    // msg.reply("You need to be in a game to use this command!");
    msg.react("🚫");
    return false;
  }

  if (player.shinobi) {
    // msg.reply("You have already chosen your character!");
    msg.react("🚫");
    return false;
  }

  const shinobiName = params[0];
  // shinobi with that name does not exist
  if (!shinobiDetails[shinobiName]) {
    msg.reply("Invalid shinobi name.");
    msg.react("🚫");
    Shinobis.execute(client, msg);
    return false;
  }

  //opponent has already chosen that shinobi
  if (opponent.shinobi === shinobiName) {
    msg.reply(
      `${shinobiName} has already been hired. Choose any other shinobi`
    );
    msg.react("🚫");
    return false;
  }

  if (
    opponent.shinobi &&
    rankOrder.indexOf(shinobiDetails[shinobiName].rank) >
      rankOrder.indexOf(shinobiDetails[opponent.shinobi].rank)
  ) {
    msg.reply(
      `Play a fair game!\nAvailable ranks: ${rankOrder.slice(
        0,
        rankOrder.indexOf(shinobiDetails[opponent.shinobi].rank) + 1
      )} `
    );
    return false;
  }
  if (serverDetails.members[player.id].prevShinobi == shinobiName) {
    msg.reply(`You hired ${shinobiName} previously and now they want a break.`);
    return false;
  }

  if (serverDetails.members[player.id].bal < shinobiDetails[shinobiName].fees) {
    msg.reply(`You don't have enough money to hire ${shinobiName} 😢`);
    return false;
  }

  // update players balance
  let updateStatus = await updateMemberBal(
    msg.guild,
    player.id,
    -shinobiDetails[shinobiName].fees
  );

  // error while updating
  if (!updateStatus) {
    msg.reply("Internal error while trying to update your wealth.");
    return false;
  }

  //update the shinobi of player
  serverDetails.narutoGame[playerRef].shinobi = shinobiName;
  updateStatus = await updateNarutoGameStats(
    msg.guild,
    serverDetails.narutoGame
  );

  // error while updating
  if (!updateStatus) {
    msg.reply("Internal error while trying to update your shinobi.");
    return false;
  }
  updateStaus = await updateMemberPrevShinobi(
    msg.guild,
    msg.author.id,
    shinobiName
  );

  if (!updateStatus) {
    msg.reply("Internal error while trying to update your previous shinobi.");
    return false;
  }

  //update successful
  // msg.reply(`Set your shinobi to ${shinobiName}`);
  msg.react("👍");
  if (
    serverDetails.narutoGame.player1.shinobi &&
    serverDetails.narutoGame.player2.shinobi
  ) {
    // both players have chosen a shinobi, begin game
    return beginGame(client, msg, serverDetails);
  }
  return true;
}
