import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
    .append(new ElementBuilder("img").with("src", movie.Poster))
    .append(new ElementBuilder("h1").text(movie.Title))
    .append(new ElementBuilder("p")
      .append(new ElementBuilder("button").text("Edit")
        .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
    .append(new ParagraphBuilder().items(
      "Runtime " + formatRuntime(movie.Runtime),
      "\u2022",
      "Released on " + new Date(movie.Released).toLocaleDateString("en-US")))
    .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
    .append(new ElementBuilder("p").text(movie.Plot))
    .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
    .append(new ListBuilder().items(movie.Directors))
    .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
    .append(new ListBuilder().items(movie.Writers))
    .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
    .append(new ListBuilder().items(movie.Actors))
    .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.firstChild) {
      mainElement.firstChild.remove();
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText);
      movies.forEach(movie => appendMovie(movie, mainElement));
    }
  };

  const url = new URL("/movies", location.href);

  if (genre) {
    url.searchParams.set("genre", genre);
  }

  xhr.open("GET", url);
  xhr.send();
}

window.onload = function () {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);

      // ALL Button
      const allBtn = document.createElement("button");
      allBtn.textContent = "All";
      allBtn.onclick = () => loadMovies();

      const allLi = document.createElement("li");
      allLi.appendChild(allBtn);
      listElement.appendChild(allLi);

      // Genre Buttons
      genres.forEach(genre => {
        const btn = document.createElement("button");
        btn.textContent = genre;
        btn.onclick = () => loadMovies(genre);

        const li = document.createElement("li");
        li.appendChild(btn);
        listElement.appendChild(li);
      });

      // Auto click first
      const firstButton = document.querySelector("nav button");
      if (firstButton) firstButton.click();
    }
  };

  xhr.open("GET", "/genres");
  xhr.send();
};