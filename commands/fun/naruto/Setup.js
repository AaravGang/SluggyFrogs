const shinobisFile = require("./Shinobis");

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

const dbHelper = require("../../../DBHelper.js");
const updateNarutoGameStats = dbHelper.updateNarutoGameStats;

const waitTime = 30;

const errorEmbedTemplate = {
  color: "RED",
  description: `Use \`${prefix} naruto <@whom_you_wanna_play_with>\``,
  footer: {
    text: "Only two people can play. If you provide more than one person in the command, only the first will be considered.",
  },
};

module.exports = {
  name: "play",
  aliases: ["p", "play_naruto", "play-naruto"],
  description: `Play an awesome naruto game!`,
  execute: narutoGame,
};

async function narutoGame(client, msg, params, serverDetails) {
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
    shinobi: null,
    wealth: serverDetails.members[playerStats.player1.id].bal,
  };
  const player2 = {
    id: playerStats.player2.id,
    name: playerStats.player2.username,
    shinobi: null,
    wealth: serverDetails.members[playerStats.player2.id].bal,
  };
  const newGameStats = {
    gameID: Date.now(),
    player1: player1,
    player2: player2,
  };

  let updateStatus = await updateNarutoGameStats(msg.guild, newGameStats);
  if (!updateStatus) {
    console.log("ERROR WHILE UPDATING GAME STATUS, setup.js");
    return;
  }

  msg.channel.send(
    `Okie, let the clash begin - <@${player1.id}> VS <@${player2.id}>`
  );
  msg.channel.send(`Type \`${prefix} quit\` to quit the game at anytime!`);

  //print out the list of shinobisFile players can choose from
  console.log(`Playing ${player1.id} vs ${player1.id}`);
  shinobisFile.execute(client, msg);

  //set a status
  // client.user.setActivity(`${player1.name} vs ${player2.name}`, {
  //   type: "WATCHING",
  // });
}

async function validatePlayers(client, guild, msg, params, serverDetails) {
  // a game is already on
  if (serverDetails.narutoGame.gameID) {
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
  if (guild.member(player2.id).user.presence.status === "offline") {
    msg.channel.send({
      embed: {
        title: "The person you wanna play with is offline!",
        ...errorEmbedTemplate,
      },
    });
    return false;
  }

  //ASK PLAYER2 IF HE WANTS TO PLAY

  // validated player2
  return { player1: msg.author, player2: player2.user };
}
