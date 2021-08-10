const size = 8;
const words = { cat: 2, dog: 2, elephant: 2, monkey: 2 };
const maxTries = 10;
const timeLimit = 30;

const Board = require("./Board").Board;

const Discord = require("discord.js");

function generateBoard(words) {
  return ["apple", "pineapple", "apple", "pineapple"];
}

function filter(msg) {
  return msg.content.match(/^[1-9]+ [1-9]+$/);
}

async function game(client, msg, gameDetails) {
  player1 = gameDetails.player1;
  player2 = gameDetails.player2;
  gameId = gameDetails.gameID;

  players = [player1, player2];
  board = new Board(generateBoard({ apple: 2, pineapple: 2 }));
  let boardBuffer = await board.draw();
  const attachment = new Discord.MessageAttachment(
    boardBuffer,
    "pairio-image.png"
  );

  msg.channel.send(`Guess the stuff...`, attachment);

  for (let player of players) {
    msg.channel.send(`<@${player.id}>, You are up now!`);
    for (let i = 1; i <= maxTries; i++) {
      await msg.channel
        .awaitMessages(filter, {
          max: 1,
          time: timeLimit * 1000,
          errors: ["time"],
        })
        .then(async (collected) => {
          console.log(collected.first());
          msg.channel.send(`You have ${maxTries - i} tries left`);
        })
        .catch(async (collected) => {
          console.log("time limit exceeded");
          msg.channel.send(`time limit exceeded`);
        });
    }
  }
}

module.exports = {
  game: game,
};
