const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Show all available commands based on your roles/permissions"
    ),
  async execute(interaction) {
    const commandsPath = path.join(__dirname, "..", "..", "commands");
    const categories = fs.readdirSync(commandsPath);

    let helpFields = [];
    const member = interaction.member;

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      if (!fs.lstatSync(categoryPath).isDirectory()) continue;

      const commandFiles = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".js"));

      let commandList = [];
      for (const file of commandFiles) {
        const command = require(path.join(categoryPath, file));
        if (!command.data || !command.data.name) continue;

        // Controlla permessi/ruoli richiesti dal comando
        let showCommand = true;

        // Se il comando ha un campo 'permissions'
        if (command.permissions && Array.isArray(command.permissions)) {
          showCommand = command.permissions.every((perm) =>
            member.permissions.has(PermissionsBitField.Flags[perm])
          );
        }

        // Se il comando ha un campo 'requiredRoles'
        if (command.requiredRoles && Array.isArray(command.requiredRoles)) {
          showCommand = command.requiredRoles.some((role) =>
            member.roles.cache.some((r) => r.name === role || r.id === role)
          );
        }

        if (showCommand) {
          commandList.push(
            `</${command.data.name}:0> - ${
              command.data.description || "No description"
            }`
          );
        }
      }

      if (commandList.length > 0) {
        helpFields.push({
          name: `📂 ${category}`,
          value: commandList.join("\n"),
          inline: false,
        });
      }
    }

    if (helpFields.length === 0) {
      helpFields.push({
        name: "No commands available",
        value: "You do not have permission to use any commands.",
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🤖 Help - List of Commands")
      .setDescription(
        "Here are all available commands you can use, based on your roles and permissions:"
      )
      .addFields(helpFields)
      .setColor(0x5865f2)
      .setFooter({ text: "CrypBot Help" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
