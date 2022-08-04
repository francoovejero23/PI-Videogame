//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const { default: axios } = require('axios');
const server = require('./src/app.js');
const { conn, Genre } = require('./src/db.js');
const { API_KEY } = process.env;
const { PORT } = process.env;

// Syncing all the models at once.
conn.sync({ force: false}).then(() => {
  server.listen(PORT, async () => {
    const infoApi = await axios.get(`https://api.rawg.io/api/genres?key=${API_KEY}`);
    const content = infoApi.data.results;
    content.forEach(async el => {
      await Genre.create({name: el.name})
    })
    console.log(`Listen on port ${PORT}`); // eslint-disable-line no-console
  });
});
