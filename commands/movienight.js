const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCinemaEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movienight')
        .setDescription('Initialize a formal voting ballot for the evening\'s feature presentation.')
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('First film candidate')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Second film candidate')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Third film candidate')
                .setRequired(false)),
                
    async execute(interaction) {
        // 1. تأجيل الرد لإعطاء البوت وقتاً
        await interaction.deferReply().catch(console.error);

        try {
            const opt1 = interaction.options.getString('option1');
            const opt2 = interaction.options.getString('option2');
            const opt3 = interaction.options.getString('option3');

            const fields = [
                { name: `I. ${opt1}`, value: `**0** Ballots Cast`, inline: false },
                { name: `II. ${opt2}`, value: `**0** Ballots Cast`, inline: false }
            ];

            if (opt3) {
                fields.push({ name: `III. ${opt3}`, value: `**0** Ballots Cast`, inline: false });
            }

            const embed = createCinemaEmbed({
                title: 'The Evening\'s Ballot',
                description: '> Distinguished guests, please cast your vote for tonight\'s feature presentation. The film with the most ballots shall be projected in the theater shortly.',
                fields: fields
            });

            const votingRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('vote_0')
                        .setLabel('Vote I')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('vote_1')
                        .setLabel('Vote II')
                        .setStyle(ButtonStyle.Primary)
                );

            if (opt3) {
                votingRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId('vote_2')
                        .setLabel('Vote III')
                        .setStyle(ButtonStyle.Primary)
                );
            }

            const activityRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('watch_together')
                        .setLabel('Open Screening Room')
                        .setStyle(ButtonStyle.Success)
                );

            // 2. إرسال الرد النهائي
            await interaction.editReply({ embeds: [embed], components: [votingRow, activityRow] });

        } catch (error) {
            console.error('Error in movienight command:', error);
            // محاولة الرد برسالة خطأ إذا كان التأجيل قد نجح
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'An internal error occurred while setting up the ballot.' }).catch(()=>{});
            } else {
                await interaction.reply({ content: 'An internal error occurred while setting up the ballot.', ephemeral: true }).catch(()=>{});
            }
        }
    },
};