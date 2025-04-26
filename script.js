const fs = require("node:fs");
const path = require("path");

async function fetchAllMovies(startYear, endYear) {
  const delayBeforeRequest = 200;
  const pageSize = 100000;
  const movies = [];

  for (let year = +startYear; year < +endYear; year++) {
    await new Promise((resolve) => {
      setTimeout(resolve, delayBeforeRequest);
    });
    const url = `https://cinematicket.org/api/v1/movie/new-boxoffice/?page_size=${pageSize}&release_year=${year}`;
    const response = await fetch(url);
    const json = await response.json();
    for (let i = 0; i < json.results.length; i++) {
      const movie = json.results[i];
      movies.push({
        id: movie.id,
        name: movie.name,
        enName: movie.en_name,
        directors: movie.directors.map((dir) => dir.full_name),
        totalSale: movie.total_sale,
        totalAudience: movie.total_audience,
        cinemaCount: movie.cinemas_count,
        hallCount: movie.halls_count,
        releaseYear: movie.release_year,
      });
    }
  }

  return movies;
}

async function fetchMovieInfo(id) {
  const movieUrl = `https://cinematicket.org/api/v1/cinematicket/home/movies/${id}/`;
  const movieJson = await (await fetch(movieUrl)).json();
  const movieInfo = {
    id: movieJson.movie.id,
    name: movieJson.movie.name,
    enName: movieJson.movie.en_name,
    genres: movieJson.movie.genres.map((genre) => genre.name),
    type: movieJson.movie.type,
    usersRating: movieJson.movie.users_rating,
    directors: movieJson.movie.directors.map((dir) => dir.full_name),
    actors: movieJson.movie.actors.map((actor) => actor.full_name),
    writers: movieJson.movie.writers.map((writer) => writer.full_name),
    ratesCount: movieJson.movie.rates_count,
    movieRate: movieJson.movie.movie_rate,
    trailer: movieJson.movie.aparat_trailer,
    description: movieJson.movie.description,
    comments: [],
    criticism: "",
  };

  const hasCriticism = movieJson.movie.has_criticism;
  if (hasCriticism) {
    const critUrl = `https://cinematicket.org/api/v1/movie/${id}/criticisms?`;
    const critJson = await (await fetch(critUrl)).json();
    const critBody = critJson.body;
    movieInfo.criticism = critBody;
  }

  const delayBeforeRequest = 200;
  const commentThreadId = movieJson.movie.threads.find(
    (th) => th.type == "comment"
  ).id;
  let nextUrl = `https://cinematicket.org/api/v1/comment/comments/?thread=${commentThreadId}&page_size=10000`;
  if (commentThreadId) {
    do {
      await new Promise((resolve) => {
        setTimeout(resolve, delayBeforeRequest);
      });
      const commentsJson = await (await fetch(nextUrl)).json();
      nextUrl = commentsJson.next;
      for (let i = 0; i < commentsJson.results.length; i++) {
        const comment = commentsJson.results[i];
        const commentText = comment.text;
        movieInfo.comments.push(commentText);
      }
    } while (nextUrl !== null);
  }

  return movieInfo;
}

(async () => {
  const startYear = 1392;
  const endYear = 1404;
  const filePath = path.resolve(__dirname, "movies.json");
  if (!fs.existsSync(filePath)) {
    const movies = await fetchAllMovies(startYear, endYear);
    fs.writeFileSync(
      path.resolve(__dirname, "movies-brief.json"),
      JSON.stringify(movies, null, 2)
    );
  }

  const moviesBrief = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const delayBeforeRequest = 200;
  for (let i = 0; i < moviesBrief.length; i++) {
    let movie = moviesBrief[i];
    if (!movie.comments) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayBeforeRequest);
      });
      const movieDetails = await fetchMovieInfo(movie.id);
      movie = { ...movie, ...movieDetails };
      moviesBrief[i] = movie;
      fs.writeFileSync(filePath, JSON.stringify(moviesBrief, null, 2));
    }
  }
})();
