const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Send the verification panel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the panel in")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  requiredRoles: [staffRole],
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const embed = new EmbedBuilder()
      .setTitle("Verification")
      .setDescription(
        "Click the button below to verify yourself and gain access to the server!"
      )
      .setColor("Green");

    const button = new ButtonBuilder()
      .setCustomId("verify-button")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success)
      .setEmoji("<:check:1416849017090084945>");

    const row = new ActionRowBuilder().addComponents(button);
    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `✅ Verification panel sent in ${channel}`,
      ephemeral: true,
    });
  },
};
