const axios = require('axios');

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY }
});

async function searchMovie(query) {
    try {
        const response = await tmdb.get('/search/movie', {
            params: { query, include_adult: false, language: 'en-US', page: 1 }
        });
        return response.data.results[0] || null;
    } catch (error) {
        console.error('TMDB Search Error:', error);
        return null;
    }
}

module.exports = { searchMovie };