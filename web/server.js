const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar-SA' }
});

// قاعدة بيانات الأفلام (ضع رابط جوجل درايف المباشر في خانة url)
const localMovies = [
    { id: 566525, url: 'https://drive.google.com/uc?export=download&id=1WnJJ9Vt2tj27N2YaNk4RdvzyycDjlc5S' },
    { id: 822119, url: 'https://drive.google.com/uc?export=download&id=1dU86RfTmarQKKpZtKKtXkD2ejfXp7yvT' },
    { id: 1771, url: 'https://drive.google.com/uc?export=download&id=1jVkc_75sAUCWP5yhRTcdrYOvfUyXwEm4' },
    { id: 533535, url: 'https://drive.google.com/uc?export=download&id=1Wo7qyOTxeJ4KfXLRFPvd7FE9USHRQolK' },
    { id: 453395, url: 'https://drive.google.com/uc?export=download&id=1AftSFs3_kf6WmWcOzFEjW5wg8wrhgd2c' },
    { id: 24428, url: 'https://drive.google.com/uc?export=download&id=1InI_WnfEgv1weSHO8t-hYDbQJQwET7cr' },
    { id: 81310, url: 'https://drive.google.com/uc?export=download&id=1wPhuX0l6zt29OMj2KMfdWEkofoTpPU3W' },
    { id: 1726, url: 'https://drive.google.com/uc?export=download&id=1_0C4gZUYuLbfriAOaJq7FNtIf7t19O7P' },
    { id: 68721, url: 'https://drive.google.com/uc?export=download&id=1ri9XRw5MgkR7g0DlU1-8mlBMxYThv8n1' },
    { id: 1100928, url: 'https://drive.google.com/uc?export=download&id=ضع_الـ_ID_هنا' }
];

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

// الصفحة الرئيسية (تعرض شبكة الأفلام)
app.get('/', async (req, res) => {
    try {
        const moviesData = await Promise.all(
            localMovies.map(async (m) => {
                const response = await tmdb.get(`/movie/${m.id}`);
                return { ...response.data, url: m.url };
            })
        );
        res.render('index', { movies: moviesData });
    } catch (error) { 
        console.error(error);
        res.status(500).send('Error fetching movies'); 
    }
});

// صفحة المشاهدة (تعرض الفيديو من جوجل درايف)
app.get('/watch/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieInfo = localMovies.find(m => m.id == movieId);
        if (!movieInfo) return res.status(404).send('Movie not found');

        const response = await tmdb.get(`/movie/${movieId}`);
        res.render('movie', { movie: response.data, url: movieInfo.url });
    } catch (error) { 
        console.error(error);
        res.status(500).send('Error fetching movie details'); 
    }
});

// تصدير التطبيق لـ Vercel
module.exports = app;