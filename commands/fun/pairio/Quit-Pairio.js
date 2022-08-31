module.exports = {
  name: "quit-pairio",
  description: "quit a pairio game, if you are in one.",
  execute: quitGame,
};

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");

const dbHelper = require("../../../DBHelper");
const updateMemberBal = dbHelper.updateMemberBal;

const updatePairioGameStats = dbHelper.updatePairioGameStats;
const getServerStats = dbHelper.getServerStats;

function randomNumber(min, max) {
  // min and max included
  return Math.random() * (max - min) + min;
}

async function quitGame(client, msg, params, _serverDetails, reply = true) {
  const serverDetails = await getServerStats(msg.guild);
  if (
    serverDetails.pairioGame.player1.id != msg.author.id &&
    serverDetails.pairioGame.player2.id != msg.author.id &&
    reply
  ) {
    // msg.reply("You need to be in a game to quit it!");
    msg.react("🚫");

    return false;
  }

  try {
    if (reply) {
      // msg.reply("You have resigned!");
      msg.react("👍");

      let winner =
        serverDetails.pairioGame.player1.id == msg.author.id
          ? serverDetails.pairioGame.player2
          : serverDetails.pairioGame.player1;

      let success = await updateMemberBal(msg.guild, winner.id, 2000);
      if (success) {
        msg.channel.send(`<@${winner.id}>, You received ${2000}💰`);
      } else {
        msg.channel.send(`<@${winner.id}>, Unable to update your balance`);
      }
    }
    let newGameStats = {
      gameID: null,
      player1: {
        id: null,
        name: null,
      },
      player2: {
        id: null,
        name: null,
      },
    };
    let quitStatus = await updatePairioGameStats(msg.guild, newGameStats);
    reply
      ? msg.channel.send(
          `<@${serverDetails.pairioGame.player1.id}> <@${serverDetails.pairioGame.player2.id}>, This game has been trashed!`
        )
      : null;

    return quitStatus;
  } catch (err) {
    console.log(err);
  }
}
