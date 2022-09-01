// PUT SHIINBIS AND JUTSUS AND SHOP IN DB
// PASS IN AS PARAMETER WHERE NEEDED

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX;

const helper = require("./helper");

const dbHelper = require("../../../DBHelper");
const updateMembersBal = dbHelper.updateMembersBal;
const getServerStats = dbHelper.getServerStats;
const getNarutoGameStats = dbHelper.getNarutoGameStats;

const emojisJson = require("../../../emojis.json");
const emojis = emojisJson.emojis;
const animated = emojisJson.animated;

const Shinobis = require("./Shinobis");
const Shinobi = Shinobis.Shinobi;
const shinobiDetails = Shinobis.shinobiDetails;
const rankOrder = Shinobis.rankOrder;

const Jutsus = require("./Jutsus").jutsus;

const Shop = require("./Shop.json");

const quitGame = require("./Quit").execute;

const rankDiffWinPay = 1000;
const rankDiffLoosePay = 500;

const timeLimit = 60;
const skipChakraInc = 10;
module.exports = {
  beginGame: beginGame,
};
var canPlay = 2;

async function beginGame(client, msg, serverDetails) {
  var serverStats = serverDetails;
  const gameStats = serverStats.narutoGame;
  const gameID = gameStats.gameID;
  const player1Items = serverDetails.narutoGame["player1"].items
    ? serverDetails.narutoGame["player1"].items
    : [];

  const player2Items = serverDetails.narutoGame["player2"].items
    ? serverDetails.narutoGame["player2"].items
    : [];
  let player1HealthBoosts = 0;
  let player1ChakraBoosts = 0;
  let player1PowerBoosts = 0;
  let player2HealthBoosts = 0;
  let player2ChakraBoosts = 0;
  let player2PowerBoosts = 0;
  for (let item of player1Items) {
    player1HealthBoosts += Shop[item].healthBoost;
    player1ChakraBoosts += Shop[item].chakraBoost;
    player1PowerBoosts += Shop[item].powerBoost;
  }
  for (let item of player2Items) {
    player2HealthBoosts += Shop[item].healthBoost;
    player2ChakraBoosts += Shop[item].chakraBoost;
    player2PowerBoosts += Shop[item].powerBoost;
  }

  const player1 = {
    id: gameStats.player1.id,
    name: gameStats.player1.name,
    shinobiName: gameStats.player1.shinobi,
    shinobi: new Shinobi(
      shinobiDetails[gameStats.player1.shinobi],
      player1HealthBoosts,
      player1ChakraBoosts,
      player1PowerBoosts
    ),
    currentJutsu: null,
  };
  const player2 = {
    id: gameStats.player2.id,
    name: gameStats.player2.name,
    shinobiName: gameStats.player2.shinobi,
    shinobi: new Shinobi(
      shinobiDetails[gameStats.player2.shinobi],
      player2HealthBoosts,
      player2ChakraBoosts,
      player2PowerBoosts
    ),
    currentJutsu: null,
  };

  var firstPlayer;

  const filter = async (message) => {
    let content = message.content.toLowerCase();
    if (!content.startsWith("use")) {
      return false;
    }

    let jutsuName = content
      .trim()
      .split(" ")
      .filter((item) => item)[1];

    if (message.author.id === player1.id) {
      if (await setPlayerJutsu(message, player1, jutsuName, gameID)) {
        if (!firstPlayer) firstPlayer = player1;
        return true;
      }
      return false;
    } else if (message.author.id === player2.id) {
      if (await setPlayerJutsu(message, player2, jutsuName, gameID)) {
        if (!firstPlayer) firstPlayer = player2;
        return true;
      }
      return false;
    }
  };

  var preMessages;

  while (
    player1.shinobi.health > 0 &&
    player2.shinobi.health > 0 &&
    player1.shinobi.chakra > 0 &&
    player2.shinobi.chakra > 0
  ) {
    if (preMessages && preMessages.length) {
      for (let preMessage of preMessages) {
        preMessage.delete();
      }
    }

    serverStats = await getServerStats(msg.guild);
    if (serverStats.narutoGame.gameID != gameID) return;

    preMessages = await sendMessages(msg, player1, player2, firstPlayer);
    player1.currentJutsu = null;
    player2.currentJutsu = null;

    // reset can play every move
    canPlay = 2;
    firstPlayer = null;

    // if a player has no available jutsus skip his turn
    getAvailableJutsus(player1.shinobi).length === 0 ? (canPlay -= 1) : null;
    getAvailableJutsus(player2.shinobi).length === 0 ? (canPlay -= 1) : null;

    // both players have no jutsus, end game
    if (canPlay <= 0) {
      // no available moves for both players, game over
      break;
    }

    await msg.channel
      .awaitMessages(filter, {
        max: canPlay,
        time: timeLimit * 1000,
        errors: ["time"],
      })
      .then(async (collected) => {
        serverStats = await getServerStats(msg.guild);
        if (serverStats.narutoGame.gameID != gameID) return;
        jutsuClash(player1, player2, firstPlayer);
      })
      .catch(async (collected) => {
        serverStats = await getServerStats(msg.guild);
        if (serverStats.narutoGame.gameID != gameID) return;

        // both did not respond, quit game
        if (!player1.currentJutsu && !player2.currentJutsu) {
          // tied match
          // const updateMembersBalPayload = {};
          // let randomNum = randomNumber(0.5, 0.6);
          // let minFee = Math.min(player1.shinobi.fees, player2.shinobi.fees);
          // updateMembersBalPayload[player1.id] = Math.floor(randomNum * minFee);
          // updateMembersBalPayload[player2.id] = Math.floor(randomNum * minFee);

          // await updateMembersBal(msg.guild, updateMembersBalPayload);

          return await sendGameOverMessages(
            client,
            msg,
            player1,
            player2,
            serverStats,
            // [Math.floor(randomNum * minFee), Math.floor(randomNum * minFee)],
            ["💩", "💩"],
            true
          );
        }

        return jutsuClash(player1, player2, firstPlayer);
      });
  }

  serverStats = await getServerStats(msg.guild);
  if (serverStats.narutoGame.gameID == gameID) {
    await gameOver(client, msg, player1, player2, serverStats);
  }
}

