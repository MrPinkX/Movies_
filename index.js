const express = require('express');
const app = express();
path = require("path");
var bodyParser = require('body-parser');
const port = process.env.PORT || 8080; 
const bcrypt = require('bcrypt');
var cookieParser = require("cookie-parser");
app.use(cookieParser())
var jwt = require('jsonwebtoken');


app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');


app.use( express.static( "public" ) );


// import sqlite3 from "sqlite3";

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');


const genres = ["Musical", "Adult",
    "Crime",
    "Sci-Fi",
    "Documentary",
    "Sport",
    "Horror",
    "History",
    "Music",
    "Family",
    "Reality-TV",
    "Western",
    "Mystery",
    "Thriller",
    "Adventure",
    "War",
    "Comedy",
    "Biography",
    "Drama",
    "Film-Noir",
    "Action",
    "Romance",
    "Animation",
    "Fantasy"
]
const db = new sqlite3.Database("farter_2.db");



(async () => {
  console.log("asyns");

  (async () => {
    console.log("asyns2");
  })()
})()

console.log("anything");

(async () => {

  
  // open the database
  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  })

  db2.exec(`CREATE TABLE IF NOT EXISTS users (
    username VARCHAR,
    passwordx VARCHAR
  );`)

   db2.exec(`CREATE TABLE IF NOT EXISTS users_data (
    username VARCHAR,
    fav_movies VARCHAR
  );`)

   db2.exec(`CREATE TABLE IF NOT EXISTS users_lists (
    list_id VARCHAR,
    username VARCHAR,
    list_name VARCHAR,
    movie_id VARCAHR,
    thumbnail VARCAHR
  );`)


  async function get_rows(query) {
    rows = await db2.all(query);
    return rows;
  }

  get_rows(`SELECT * FROM features WHERE name LIKE "jealousy" limit 10;`);


  app.get([`/f/:name`, `/f/:name/:name1`], async (request, response) => {

    let user;
    try { 
    user_check = jwt.verify(request.cookies.toky, "shhhhh"); 
    user = true;
  } catch {
    user = false;
  }
    
    const { name } = request.params
    query = `SELECT * FROM features WHERE name LIKE "${name}"`;
    console.log(query);

    f_row = await get_rows(query);

    console.log(f_row[0], "rows[0]");

    f_associates = JSON.parse(f_row[0]['associates']);

    if (f_associates) {
      if (request.params.name1) {
        name2 = request.params.name1;
        console.log(name2);

        quer = `SELECT * FROM movies WHERE keywords LIKE '%"${name}"%' AND keywords LIKE '%"${name2}"%' ORDER BY imdb_votes DESC limit 20;`;
        console.log(quer);
        db.all(quer, function (err, rows) {
          console.log("aaaSEC")
          response.render("second shit", { path: `${name} > ${name2}`, fuck: rows, associate_moviecount: associate_moviecount});
        })
      }
      else {
        assocas = { "f_name": name }
        associates_moviecount = []
        for (i = 1; i < 5; i++) {
          console.log(f_associates[i], "f_associatesi")
          associate_moviecount = await db2.all(`SELECT COUNT(*) FROM movies WHERE keywords LIKE '%"${f_associates[i]['name']}"%' AND keywords LIKE '%"${name}"%'`);
          assoca_movies = await get_rows(`SELECT * FROM movies WHERE keywords LIKE '%"${f_associates[i]['name']}"%' AND keywords LIKE '%"${name}"%' ORDER BY imdb_votes DESC limit 10;`);
          assocas[f_associates[i]['name']] = {"movies": assoca_movies, "movie_count": associate_moviecount[0]};
        }
        response.render("shit", { fuck: assocas, user: user, movie_count: f_row[0]['movie_count']});
      }
    } else {
      quer = `SELECT * FROM movies WHERE keywords LIKE '%"${name}"%' ORDER BY imdb_votes DESC limit 20;`
      console.log(quer);
      db.all(quer, function (err, rows) {
        response.render("second shit", { path: `${name}`, fuck: rows });
      })
    }



  })


  


  app.post('/useyx', jsonParser, (request, response) => {
    query = request.body["A"]
    db.all(query, function (err, rows) {
      response.send(rows);
    })
  })


  
})();







var jsonParser = bodyParser.json()



