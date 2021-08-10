const words = { cat: 2, dog: 2, elephant: 2, monkey: 2 };
const maxTries = 2;
const timeLimit = 30;
const timeTillDelete = 5000;

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

    let i = 0;
    let playerDone = false;

    const filter = async (m) => {
      return (
        m.content.match(/^[0-9]+ [0-9]+$/) &&
        m.author.id == player.id &&
        (await getPairioGameStats(msg.guild)).gameID == gameId
      );
    };

    player.board = new Board(generateBoard({ apple: 2, pineapple: 2 }));

    const attachment = new Discord.MessageAttachment(
      await player.board.draw(),
      "pairio-image.png"
    );

    player.score = 0;

    (await msg.channel.send(`Guess the stuff...`, attachment)).delete({
      timeout: timeTillDelete,
    });

    while (i < maxTries && !playerDone) {
      i++;
      await msg.channel
        .awaitMessages(filter, {
          max: 1,
          time: timeLimit * 1000,
          errors: ["time"],
        })
        .then(async (collected) => {
          let mContent = collected.first().content;
          let givenIndices = mContent.split(" ").map((a) => parseInt(a));
          if (
            player.board.plainBoard[givenIndices[0]] ==
              player.board.plainBoard[givenIndices[1]] &&
            player.board.plainBoard[givenIndices[0]]
          ) {
            if (
              player.board.guessed.includes(
                player.board.plainBoard[givenIndices[0]]
              )
            ) {
              msg.channel.send(`<@${player.id}>, You already guessed that!`);
            } else {
              player.board.guessed.push(
                player.board.plainBoard[givenIndices[0]]
              );

              const attachment = new Discord.MessageAttachment(
                await player.board.draw(),
                "pairio-image.png"
              );
              player.score++;

              (
                await msg.channel.send(`You guessed it right!`, attachment)
              ).delete({ timeout: timeTillDelete });
            }
          } else {
            msg.channel.send(`<@${player.id}>, That aint it!`);
          }

          msg.channel.send(
            `<@${player.id}>, You have ${maxTries - i} tries left`
          );
        })
        .catch(async (err) => {
          console.log(err);
          console.log("time limit exceeded");
          msg.channel.send(`<@${player.id}>, Time limit exceeded!`);
          playerDone = true;
        });
    }

    msg.channel.send(`<@${player.id}>, Your score is ${player.score}`);
  }

  const ranks = players.sort((a, b) => b.score - a.score);
  msg.channel.send(
    `<@${ranks[0].id}>, You have won! (score = ${ranks[0].score})`
  );
}

module.exports = {
  game: game,
};