function randomNumber(min, max) {
  // min and max included
  return Math.random() * (max - min) + min;
}

async function gameOver(client, msg, player1, player2, serverStats) {
  let deltaChakra = player1.shinobi.chakra - player2.shinobi.chakra;
  let deltaHealth = player1.shinobi.health - player2.shinobi.health;

  //four possiblities : p1.chakra>p2.chakra : dC = +ve ,
  //p1.health > p2.health : dH = +ve,
  //p1.chakra < p2.chakra : dC = -ve,
  //p1.health < p2.health : dH = -ve

  var winner;
  var loser;

  //player1 has more chakra
  if (deltaChakra > 0) {
    // player 2 has more health
    if (deltaHealth < 0 && deltaChakra < Math.abs(deltaHealth)) {
      //player2 wins
      winner = player2;
      loser = player1;
    } else {
      //player1 wins
      winner = player1;
      loser = player2;
    }
  }
  // player2 has more chakra
  else if (deltaChakra < 0) {
    // player1 has more health
    if (deltaHealth > 0 && Math.abs(deltaChakra) < deltaHealth) {
      //player1 wins
      winner = player1;
      loser = player2;
    } else {
      //player2 wins
      winner = player2;
      loser = player1;
    }
  } else {
    // both have same chakra, who ever has more health wins
    if (deltaHealth > 0) {
      // player1 wins
      winner = player1;
      loser = player2;
    } else if (deltaHealth < 0) {
      //player2 wins
      winner = player2;
      loser = player1;
    } else {
      // tied match
      const updateMembersBalPayload = {};
      let randomNum = randomNumber(0.5, 1.5);
      let minFee = Math.min(player1.shinobi.fees, player2.shinobi.fees);
      updateMembersBalPayload[player1.id] = Math.floor(randomNum * minFee);
      updateMembersBalPayload[player2.id] = Math.floor(randomNum * minFee);

      await updateMembersBal(msg.guild, updateMembersBalPayload);

      return await sendGameOverMessages(
        client,
        msg,
        player2,
        player1,
        serverStats,
        [Math.floor(randomNum * minFee), Math.floor(randomNum * minFee)],
        true
      );
    }
  }

  //REWARD WINNER AND LOSER WITH SOME ARBITARY AMOUNT
  const updateMembersBalPayload = {};
  [winnerAmount, loserAmount] = [
    Math.floor(randomNumber(2.5, 4.5) * winner.shinobi.fees),
    0,
    // Math.floor(randomNumber(0.2, 0.9) * Math.max(winner.shinobi.fees, 600)),
  ];

  if (
    rankOrder.indexOf(winner.shinobi.rank) <
    rankOrder.indexOf(loser.shinobi.rank)
  ) {
    winnerAmount +=
      (rankOrder.indexOf(loser.shinobi.rank) -
        rankOrder.indexOf(winner.shinobi.rank)) *
      rankDiffWinPay;
  } else if (
    rankOrder.indexOf(winner.shinobi.rank) >
    rankOrder.indexOf(loser.shinobi.rank)
  ) {
    loserAmount +=
      (rankOrder.indexOf(winner.shinobi.rank) -
        rankOrder.indexOf(loser.shinobi.rank)) *
      rankDiffLoosePay;
  }

  updateMembersBalPayload[winner.id] = winnerAmount;
  updateMembersBalPayload[loser.id] = loserAmount;

  await updateMembersBal(msg.guild, updateMembersBalPayload);
  return await sendGameOverMessages(client, msg, winner, loser, serverStats, [
    winnerAmount,
    loserAmount,
  ]);
}

