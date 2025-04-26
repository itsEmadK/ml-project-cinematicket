const { parse } = require("json2csv");
const fs = require("fs");

const movies = JSON.parse(fs.readFileSync("movies.json", "utf8"));
const moviesNoComments = JSON.parse(
  fs.readFileSync("movies-no-comments.json", "utf8")
);

const flattenedMovies = movies.map((movie) => {
  return {
    ...movie,
    directors: (movie.directors ?? []).join(", ") || "",
    genres: (movie.genres ?? []).join(", ") || "",
    actors: (movie.actors ?? []).join(", ") || "",
    writers: (movie.writers ?? []).join(", ") || "",
    comments: (movie.comments ?? []).join(", ") || "",
  };
});

const flattenedMoviesNoComments = moviesNoComments.map((movie) => {
  return {
    ...movie,
    directors: (movie.directors ?? []).join(", ") || "",
    genres: (movie.genres ?? []).join(", ") || "",
    actors: (movie.actors ?? []).join(", ") || "",
    writers: (movie.writers ?? []).join(", ") || "",
  };
});

const moviesCSV = parse(flattenedMovies);
const moviesNoCommentsCSV = parse(flattenedMoviesNoComments);
fs.writeFileSync("movies.csv", moviesCSV, { encoding: "utf8" });
fs.writeFileSync("movies-no-comments.csv", moviesNoCommentsCSV, {
  encoding: "utf8",
});