app.post('/usey', jsonParser, async (request, response) => {

  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  })

  async function get_rows(query) {
    rows = await db2.all(query);
    return rows;
  }


    console.log(request.body["b"]);
    if (request.body["b"].length > 0) {
      query = request.body["b"];
    } else {
      query = `SELECT * FROM features ORDER BY movie_count DESC limit 15;`;
    }

    lstr = []

    if (request.body["c"]) {
      console.log("C")
      send_associated_categories(request.body["b"], request.body["c"])
    } 

    else {
      if (request.body["autocomplet"]) {
        if (request.body["b"].length > 1) {
          query1 = request.body["b"][0];
          query2 = request.body["b"][1];
          lstr = []

          
          filtered_genres = []
          console.log(request.body["b"], "genre query");
          for (i=0; i<genres.length; i++) {
            if (genres[i].toLowerCase().includes(request.body["b"][2])) {
              filtered_genres.push(genres[i])
            } 
          }
          
          
          autocomplet_features = await db2.all(query1);

          if (lstr.length == 0) {
            lstr.push(autocomplet_features);
          }
          
            autocomplet_movies = await db2.all(query2);
          if (lstr.length == 1) {

            lstr.push(autocomplet_movies);
          }
          
          if (lstr.length == 2) {
            console.log(lstr.length, 'should be < 2'); 
            lstr.push(filtered_genres); 
          }

          // if (lstr.length<5){
            response.send(lstr);
          // }

        } else {
          // Inner condition autocomplete
          usinput = request.body["b"][0];
          query1 = `SELECT * FROM features WHERE name LIKE '%${usinput}%' LIMIT 5`;
          console.log(query1);

          autocomplet_features = await db2.all(query1);
          autocomplet_genres = []


          console.log(request.body["b"], "genre query");
          for (i=0; i<genres.length; i++) {
            if (genres[i].toLowerCase().includes(usinput)) {
              autocomplet_genres.push(genres[i])
            }
          } 

          autocomplet_features = autocomplet_features.map((feature) => {return feature['name']});
          response.send([autocomplet_features, autocomplet_genres]);
        }
        

        


      }
      else {
        db.all(query, function (err, rows) {
          // if (request.cookies.toky);
          try {
            user = jwt.verify(request.cookies.toky, "shhhhh");
            console.log("user detec");
            response.send([rows, "user"]);
          } catch {
            response.send([rows]);
          }
          
        })
      }
    }


    async function send_associated_categories(f_name, amount) {
      query = `SELECT * FROM features WHERE name LIKE "${f_name}"`;
      console.log(query);

      f_row = await get_rows(query);

      f_associates = JSON.parse(rows[0]['associates']);

      assocas = { "f_name": f_name }
      for (i = amount; i < amount + 5; i++) {
        console.log(f_associates[i], "f_associatesi")
        associate_moviecount = await db2.all(`SELECT COUNT(*) FROM movies WHERE keywords LIKE '%"${f_associates[i]['name']}"%' AND keywords LIKE '%"${f_name}"%'`);
        assoca_movies = await get_rows(`SELECT * FROM movies WHERE keywords LIKE '%"${f_associates[i]['name']}"%' AND keywords LIKE '%"${f_name}"%' ORDER BY imdb_votes DESC limit 10;`);
        assocas[f_associates[i]['name']] = {"movies": assoca_movies, "movie_count": associate_moviecount[0]};
      }
      response.send(assocas);
    }

    // Gets feature name from frontend, getting it's associates list - sends the next 5 that hasn't been sent.
    // Frontend also sends the amount that's been sent (i.e, the amount of times page has been scrolled down), and so the function 
    // sends only those associates with index higher then that amount 


  })


  app.post('/user_check', jsonParser, async (request, response) => { 
    try {
      user = jwt.verify(request.cookies.toky, "shhhhh");
      console.log("user detec");
      response.send(["user"]);
    } catch {
      response.send(["none"]);
    }
  })


app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, "visual.html"));
})







