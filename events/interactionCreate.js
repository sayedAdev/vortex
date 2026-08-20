const { Events } = require('discord.js');
const { createCinemaEmbed } = require('../utils/embedBuilder');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Handle Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            }
        }

        // Handle Button Interactions
        if (interaction.isButton()) {
            const { customId } = interaction;

            // Movie Night Voting Logic
            if (customId.startsWith('vote_')) {
                const voteEmbed = interaction.message.embeds[0];
                if (!voteEmbed) return;

                const optionIndex = parseInt(customId.split('_')[1]);
                const votesField = voteEmbed.fields[optionIndex];
                
                // Extract current vote count
                let currentVotes = parseInt(votesField.value.match(/\*\*(\d+)\*\*/)[1]) || 0;
                currentVotes++;
                
                const updatedField = {
                    name: votesField.name,
                    value: `**${currentVotes}** Ballots Cast`
                };

                const newEmbed = createCinemaEmbed({
                    title: voteEmbed.title,
                    description: voteEmbed.description,
                    fields: voteEmbed.fields.map((f, i) => i === optionIndex ? updatedField : f)
                });

                await interaction.update({ embeds: [newEmbed] });
            }

           // Watch Together Activity Logic
if (customId === 'watch_together') {
    const member = interaction.member;
    if (!member.voice.channel) {
        return interaction.reply({ content: 'You must be present in a Voice Channel to commence the viewing.', ephemeral: true });
    }
    
    const invite = await member.voice.channel.createInvite({
        targetType: 2, 
        // استبدلنا ID اليوتيوب بـ ID البوت الخاص بك
        targetApplication: process.env.CLIENT_ID, 
        unique: true
    });

    const embed = createCinemaEmbed({
        title: 'The Private Screening Room',
        description: 'The velvet curtains are drawn. Click the invitation below to enter our private ad-free cinema interface directly inside Discord.'
    });

    await interaction.reply({ embeds: [embed], components: [{
        type: 1,
        components: [{ type: 2, style: 5, label: 'Enter the Private Theater', url: `https://discord.com/invite/${invite.code}` }]
    }], ephemeral: true });
}

  } 
  
    } 

}