const {
  Client,
  GatewayIntentBits,
  IntentsBitField,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const { token, guildid } = require("./config.json");
const fs = require("fs");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.commands = new Collection();

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
  for (file of functions) {
    require(`./src/functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(token);
})();

const { ActivityType } = require("discord.js");
client.on("clientReady", async () => {
  const guild = await client.guilds.fetch(guildid);
  const fullGuild = await guild.fetch();
  setInterval(() => {
    let status = [
      {
        name: `${fullGuild.memberCount} members`,
        type: ActivityType.Watching,
      },
      { name: "dsc.gg/crypHub", type: ActivityType.Watching },
    ];
    let random = Math.floor(Math.random() * status.length);
    client.user.setPresence({
      activities: [status[random]],
      status: "online",
    });
  }, 10000);
  setInterval(checkAllReposCommits, 60 * 1000);
});

client.login(token);

// CONFIGURA QUI
const { GITHUB_USERNAME, GITHUB_TOKEN, CHANNEL_ID } = require("./config.json");
let lastCommits = {};

async function checkAllReposCommits() {
  try {
    // Prendi tutte le repo dell'utente
    const headers = GITHUB_TOKEN
      ? { Authorization: `token ${GITHUB_TOKEN}` }
      : {};
    const reposRes = await axios.get(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
      { headers }
    );
    const repos = reposRes.data;

    for (const repo of repos) {
      const commitsRes = await axios.get(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits`,
        { headers }
      );
      const commits = commitsRes.data;
      if (!commits.length) continue;

      const lastSha = lastCommits[repo.name];
      if (!lastSha) {
        lastCommits[repo.name] = commits[0].sha;
        continue;
      }

      // Trova nuovi commit
      const newCommits = [];
      for (const commit of commits) {
        if (commit.sha === lastSha) break;
        newCommits.push(commit);
      }

      if (newCommits.length > 0) {
        lastCommits[repo.name] = commits[0].sha;
        const channel = await client.channels.fetch(CHANNEL_ID);
        for (const commit of newCommits.reverse()) {
          const author = commit.commit.author?.name || "Unknown";
          const avatar =
            commit.author?.avatar_url ||
            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
          const commitUrl = commit.html_url;
          const message = commit.commit.message;
          const date = commit.commit.author?.date || new Date().toISOString();

          const embed = new EmbedBuilder()
            .setColor(0x24292f)
            .setTitle(`📦 New commit on${repo.name}`)
            .setURL(commitUrl)
            .setAuthor({ name: author, iconURL: avatar })
            .setDescription(`\`\`\`\n${message}\n\`\`\``)
            .addFields(
              {
                name: "Repository",
                value: `[${repo.name}](${repo.html_url})`,
                inline: true,
              },
              {
                name: "Commit",
                value: `[View on GitHub](${commitUrl})`,
                inline: true,
              }
            )
            .setTimestamp(new Date(date))
            .setFooter({ text: `Commit hash: ${commit.sha}` });

          await channel.send({ embeds: [embed] });
        }
      }
    }
  } catch (err) {
    console.error("Errore polling GitHub:", err.message);
  }
}
