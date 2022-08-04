const { Videogame, Genre, Op } = require("../db");
const axios = require("axios");
const { API_KEY } = process.env;

//Mi arreglo de promesas para las paginas, en este caso me traigo 5 paginas para poder cargar 100 videojuegos.
const videogamesPerPage = async () => {
  let myVideogamesOnPageOne = axios.get(
    `https://api.rawg.io/api/games?key=${API_KEY}`
  );
  let myVideogamesOnPageTwo = axios.get(
    `https://api.rawg.io/api/games?key=${API_KEY}&page=2`
  );
  let myVideogamesOnPageThree = axios.get(
    `https://api.rawg.io/api/games?key=${API_KEY}&page=3`
  );
  let myVideogamesOnPageFour = axios.get(
    `https://api.rawg.io/api/games?key=${API_KEY}&page=4`
  );
  let myVideogamesOnPageFive = axios.get(
    `https://api.rawg.io/api/games?key=${API_KEY}&page=5`
  );
//utilizo los 4 endopois para traerlos por pagina
  let data = await Promise.all([
    myVideogamesOnPageOne,
    myVideogamesOnPageTwo,
    myVideogamesOnPageThree,
    myVideogamesOnPageFour,
    myVideogamesOnPageFive,
  ]);

  myVideogamesOnPageOne = data[0].data.results; //entro todos los valores de result
  myVideogamesOnPageTwo = data[1].data.results;
  myVideogamesOnPageThree = data[2].data.results;
  myVideogamesOnPageFive = data[3].data.results;
  myVideogamesOnPageFour = data[4].data.results;

  const myVideogame = myVideogamesOnPageOne
    .concat(myVideogamesOnPageTwo)
    .concat(myVideogamesOnPageThree)
    .concat(myVideogamesOnPageFour)
    .concat(myVideogamesOnPageFive);
  return myVideogame; // concateno todo los endpoins
};

const getVideogames = async (req, res, next) => {
  try {
    let { name, order } = req.query;// destructuring de lo que me llega por query

    let infoApi;
    let infoDb;
    let allData = [];

    //#region name
    if (name && name !== "") {
      const dataApi = await axios.get(
        `https://api.rawg.io/api/games?key=${API_KEY}&search=${name}` //traigo el nombre 
      );
      infoApi = await dataApi.data.results.map((el) => {            //mapeo todos los valores y nme llos traigo a un arreglo nuevo
        return {
          image: el.background_image,
          name: el.name,
          genres: el.genres.map((e) => e.name),
          rating: el.rating,
          id: el.id,
        };
      });
      infoDb = await Videogame.findAll({  //tarigo valores de db con sus respectivos generos
        include: {
            model: Genre,
            attributes: ["name"],
            through: {
                attributes: []
            } 
        },
        // where: {
        //   name: {
        //     [Op.iLike]: `%${name}%`,
        //   }
        // }
      });

      infoDb = infoDb.map(el => { // mapeo lo de db
        return {
          image: el.image,
          id: el.id,
          name: el.name,
          genres: el.genres.map(e => e.name),
          rating: el.rating
        }
      })
      allData = infoDb.concat(infoApi); //concateno la db y api
    } else { // Me los traigo igual
      const dataApi = await videogamesPerPage();
      infoApi = dataApi.map((el) => {   // sino funciona lo vuelvo a mapear desde los endpoinds
        return {
          image: el.background_image,
          name: el.name,
          genres: el.genres.map((e) => e.name),
          rating: el.rating,
          id: el.id,
          createdInDatabase: el.createdInDatabase
        };
      });
      infoDb = await Videogame.findAll({
        include: {
          model: Genre,
          attributes: ["name"],
          through: {
              attributes: []
          } 
        }
      });
      infoDb = infoDb.map(el => {
        return {
          image: el.image,
          id: el.id,
          name: el.name,
          genres: el.genres.map(e => e.name),
          rating: el.rating,
          createdInDatabase: el.createdInDatabase
        }
      })
      // console.log(infoDb);
      allData = infoDb.concat(infoApi);
    }
   

   
    if (order === "asc" || !order || order === "") {   //ordeno los datos y los comparo si son en acendente
      allData = allData.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });     
    } else {
      allData = allData.sort((a, b) => {
        return b.name.toLowerCase().localeCompare(a.name.toLowerCase()); //localcompare ,busca en la cadena quien va antes, despues o si es la misma 
      });  //me traigo los decendentes
    }
    

    if (allData.length === 0) {  //calcilo la longitud si es 0 , mando 404
      res.status(400).json({message: "Not Found"})
    } else {
      return res.json(allData); // mando todo sin funciona
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({message: fallo});
  }
};

const getVideogamesById = async (req, res, next) => {
  const id = req.params.id; // guardo lo que llega por params
  if (id) {
    try {
      if (!id.includes("-")) {
        const idApi = await axios.get(
          `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
        );
        const info = {                        //datos apì
          image: idApi.data.background_image,
          name: idApi.data.name,
          genres: idApi.data.genres.map((e) => e.name),
          description: idApi.data.description,
          released: idApi.data.released,
          rating: idApi.data.rating,
          platforms: idApi.data.platforms.map((el) => el.platform.name),
          id: idApi.data.id
        };
        res.json(info);
      } else {
        const dB = await Videogame.findOne({ //datos db yrtaigo en 1 en 1
          where: {
            id: id
          },
          include: Genre
        });
        const gameDb = {
          image: dB.image,
          name: dB.name,
          genres: dB.genres.map((el) => el.name),
          description: dB.description,
          released: dB.released,
          rating: dB.rating,
          platforms: dB.platforms,
          id: dB.id
        };
        if (!dB) {
          return res.status(400).send({ message: "It was not found" });
        }
        return res.json(gameDb);
      }
    } catch (error) {
      next(error);
    }
  }
};




const postVideogames = async (req, res, next) => {
 try {
  const {
    image,
    name,
    description,
    released,
    rating,
    platforms,
    genres,
    createdInDatabase,
  } = req.body;
  let newVideogame = {
    image,
    name,
    description,
    released,
    rating,
    platforms,
    createdInDatabase,
  };
    if(name && description && released && platforms && genres && rating) {
      let createdVideogame = await Videogame.create(newVideogame); // creo el video jeugo
      let arrGenres = await Genre.findAll({ where: { name: genres } });// me los traigo todo los generos
      let ultimateGame = await createdVideogame.addGenres(arrGenres);// le agrego lo generos
      res.status(200).json({
        message: "videojuego creado exitosamente",
        videogame: ultimateGame,
      });
    } else{res.status(404).send('completa el formulario')}
    

  } catch (error) {
  next(error)
  }
};

module.exports = {
  getVideogames,
  getVideogamesById,
  postVideogames,
};
