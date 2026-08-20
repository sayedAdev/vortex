const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
// داخل ملف api/index.js
app.set('views', path.join(__dirname, '../web/views'));

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar-SA' }
});

// بروكسي الصور
app.get('/proxy-image', async (req, res) => {
    try {
        const imgPath = decodeURIComponent(req.query.path);
        const imageUrl = `https://image.tmdb.org/t/p/w500${imgPath}`;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) { res.status(500).send('Image Error'); }
});

app.get('/', async (req, res) => {
    try {
        const response = await tmdb.get('/movie/popular');
        res.render('index', { movies: response.data.results, query: '', clientId: process.env.CLIENT_ID });
    } catch (error) { res.status(500).send('Error: ' + error.message); }
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');
    try {
        const response = await tmdb.get('/search/movie', { params: { query } });
        res.render('index', { movies: response.data.results, query: query, clientId: process.env.CLIENT_ID });
    } catch (error) { res.status(500).send('Error: ' + error.message); }
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
        res.render('movie', { movie, trailerKey: trailer ? trailer.key : null, clientId: process.env.CLIENT_ID });
    } catch (error) { res.status(500).send('Error: ' + error.message); }
});

module.exports = app;