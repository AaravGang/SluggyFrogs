const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

const dbHelper = require("../../../DBHelper.js");
const updatePairioGameStats = dbHelper.updatePairioGameStats;
const BeginGame = require("./BeginGame");
const game = BeginGame.game;

const waitTime = 30;

const errorEmbedTemplate = {
  color: "RED",
  description: `Use \`${prefix} pairio <@whom_you_wanna_play_with>\``,
  footer: {
    text: "Only two people can play. If you provide more than one person in the command, only the first will be considered.",
  },
};

module.exports = {
  name: "pairio",
  description: `Play an awesome ______ game! A grid of images will be sent and deleted shortly after, flex your memory power and earn some sluggy coins!`,
  execute: pairioGame,
};

async function pairioGame(client, msg, params, serverDetails) {
  const guild = msg.guild;
  playerStats = await validatePlayers(
    client,
    guild,
    msg,
    params,
    serverDetails
  );
  if (!playerStats) {
    return;
  }

  const player1 = {
    id: playerStats.player1.id,
    name: playerStats.player1.username,
  };
  const player2 = {
    id: playerStats.player2.id,
    name: playerStats.player2.username,
  };
  const newGameStats = {
    gameID: Date.now(),
    player1: player1,
    player2: player2,
  };

  let updateStatus = await updatePairioGameStats(msg.guild, newGameStats);
  if (!updateStatus) {
    console.log("ERROR WHILE UPDATING GAME STATUS, setup.js");
    return;
  }

  msg.channel.send(
    `Okie, let the clash begin - <@${player1.id}> VS <@${player2.id}>`
  );
  msg.channel.send(
    `Type \`${prefix} quit-pairio\` to quit the game at anytime!( and suffer a great loss )`
  );

  console.log(`Playing Pairio -  ${player1.id} vs ${player1.id}`);

  // START THE GAME

  game(client, msg, newGameStats);

  //set a status
  // client.user.setActivity(`${player1.name} vs ${player2.name}`, {
  //   type: "WATCHING",
  // });
}

async function validatePlayers(client, guild, msg, params, serverDetails) {
  // a game is already on
  if (serverDetails.pairioGame.gameID) {
    msg.reply("There is already a game in progress...");
    return false;
  }

  // no player2 passed
  if (msg.mentions.members.size == 0) {
    msg.channel.send({
      embed: {
        title: "You need someone to play with, dummy!",
        ...errorEmbedTemplate,
      },
    });
    return false;
  }

  let player2 = msg.mentions.members.first();

  // dont let user play with himself
  if (player2.user.id === msg.author.id) {
    msg.channel.send({
      embed: {
        title: "You can't play with yourself. Baka!",
        ...errorEmbedTemplate,
      },
    });
    return false;
  }

  //dont let user play with a bot
  if (player2.user.bot) {
    msg.channel.send({
      embed: {
        title: "Can't play with a bot, you Bot!",
        ...errorEmbedTemplate,
      },
    });
    return false;
  }

  // player2 is offline
  // if (guild.member(player2.id).user.presence.status === "offline") {
  //   msg.channel.send({
  //     embed: {
  //       title: "The person you wanna play with is offline!",
  //       ...errorEmbedTemplate,
  //     },
  //   });
  //   return false;
  // }

  //ASK PLAYER2 IF HE WANTS TO PLAY

  // validated player2
  return { player1: msg.author, player2: player2.user };
}
