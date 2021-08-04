module.exports = {
  name: "quit",
  description: "quit a game, if you are in one.",
  execute: quitGame,
};

const dotenv = require("dotenv");
dotenv.config();
const creators = process.env.CREATOR_IDS.split(" ");

const dbHelper = require("../../../DBHelper");
const updateMembersBal = dbHelper.updateMembersBal;

const updateNarutoGameStats = dbHelper.updateNarutoGameStats;
const ShinobisJson = require("./Shinobis.json");

function randomNumber(min, max) {
  // min and max included
  return Math.random() * (max - min) + min;
}

async function quitGame(client, msg, params, serverDetails, reply = true) {
  if (
    serverDetails.narutoGame.player1.id != msg.author.id &&
    serverDetails.narutoGame.player2.id != msg.author.id &&
    !creators.includes(msg.author.id)
  ) {
    reply ? msg.reply("You need to be in a game to quit it!") : null;
    return false;
  }

  try {
    if (
      serverDetails.narutoGame.player1.shinobi &&
      serverDetails.narutoGame.player2.shinobi &&
      reply &&
      !creators.includes(msg.author.id)
    ) {
      msg.reply("You have resigned!");
      let winner =
        serverDetails.narutoGame.player1.id == msg.author.id
          ? serverDetails.narutoGame.player2
          : serverDetails.narutoGame.player1;
      console.log(serverDetails.narutoGame);
      let payload = {};
      let winAmt = Math.floor(
        randomNumber(2.5, 4.5) * ShinobisJson[winner.shinobi].fees
      );

      payload[winner.id] = winAmt;

      let updateStatus = await updateMembersBal(msg.guild, payload);
      if (updateStatus) {
        msg.channel.send(`<@${winner.id}>, You have won ${winAmt}💰`);
      } else {
        console.log(
          "unable to update money of winner when someone quit the game."
        );
      }
    } else if (
      serverDetails.narutoGame.player1.shinobi ||
      serverDetails.narutoGame.player2.shinobi
    ) {
      let playerWhoHired = serverDetails.narutoGame.player1.shinobi
        ? serverDetails.narutoGame.player1
        : serverDetails.narutoGame.player2;
      let payload = {};
      payload[playerWhoHired.id] = ShinobisJson[playerWhoHired.shinobi].fees;
      await updateMembersBal(msg.guild, payload);
      msg.channel.send(
        `<@${playerWhoHired.id}>, Your money was refunded (${
          ShinobisJson[playerWhoHired.shinobi].fees
        })`
      );
    }

    let newGameStats = {
      gameID: null,
      player1: {
        id: null,
        name: null,
        shinobi: null,
        wealth: null,
      },
      player2: {
        id: null,
        name: null,
        shinobi: null,
        wealth: null,
      },
    };
    let quitStatus = await updateNarutoGameStats(msg.guild, newGameStats);
    reply
      ? msg.channel.send(
          `<@${serverDetails.narutoGame.player1.id}> <@${serverDetails.narutoGame.player2.id}>, This game has been trashed!`
        )
      : null;
    client.user.setActivity(`cuss😂`, {
      type: "LISTENING",
    });
    return quitStatus;
  } catch (err) {
    console.log(err);
  }
}
