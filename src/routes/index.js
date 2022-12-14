const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const videogamesRouter = require('./videoGames');
const genresRouter = require('./genres');
const platformsRouter = require('./platforms');

const router = Router();
//rutas generales
// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use('/videogames', videogamesRouter);
router.use('/genres', genresRouter);
router.use('/platforms', platformsRouter);
//hago el pedido de video games ocomo genero



module.exports = router;
