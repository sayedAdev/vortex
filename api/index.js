const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../web/views'));

// إعدادات الـ API
const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar-SA' }
});

app.get('/', async (req, res) => {
    try {
        const response = await tmdb.get('/movie/popular');
        res.render('index', { movies: response.data.results, clientId: process.env.CLIENT_ID });
    } catch (e) { res.status(500).send('Error'); }
});

app.get('/movie/:id', async (req, res) => {
    try {
        const [detailsRes, videosRes] = await Promise.all([
            tmdb.get(`/movie/${req.params.id}`),
            tmdb.get(`/movie/${req.params.id}/videos`)
        ]);
        const movie = detailsRes.data;
        const videos = videosRes.data.results;
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        
        res.render('movies', { 
            movie, 
            trailerKey: trailer ? trailer.key : null, 
            clientId: process.env.CLIENT_ID 
        });
    } catch (e) { res.status(500).send('Error'); }
});

app.get('/proxy-image', async (req, res) => {
    try {
        const imageUrl = `https://image.tmdb.org/t/p/w500${req.query.path}`;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (e) { res.status(500).send('Error'); }
});

module.exports = app;