module.exports = {
  name: "quit",
  description: "quit a game, if you are in one.",
  execute: quitGame,
};

const dbHelper = require("../../../DBHelper");
const updateMembersBal = dbHelper.updateMembersBal;

const updateNarutoGameStats = dbHelper.updateNarutoGameStats;

async function quitGame(client, msg, params, serverDetails, reply = true) {
  if (
    serverDetails.narutoGame.player1.id != msg.author.id &&
    serverDetails.narutoGame.player2.id != msg.author.id
  ) {
    reply ? msg.reply("You need to be in a game to quit it!") : null;
    return false;
  }

  try {
    if (
      serverDetails.narutoGame.player1.shinobi &&
      serverDetails.narutoGame.player2.shinobi &&
      reply
    ) {
      msg.reply("You have resigned!");
      let winnerId =
        serverDetails.narutoGame.player1.id == msg.author.id
          ? serverDetails.narutoGame.player2.id
          : serverDetails.narutoGame.player1.id;
      let payload = {};
      let winAmt = 1500;
      payload[winnerId] = winAmt;
      let updateStatus = await updateMembersBal(msg.guild, payload);
      if (updateStatus) {
        msg.channel.send(`<@${winnerId}>, You have won ${winAmt}💰`);
      } else {
        console.log(
          "unable to update money of winner when some one quit the game."
        );
      }
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
