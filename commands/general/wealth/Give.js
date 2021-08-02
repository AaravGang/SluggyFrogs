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
const getMember = dbHelper.getMember;

async function give(client, msg, params, serverDetails) {
  let recipient = msg.mentions.members.first();
  let amount = params[1];
  if (!amount || !recipient || !parseInt(amount)) {
    msg.reply(
      `recieved Invalid parameters. \`${prefix} give <@whom_you_wanna_give> <amount_to_give>\``
    );
    return false;
  }

  amount = parseInt(amount);

  if (!creatorIds.includes(msg.author.id)) {
    if (msg.author.id == recipient.user.id) {
      msg.reply(
        "Stupid! You can't fool me. Donation to self is not allowed unless you are god."
      );
      return false;
    }
    let authorBal = (await getMember(msg.guild, msg.author.id)).bal;
    if (authorBal < amount) {
      msg.reply("You do not have enough money! Current Balance: " + authorBal);
      return false;
    } else if (amount <= 0) {
      msg.reply("Ahhh, Selfish! You can give only positive money.");
      return false;
    }
    await updateMemberBal(msg.guild, msg.author.id, -amount);
    msg.reply(
      `Deducted ${amount}💰 from your wallet. Current balance: ${
        authorBal - amount
      }`
    );
  }

  updateStatus = await updateMemberBal(msg.guild, recipient.user.id, amount);
  if (updateStatus) {
    msg.channel.send(
      `<@${recipient.user.id}> ${amount}💰 has been added to your wallet by the super generous <@${msg.author.id}>! :)`
    );
    return true;
  }
}
