const { EmbedBuilder } = require('discord.js');

function createCinemaEmbed({ title, description, fields, image }) {
    const embed = new EmbedBuilder()
        .setColor('#1A1A1A') // Deep Charcoal
        .setFooter({ text: 'Cinema Bot | Golden Age Archives', iconURL: 'https://i.imgur.com/8t8XqgH.png' })
        .setTimestamp();

    if (title) embed.setTitle(`✦ ${title} ✦`);
    if (description) embed.setDescription(description);
    if (fields) embed.addFields(fields);
    if (image) embed.setImage(image);

    return embed;
}

module.exports = { createCinemaEmbed };