const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar-SA' }
});

// 1. بروكسي الصور
app.get('/proxy-image', async (req, res) => {
    try {
        const imgPath = decodeURIComponent(req.query.path);
        const imageUrl = `https://image.tmdb.org/t/p/w500${imgPath}`;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) { res.status(500).send('Image Error'); }
});

// 2. بروكسي مشغل الفيديو (يدوي بدون أدوات خارجية)
app.get('/videoproxy/*', async (req, res) => {
    try {
        // الحصول على المسار المطلوب (مثال: embed/movie/634649)
        const requestedPath = req.params[0];
        const targetUrl = `https://vidsrc.to/${requestedPath}`;
        
        // جلب صفحة المشغل
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        // مسح أوامر الحظر التي تمنع التشغيل داخل ديسكورد
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.set('Content-Type', 'text/html');
        
        // إرسال صفحة المشغل لموقعك
        res.send(response.data);
    } catch (error) {
        console.error('Video Proxy Error:', error.message);
        res.status(500).send('Proxy Error');
    }
});

app.get('/', async (req, res) => {
    try {
        const response = await tmdb.get('/movie/popular');
        res.render('index', { movies: response.data.results, query: '', clientId: process.env.CLIENT_ID });
    } catch (error) { res.status(500).send('Error'); }
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');
    try {
        const response = await tmdb.get('/search/movie', { params: { query } });
        res.render('index', { movies: response.data.results, query: query, clientId: process.env.CLIENT_ID });
    } catch (error) { res.status(500).send('Error'); }
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
    } catch (error) { res.status(500).send('Error'); }
});

// بدلاً من app.listen
module.exports = app;