// Using EJS 
app.get(`/m/:name`, async (request, response) => {
  const { name } = request.params
  zzza = ["aAAAzzzz", "zxc"]
  // response.send(`<p class="feature_name">new toy${name}</p>`);


   let user;
    try { 
    user_check = jwt.verify(request.cookies.toky, "shhhhh"); 
    user = true;
  } catch {
    user = false;
  }

  console.log(name);
  query = `SELECT * FROM movies WHERE my_index LIKE ${name} limit 10;`;
  console.log(query);

  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 

  movierow = await db2.all(query);
  console.log(movierow)
  console.log(movierow[0], 'movierow0');
  console.log(`SELECT * FROM users_lists WHERE movie_id LIKE ${movierow[0]['id']};`);
  movieuserslists = await db2.all(`SELECT DISTINCT list_name, * FROM users_lists WHERE movie_id LIKE ${movierow[0]['id']}`);

  console.log(movieuserslists, "movieuserslists");

  
  response.render("woz", { movie: movierow[0], lists: movieuserslists, user: user});


  // db.all(query, function (err, rows) {
  //   console.log(JSON.stringify(rows[0]));
  //   response.render("woz", { movie: rows[0] });
  // })

  console.log(JSON.stringify(zzza));

})



// List page 
app.get(`/l/:name`, async (request, response) => {
  const { name } = request.params
  query = `SELECT * FROM users_lists WHERE list_id LIKE "${name}" limit 10;`;

  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 

  listmovies = await db2.all(query);
  console.log(listmovies);


  l = ''
  for (let i = 0; i < listmovies.length; i++) {
    l = l + `"${listmovies[i]['movie_id']}"` + ", "
  }


  query2 = `SELECT * FROM movies
    WHERE id IN (${l.slice(0, l.length - 2)}) limit 20;`

  listmoviesmetadata = await db2.all(query2);
  console.log(listmoviesmetadata);
  response.render("list", {list_movies: listmoviesmetadata});

})





// Genre page 
app.get(`/g/:name`, async (request, response) => {
  const { name } = request.params
  query = `SELECT * FROM movies WHERE genre LIKE '%"${name}"%' ORDER BY imdb_votes DESC limit 10;`;

  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 

  genremovies = await db2.all(query);
  genre_moviecount = await db2.all(`SELECT COUNT(*) FROM movies WHERE genre LIKE '%"${name}"%'; `)


  console.log(genremovies, query, genre_moviecount, "genremovies");
  genre_movies = {}
  genre_movies[name] = genremovies;
  genre_movies["count"] = genre_moviecount['COUNT(*)'];


  response.render("genre", {genre_movies: genre_movies});

})


// Search uniq 
app.get(`/s/:name`, async (request, response) => {
  const { name } = request.params
  console.log(name);

  conditions = name.split(';');

  // for (let i=0; i<conditions.length; i++) {
  query = `SELECT * FROM movies WHERE ${conditions[0].split(':')[0]} LIKE '%"${conditions[0].split(':')[1]}"%' ORDER BY imdb_votes DESC limit 10;`;
  // }
  
  console.log(query);
  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 

  querymovies = await db2.all(query);
  genre_moviecount = await db2.all(`SELECT COUNT(*) FROM movies WHERE genre LIKE '%"${name}"%'; `)


  // console.log(genremovies, query, genre_moviecount, "genremovies");
  // query_movies = {}
  // genre_movies[name] = genremovies;
  // genre_movies["count"] = genre_moviecount['COUNT(*)'];
  querymovies = {movies: querymovies, conditions: conditions};


  response.render("visual", {query_movies: querymovies});

})





app.post('/singlemovie', jsonParser, async (request, response) => {
  console.log("SINGLEMOVIE");
  query = `SELECT * FROM movies WHERE id LIKE ${request.body["movie_id"]}`;
  console.log("singlemoviequery", query);

  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 

  userdata = await db2.all(query);
  response.send([userdata[0]]);

    
  }) 





app.post('/general_search', jsonParser, async (request, response) => {
  
  console.log(request.body['queries']);

  features_query = request.body["queries"][0];
  movies_query = request.body["queries"][1];
  lists_query = `SELECT * FROM users_lists WHERE list_name LIKE '%${request.body['queries'][2]}%'; `

  

  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 


  features = await db2.all(features_query);
  movies = await db2.all(movies_query); 
  lists = await db2.all(lists_query);
  

  response.send({movies: movies, features: features, lists: lists})



})

  







