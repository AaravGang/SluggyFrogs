const words = [
  "apple",
  "orange",
  "pineapple",
  "banana",
  "grape",
  "tomato",
  "pear",
  "balls",
];
const maxTries = 10;
const timeLimit = 30;
const timeTillDelete = 5000;
const winBonus = 2000;
const rewardPerPoint = 500;

const Discord = require("discord.js");

const Board = require("./Board").Board;

const dbHelper = require("../../../DBHelper");
const getPairioGameStats = dbHelper.getPairioGameStats;
const updateMembersBal = dbHelper.updateMembersBal;

const quitGame = require("./Quit-Pairio").execute;

function generateBoard(words) {
  var board = words.concat(words);
  for (let i = 0; i < board.length; i++) {
    let randomInd = Math.floor(Math.random() * board.length);
    let temp = board[i];
    board[i] = board[randomInd];
    board[randomInd] = temp;
  }
  return board;
}

async function game(client, msg, gameDetails) {
  const player1 = gameDetails.player1;
  const player2 = gameDetails.player2;
  const gameId = gameDetails.gameID;
  console.log(gameId);

  const players = [player1, player2];

  for (let player of players) {
    if ((await getPairioGameStats(msg.guild)).gameID != gameId) return;
    msg.channel.send(`<@${player.id}>, You are up now!`);

    let i = 0;
    let playerDone = false;

    const filter = async (m) => {
      return (
        m.content.match(/^[1-9]+ [1-9]+$/) &&
        m.author.id == player.id &&
        (await getPairioGameStats(msg.guild)).gameID == gameId
      );
    };

    player.board = new Board(generateBoard(words));

    let attachment = new Discord.MessageAttachment(
      await player.board.draw("all"),
      "pairio-image.png"
    );

    player.score = 0;

    await (
      await msg.channel.send(
        `Hardwire the stuff into your brain...`,
        attachment
      )
    ).delete({
      timeout: 3000,
    });
    attachment = new Discord.MessageAttachment(
      await player.board.draw(),
      "pairio-image.png"
    );
    await msg.channel.send(
      "Start guessing! Type the indices of two images that you think are the same, separated by a space.",
      attachment
    );

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
          let givenIndices = mContent.split(" ").map((a) => parseInt(a) - 1);
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
              let attachment = new Discord.MessageAttachment(
                await player.board.draw(givenIndices),
                "pairio-image.png"
              );
              (
                await msg.channel.send(
                  `<@${player.id}>, You already guessed that!`,
                  attachment
                )
              ).delete({ timeout: timeTillDelete });
            } else {
              player.board.guessed.push(
                player.board.plainBoard[givenIndices[0]]
              );

              let attachment = new Discord.MessageAttachment(
                await player.board.draw(givenIndices),
                "pairio-image.png"
              );
              player.score++;

              (
                await msg.channel.send(`You guessed it right!`, attachment)
              ).delete({ timeout: timeTillDelete });
            }
          } else {
            let attachment = new Discord.MessageAttachment(
              await player.board.draw(givenIndices),
              "pairio-image.png"
            );
            (
              await msg.channel.send(
                `<@${player.id}>, That aint it!`,
                attachment
              )
            ).delete({ timeout: timeTillDelete });
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

  if ((await getPairioGameStats(msg.guild)).gameID != gameId) {
    return;
  }

  await handleGameOver(msg, player1, player2);
  await quitGame(client, msg, null, null, false);
}

async function handleGameOver(msg, player1, player2) {
  let winner;
  let loser;
  if (player1.score > player2.score) {
    winner = player1;
    loser = player2;
  } else if (player1.score < player2.score) {
    winner = player2;
    loser = player1;
  } else {
    // tie
    let success = await updateBal(
      msg,
      player1,
      player1.score * rewardPerPoint,
      player2,
      player2Reward.score * rewardPerPoint
    );
    if (success) {
      await msg.channel.send("This game was tied!");
      msg.channel.send(
        `<@${player1.id}>, You received ${
          player1.score * rewardPerPoint
        }💰\n<@${player2.id}>, You received ${player2.score * rewardPerPoint}💰`
      );
    }
  }
  let winnerAmount = winner.score * rewardPerPoint + winBonus;
  let loserAmount = (loser.score * rewardPerPoint) / 2;
  let success = await updateBal(msg, winner, winnerAmount, loser, loserAmount);
  if (success) {
    await msg.channel.send(`<@${winner.id}>, You have won!`);
    msg.channel.send(
      `<@${winner.id}>, You won ${winnerAmount}💰\n<@${loser.id}>, You received ${loserAmount}💰`
    );
  }
}

async function updateBal(msg, player1, player1Reward, player2, player2Reward) {
  const payload = {};
  payload[player1.id] = player1Reward;
  payload[player2.id] = player2Reward;
  let success = await updateMembersBal(msg.guild, payload);
  return success;
}

module.exports = {
  game: game,
};