async function sendGameOverMessages(
  client,
  msg,
  winner,
  loser,
  serverStats,
  [winnerAmount, loserAmount],
  tie = false
) {
  msg.channel.send(`Game Over!${animated.narutobaryon.full}`);
  if (tie) {
    await quitGame(client, msg, null, serverStats, (reply = false));
    msg.channel.send(`<@${winner.id}> <@${loser.id}> This match has tied!`);
    msg.channel.send(
      `<@${winner.id}>, You recieved ${winnerAmount}${animated.coinspin.full}!\n\n<@${loser.id}>, You recieved ${loserAmount}${animated.coinspin.full}`
    );
    return true;
  }

  await quitGame(client, msg, null, serverStats, (reply = false));
  msg.channel.send(
    `Congratulations! <@${winner.id}>, You have won. <@${loser.id}>, Better luck next time!`
  );
  msg.channel.send(
    `<@${winner.id}>, You have been awarded with ${winnerAmount}${animated.coinspin.full}!\n\n<@${loser.id}>, You recieved ${loserAmount}${animated.coinspin.full}`
  );
  return true;
}

function jutsuClash(player1, player2, firstPlayer) {
  if (player1.currentJutsu) {
    player1.currentJutsu.use(player1, player2, player1 == firstPlayer);
  } else {
    player1.shinobi.chakra += skipChakraInc;
  }
  if (player2.currentJutsu) {
    player2.currentJutsu.use(player2, player1, player2 == firstPlayer);
  } else {
    player2.shinobi.chakra += skipChakraInc;
  }
}

async function setPlayerJutsu(msg, player, jutsuName, gameID) {
  if ((await getNarutoGameStats(msg.guild)).gameID != gameID) return false;

  let jutsu = checkValidJutsu(msg, jutsuName, player);
  if (jutsu) {
    player.currentJutsu = jutsu;
    player.shinobi.chakra -= jutsu.chakra;

    // msg.reply(`Set your jutsu to ${jutsu.name}`);
    msg.react("👍");

    return true;
  }
  return false;
}

function checkValidJutsu(msg, jutsuName, player) {
  if (player.currentJutsu) {
    // msg.reply("You have already chosen jutsu!");
    msg.react(emojis.shrekdisgusted.full);
    return false;
  }

  let availableJutsus = getAvailableJutsus(player.shinobi);
  if (
    !Jutsus[jutsuName] ||
    !availableJutsus.filter((jutsu) => jutsu.commandName === jutsuName).length
  ) {
    // msg.reply("Invalid Jutsu!");
    msg.react("🚫");
    return false;
  }

  return availableJutsus.filter((jutsu) => jutsu.commandName === jutsuName)[0];
}

