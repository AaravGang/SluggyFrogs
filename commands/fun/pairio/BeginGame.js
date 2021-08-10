const words = { cat: 2, dog: 2, elephant: 2, monkey: 2 };
const maxTries = 2;
const timeLimit = 30;

const Board = require("./Board").Board;

const dbHelper = require("../../../DBHelper");
const getPairioGameStats = dbHelper.getPairioGameStats;

const Discord = require("discord.js");

function generateBoard(words) {
  return ["apple", "pineapple", "apple", "pineapple"];
}

async function game(client, msg, gameDetails) {
  const player1 = gameDetails.player1;
  const player2 = gameDetails.player2;
  const gameId = gameDetails.gameID;
  console.log(gameId);

  const players = [player1, player2];

  for (let player of players) {
    msg.channel.send(`<@${player.id}>, You are up now!`);
    let i = 1;
    let playerDone = false;
    const filter = async (m) => {
      console.log(
        m.content.match(/^[0-9]+ [0-9]+$/),
        m.author.id == player.id,
        (await getPairioGameStats(msg.guild)).gameID == gameId
      );
      return (
        m.content.match(/^[0-9]+ [0-9]+$/) &&
        m.author.id == player.id &&
        (await getPairioGameStats.gameID) == gameId
      );
    };
    board = new Board(generateBoard({ apple: 2, pineapple: 2 }));

    const attachment = new Discord.MessageAttachment(
      await board.draw(),
      "pairio-image.png"
    );

    await msg.channel.send(`Guess the stuff...`, attachment);
    while (i < maxTries && !playerDone) {
      await msg.channel
        .awaitMessages(filter, {
          max: 1,
          time: timeLimit * 1000,
          errors: ["time"],
        })
        .then(async (collected) => {
          let mContent = collected.first().content;
          let givenIndices = mContent.split(" ").map((a) => parseInt(a));
          console.log("given indiced:", givenIndices);
          if (
            board.plainBoard[givenIndices[0]] ==
              board.plainBoard[givenIndices[1]] &&
            board.plainBoard[givenIndices[0]]
          ) {
            board.guessed.push(board.plainBoard[givenIndices[0]]);

            const attachment = new Discord.MessageAttachment(
              await board.draw(),
              "pairio-image.png"
            );

            await msg.channel.send(`You guessed it right!`, attachment);
          }
          msg.channel.send(`You have ${maxTries - i} tries left`);
        })
        .catch(async (collected) => {
          console.log("time limit exceeded");
          msg.channel.send(`time limit exceeded`);
          playerDone = true;
        });
      i--;
    }
  }
}

module.exports = {
  game: game,
};