// Users stuff 
app.post(`/userdata`, jsonParser, async (req, res) => {
  let moviename = req.body["moviename"];
  let timestamp = req.body["time"];
  console.log("That")
  
  let user;
  try { 
    user = jwt.verify(req.cookies.toky, "shhhhh"); 
  } catch {
    user = false;
  }
  
  if (user) {
      console.log(req.body, "moviename");
      const db2 = await open({
          filename: 'farter_2.db',
          driver: sqlite3.Database
        }) 

    if (req.body["history"]) {
      console.log("Added to history");

      db2.exec(`INSERT INTO users_data
              VALUES ("${user["username"]}", "none", "${moviename}", ${timestamp}) `);
      }

    else {

      
    if (req.body['list_']) {
      console.log('list!!!!!!', moviename);
      
      suchlist = await db2.all(`SELECT * FROM users_lists WHERE username LIKE "${user['username']}" AND list_name LIKE "${req.body['list_']}"`);
      console.log(suchlist.list_id, "suchlist");
      

      if (suchlist.length < 1) {
        db2.exec(`INSERT INTO users_lists
              VALUES (hex(randomblob(7)), "${user["username"]}", "${req.body['list_']}", "${moviename}", "${moviename}"); `);
      } else {
        db2.exec(`INSERT INTO users_lists
              VALUES ("${suchlist[0]['list_id']}", "${user["username"]}", "${req.body['list_']}", "${moviename}", "${suchlist[0]['thumbnail']}"); `);
      }
      
    } else {
      db2.exec(`INSERT INTO users_data
              VALUES ("${user["username"]}", "${moviename}", "none", "none");`);
      console.log("added to default list");

    }
  }
    console.log("movie saved");
    res.send(["Movie saved"]);
  } else {
    console.log("Sign in required");
    res.send(["Sign in required"]);
  }
  

}) 


function filtering_data_to_query() {
  movies_query = `SELECT * FROM movies WHERE name LIKE "%${filtering_data["query"]}%" `;
  if (filtering_data["features"]) {
    for (let i=0; i<filtering_data["features"].length; i++) {
      movies_query += ` AND keywords LIKE '%"${filtering_data["features"][i]}"%'`
    }
  } 
  if (filtering_data["genres"]) {
    for (let i=0; i<filtering_data["genres"].length; i++) {
      movies_query += ` AND Genre LIKE '%"${filtering_data["genres"][i]}"%'`
    }
  } 
  nobkeys = Object.keys(filtering_data).slice(-3);
  console.log(nobkeys);
  for (i = 0; i < nobkeys.length; i++) {
    snipet = ` AND ${nobkeys[i]} BETWEEN ${filtering_data[nobkeys[i]]["min"]} AND ${filtering_data[nobkeys[i]]["max"]}`;
    movies_query += snipet;
    if (i == nobkeys.length - 1) {
        movies_query += ` ORDER BY imdb_votes DESC`;
    }
  }

  return movies_query;
}


let filtering_data;
let amount = 0;
app.post(`/general_search_`, jsonParser, async (req, res) => {
  filtering_data = req.body["search_data_"]; 
  console.log(filtering_data);

  amount = 0;

  movies_query = `SELECT * FROM movies WHERE name LIKE "%${filtering_data["query"]}%" `;
  if (filtering_data["features"]) {
    console.log("adding feature");
    for (let i=0; i<filtering_data["features"].length; i++) {
      movies_query += ` AND keywords LIKE '%"${filtering_data["features"][i]}"%'`
    }
  } 
  if (filtering_data["genres"]) {
    for (let i=0; i<filtering_data["genres"].length; i++) {
      movies_query += ` AND Genre LIKE '%"${filtering_data["genres"][i]}"%'`
    }
  } 
  nobkeys = Object.keys(filtering_data).slice(-3);
  console.log(nobkeys);
  for (i = 0; i < nobkeys.length; i++) {
    snipet = ` AND ${nobkeys[i]} BETWEEN ${filtering_data[nobkeys[i]]["min"]} AND ${filtering_data[nobkeys[i]]["max"]}`;
    movies_query += snipet;
    if (i == nobkeys.length - 1) {
        movies_query += ` ORDER BY imdb_votes DESC LIMIT 5`;
    }
  }

  features_query = `SELECT * FROM features WHERE name LIKE "%${filtering_data["query"]}%" LIMIT 5;`;
  lists_query = `SELECT * FROM users_lists WHERE list_name LIKE '%${filtering_data["query"]}%'; `


  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  }) 

  features = await db2.all(features_query);
  movies = await db2.all(movies_query); 
  lists = await db2.all(lists_query);
  genres_ = []
  for (i=0; i<genres.length; i++) {
    if (genres[i].toLowerCase().includes(filtering_data["query"])) {
      genres_.push(genres[i])
    } 
  }

  console.log(movies_query);

  res.send({movies: movies, features: features, lists: lists, genres_});
  
})


