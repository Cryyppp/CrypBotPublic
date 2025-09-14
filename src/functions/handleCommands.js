const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { token, clientid } = require("../../config.json");

module.exports = (client) => {
  client.handleCommands = async (commandFolders, path) => {
    client.commandArray = [];
    for (folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`${path}/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({
      version: "9",
    }).setToken(token);

    (async () => {
      try {
        console.log("Trying to register slash commands...");

        await rest.put(Routes.applicationCommands(clientid), {
          body: client.commandArray,
        });

        console.log("Verification: Passed");
        console.log("Almost there...");
        console.log("Fished registering slash commands");
      } catch (error) {
        console.error(error);
      }
    })();
  };
};
