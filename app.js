const express = require("express");
const app = express();
const { open } = require("sqlite");
app.use(express.json());
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "movieData.db");
let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost/3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

//GET API
app.get("/movies/",async(request,response)=>{
  const allMovieNames=`SELECT * FROM movie;`
  const allMovieRows=await db.all(allMovieNames);
  const ans=(allMovieRows)=>{
    return{
      movieName:allMovieRows.movie_name
    }
  }
  response.send(allMovieRows.map((eachMovie)=>ans(eachMovie)));
})

//post api
app.post("/movies/",async(request,response)=>{
  const movieDetails=request.body;
  const{directorId,movieName,leadActor}=movieDetails;
  const postMovieDetails=`INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`;
await db.run(postMovieDetails);
response.send("Movie Successfully Added");
})

//Put api for the movies
app.post("/movies/:movieId/",async(request,response)=>{
  const {movieId}=request.params;
  const movieDetails=request.body;
  const{directorId,movieName,leadActor}=movieDetails;
  const postMovieDetails=`UPDATE movie 
  SET
 director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE
  movie_id=${movieId};`;
await db.run(postMovieDetails);
response.send("Movie Details Updated");
})

//GET API with movieId
app.get("/movies/:movieId/",async(request,response)=>{
  const {movieId}=request.params;
  const getMovieDetailsWithID=`SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movieIdDetails=await db.get(getMovieDetailsWithID);
  response.send(movieIdDetails);
})

//DELETE API 
app.delete("/movies/:movieId/",async(request,response)=>{
  const {movieId}=request.params;
  const deleteMovieWithId=`DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieWithId);
  response.send("Movie Removed");
})

//get api directors
app.get("/directors/",async(request,response)=>{
const alldirectorDetails=`SELECT * FROM director;`;
const alldirectorsRows=db.get(alldirectorDetails);
response.send(alldirectorsRows);
})



//get api for specific director
app.get("/directors/:directorId/movies/",async(request,response)=>{
  const {directorId}=request.params;
  const getMovieDetailsWithID=`SELECT * FROM movie WHERE director_id=${directorId};`;
  const directorDetails=await db.all(getMovieDetailsWithID);
  response.send(directorDetails);
})

module.exports=app;