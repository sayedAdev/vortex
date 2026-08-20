const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { searchMovie } = require('../utils/tmdb');
const { createCinemaEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie')
        .setDescription('Query the cinematic archives for a specific film.')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the motion picture')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const title = interaction.options.getString('title');
        
        const movie = await searchMovie(title);
        if (!movie) {
            return interaction.editReply({ content: 'Our archivists could not locate this film in the vault. Please verify the title.' });
        }

        const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unreleased';
        const rating = movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)} / 10` : 'Unrated';
        const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
        const sanitizedTitle = encodeURIComponent(movie.title);

        const fields = [
            { name: 'Release Date', value: releaseDate, inline: true },
            { name: 'Critic Reception', value: rating, inline: true },
            { name: 'Synopsis', value: movie.overview || 'No synopsis is currently available for this feature.' }
        ];

        const embed = createCinemaEmbed({
            title: movie.title,
            description: 'A curated archival entry retrieved from the cinematic database.',
            fields: fields,
            image: poster
        });

        const streamingRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('View on JustWatch')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.justwatch.com/us/search?q=${sanitizedTitle}`),
                new ButtonBuilder()
                    .setLabel('View on Amazon')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.amazon.com/s?k=${sanitizedTitle}`),
                new ButtonBuilder()
                    .setLabel('View on Google Play')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://play.google.com/store/search?q=${sanitizedTitle}&c=movies`)
            );

        await interaction.editReply({ embeds: [embed], components: [streamingRow] });
    },
};