app.post(`/scroll`, jsonParser, async (req, res) => {
  console.log(filtering_data)
    if (req.body["enter"]) {
      amount = amount + 5;
      console.log("sending more");
      
      const db2 = await open({
        filename: 'farter_2.db',
        driver: sqlite3.Database
      }) 


      movies_query = filtering_data_to_query(filtering_data);
      movies_query = movies_query + ` LIMIT ${amount}, ${5}`
      movies = await db2.all(movies_query);

      console.log(movies_query);

      res.send({movies: movies})


    }



})









app.use(express.urlencoded({ extended: false }));
users_ = []
app.post(`/signup`, jsonParser, async (req, res) => {

  


  // try {
    
    const username = req.body["usernamex"];
    const password = req.body["password"];
    console.log("password", password)
    
    // const user = { name:username, password:hashed };
    const db2 = await open({
      filename: 'farter_2.db',
      driver: sqlite3.Database
    }) 

    
    console.log((await db2.all(`SELECT * FROM users WHERE username LIKE "${username}"`)))
    if ((await db2.all(`SELECT * FROM users WHERE username LIKE "${username}"`)).length < 1) {
      console

      if (password.length < 8) {
        res.send(["Password too short"]);
      } else {
        if (req.body['enter']) {
          const salt = await bcrypt.genSalt();
          const hashed = await bcrypt.hash(req.body["password"], salt);
          db2.exec(`INSERT INTO users
            VALUES ("${username}", "${hashed}"); `);
          console.log("user created");
          // res.redirect("/profile");
          // res.send(["User created"]);
        } else {
          res.send(["Password good"]);
        }
      }
    } else {
      console.log("User already exist");
      res.send(["User already exist"]);
    }
   
}) 




app.get(`/profile`, async (request, response) => {
  console.log("PROFILE");
  try {
    user = jwt.verify(request.cookies.toky, "shhhhh"); 
    console.log(user, "USHER");

    const db2 = await open({
      filename: 'farter_2.db',
      driver: sqlite3.Database
    }) 

    userdata = await db2.all(`SELECT * FROM users_data WHERE username LIKE "${user['username']}"`);
    console.log(userdata);
    l = ''
    for (let i = 0; i < userdata.length; i++) {
        l = l + `"${userdata[i]['fav_movies']}"` + ", "
    }

    query = `SELECT * FROM movies
    WHERE level_0 IN (${l.slice(0, l.length - 2)}) limit 20;`


    usersmovies = await db2.all(query);
    sob = JSON.stringify(usersmovies)

    response.render("profile", {datat: usersmovies, username: user['username']});



  } catch(err) {
    console.log(err, "SHHSHSH")
  }
  
  

})







app.post("/login", jsonParser, async (req, res) => {
  const db2 = await open({
    filename: 'farter_2.db',
    driver: sqlite3.Database
  })

  console.log(req.body["usernamex"], req.body["password"], "11111n");


  user11 = await db2.all(`SELECT * FROM users WHERE username LIKE "${req.body['usernamex']}";`);
  console.log(user11, "xz");
  

  // try {
    if (await bcrypt.compare(req.body["password"], user11[0]["passwordx"])) {
      // token = "123123asdasd123asdZAZXCZXXX";
      console.log("password correct");
      var token = jwt.sign(user11[0], 'shhhhh');
      console.log("Logged in");
      res.cookie("toky", token, {httpOnly: true});
      // res.redirect("/profile");
      res.send(["success"]);
    } else {
      console.log("wrong password")
      res.send(['wrong password']);
    }
  
}) 

app.post("/logout", jsonParser, async (req, res) => {
  console.log(res.cookie, 'logout');
  res.clearCookie("toky");
  res.send(['logged out']);
  res.end();

})




app.listen(port, () => {
  console.log("Server started on port 8080");
})
