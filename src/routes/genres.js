const router = require('express').Router();
const getGenresApi = require('../controllers/genresController');

router.get("/", getGenresApi);

module.exports = router;