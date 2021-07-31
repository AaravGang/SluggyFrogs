module.exports = {
  name: "give",
  aliases: ["giv", "donate", "dep", "deposit"],
  description: "Give a member money.",
  execute: give,
};

const dotenv = require("dotenv");
dotenv.config();
const prefix = process.env.PREFIX.toLowerCase();
const creatorIds = process.env.CREATOR_IDS.split(" ");

const dbHelper = require("../../../DBHelper");
const updateMemberBal = dbHelper.updateMemberBal;

async function give(client, msg, params, serverDetails) {
  if (!creatorIds.includes(msg.author.id)) {
    msg.reply("You do not have permission to give money!");
    return false;
  }

  let recipient = msg.mentions.members.first();
  let amount = params[1];
  if (!amount || !recipient || !parseInt(amount)) {
    msg.reply(
      `recieved Invalid parameters. \`${prefix} give <@whom_you_wanna_give> <amount_to_give>\``
    );
    return false;
  }

  amount = parseInt(amount);

  updateStatus = await updateMemberBal(msg.guild, recipient.user.id, amount);
  if (updateStatus) {
    msg.channel.send(
      `<@${recipient.user.id}> ${amount}💰 has been added to your wallet by the super generous <@${msg.author.id}>! :)`
    );
    return true;
  }
}
