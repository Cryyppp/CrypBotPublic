const { ruoloUtente } = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId === "verify-button") {
      const role = interaction.guild.roles.cache.get(ruoloUtente);
      await interaction.member.roles.add(role);
      await interaction.reply({
        content:
          "You have been verified successfully!\nYou can now access the server!",
        ephemeral: true,
      });
    }
  },
};