async function sendMessages(msg, player1, player2, firstPlayer) {
  const preMessages = [];

  //send stats
  preMessages.push(await sendPlayersStats(msg, player1, player2, firstPlayer));

  //send available jutsus for player1
  preMessages.push(
    await msg.channel.send({
      embed: getAvailableJutsusEmbed(msg, player1),
    })
  );

  //send available jutsus for player2
  preMessages.push(
    await msg.channel.send({
      embed: getAvailableJutsusEmbed(msg, player2),
    })
  );

  return preMessages;
}

function getPlayerStatsForEmbed(player) {
  return {
    name: player.name,
    value: `Shinobi Hired: ${player.shinobi.name}\n\nJutsu Used: ${
      player.currentJutsu ? player.currentJutsu.name : null
    }\n\nHealth Left: ${player.shinobi.health}\n\nChakra Left: ${
      player.shinobi.chakra
    }`,
    inline: true,
  };
}

async function sendPlayersStats(msg, player1, player2, firstPlayer) {
  let title =
    player1.currentJutsu && player2.currentJutsu
      ? "Now that's a good fight "
      : "Ahh! Don't fight so lousily ";

  var gifQuery = "";

  if (!firstPlayer) {
    gifQuery = `${player1.shinobi.name} vs ${player2.shinobi.name}`;
  } else {
    gifQuery = `${firstPlayer.shinobi.name} ${firstPlayer.currentJutsu.name}`;
  }

  // if (player1.currentJutsu) {
  //   gifQuery += `${player1.shinobi.name} ${player1.currentJutsu.name}`;
  // } else if (player2.currentJutsu) {
  //   gifQuery += `${player2.shinobi.name} ${player2.currentJutsu.name}`;
  // } else if (!player1.currentJutsu && !player2.currentJutsu) {
  //   gifQuery += `${player1.shinobi.name} fight ${player2.shinobi.name}`;
  // }
  // let jutsu1 = player1.currentJutsu ? player1.currentJutsu.name : "";
  // let jutsu2 = player2.currentJutsu ? player2.currentJutsu.name : "";
  // let gifQuery = `${player1.shinobi.name} ${jutsu1} vs ${player2.shinobi.name} ${jutsu2}`;

  let playersStatsEmbed = {
    title: `${title} ,${player1.name} and  ${player2.name}`,
    fields: [getPlayerStatsForEmbed(player1), getPlayerStatsForEmbed(player2)],
    color: "GOLD",
    image: {
      url: await helper.getGif(gifQuery),
    },
    footer: {
      text: `You have **${timeLimit} seconds** to choose your jutsu, If you don't your turn will be skipped.If both of you don't choose a jutsu the game will be tied!\n\nThe one who plays first gets a good boost of power!`,
    },
  };

  return await msg.channel.send({ embed: playersStatsEmbed });
}

function getAvailableJutsus(shinobi) {
  let avaliableJutsus = [];
  for (let jutsu of shinobi.jutsus) {
    if (jutsu.chakra <= shinobi.chakra && jutsu.usageLeft > 0) {
      avaliableJutsus.push(jutsu);
    }
  }
  return avaliableJutsus;
}

function getAvailableJutsusEmbed(msg, player) {
  let playerJutsusEmbed = {
    title: `${player.name} ,Choose your jutsu!`,
    description: `Usage: \`use <jutsu_command_name>\``,
    fields: [],
  };

  let availableJutsus = getAvailableJutsus(player.shinobi);

  // if the player doesent have any chakra let him know, and reduce can play
  if (availableJutsus.length === 0) {
    playerJutsusEmbed.description =
      "Oh no! You don't have any available jutsus. :/";
  }

  availableJutsus.forEach((jutsu, ind) => {
    playerJutsusEmbed.fields.push({
      name: `\`use ${jutsu.commandName}\``,
      value: `[hover for details](${msg.url} "${jutsu.getDescription()}")`,
      inline: true,
    });
  });

  return playerJutsusEmbed;
}
