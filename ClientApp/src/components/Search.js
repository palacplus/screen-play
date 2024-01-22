import React, { Component } from "react";
import { ClipLoader } from "react-spinners";
import { Checkmark } from "react-checkmark";
import "./Search.css";

export class Search extends Component {
  static displayName = Search.name;
  // static omdbApiKey = process.env.OMDB_API_KEY;
  // static radarrApiKey = process.env.RADARR_API_KEY;
  static omdbApiKey = "e11f806f";
  static radarrApiKey = "3704858bbcbe4f789f402bcde0d38496";

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      search: { loading: false, error: null },
      request: { loading: false, error: null, success: false },
      searchResult: null,
    };
  }

  fetchResults = async () => {
    this.setState({ search: { loading: true, error: null } });
    let result = document.getElementById("result");

    let url = `https://www.omdbapi.com/?t=${this.state.searchTerm}&apiKey=${Search.omdbApiKey}`;

    await fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.Response === "True") {
          this.setState({ searchResult: data });
          result.innerHTML = `
              <div class="info">
                  <img src=${data.Poster} class="poster">
                  <div class="title">
                      <h2>${data.Title}</h2>
                      <div class="rating">
                          <img src="https://raw.githubusercontent.com/AsmrProg-YT/100-days-of-javascript/74e652f559e5256d1d7bbdce823c42f7a480830a/Day%20%2311%20-%20Movie%20Info%20App/star-icon.svg"></img>
                          <h4>${data.imdbRating}</h4>
                      </div>
                      <div class="details">
                          <span>${data.Rated}</span>
                          <span>${data.Year}</span>
                          <span>${data.Runtime}</span>
                      </div>
                      <div class="genre">
                          <div>${data.Genre.split(",").join(
                            "</div><div>"
                          )}</div>
                      </div>
                  </div>
              </div>
              <h3>Plot:</h3>
              <p>${data.Plot}</p>
              <h3>Cast:</h3>
              <p>${data.Actors}</p>
          `;
        } else {
          result.innerHTML = `<h3 class="msg">${data.Error}</h3>`;
          this.setState({ search: { error: data.Error } });
        }
      })
      .catch((error) => {
        result.innerHTML = `<h3 class="msg">Error Occured</h3>`;
        this.setState({ search: { error: error } });
      })
      .finally(() => {
        this.setState({ search: { loading: false } });
      });
  };

  fetchTitleId = async () => {
    this.setState({ request: { loading: true, error: null } });

    let url = `https://media.palacpl.us/radarr/api/v3/movie/lookup/imdb?imdbId=${this.state.searchResult.imdbID}&apikey=${Search.radarrApiKey}`;
    let titleId = null;
    // await fetch(url)
    //   .then((resp) => resp.json())
    //   .then((data) => {
    //     titleId = data.tmdbId;
    //   })
    //   .catch((error) => {
    //     this.setState({ request: { error: error } });
    //     console.log(this.state.request.error);
    //   })
    //   .finally(() => {
    //     this.setState({ request: { loading: false } });
    //   });
    return titleId;
  };

  submitRequest = async (titleId) => {
    this.setState({ request: { loading: true, error: null } });

    let url = `https://media.palacpl.us/radarr/api/v3/movie?apikey=${Search.radarrApiKey}`;
    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: titleId,
        title: this.state.searchResult.Title,
        imdbId: this.state.searchResult.imdbID,
        rootFolderPath: "/movies",
        path: `/${
          this.state.searchResult.Year
        }.${this.state.searchResult.Title.toUpperCase()}`,
        qualityProfileId: 1,
        monitored: true,
        addOptions: {
          searchForMovie: true,
        },
      }),
    };
    // await fetch(url, requestOptions)
    //   .then((resp) => {
    //     if (resp.status === 201) {
    //       return resp.json();
    //     }
    //     throw new Error(resp.statusText);
    //   })
    //   .then((data) => {
    //     this.setState({ request: { success: true } });
    //   })
    //   .catch((error) => {
    //     this.setState({ request: { error: error } });
    //   })
    //   .finally(() => {
    //     this.setState({ request: { loading: false } });
    //   });
    this.setState({ request: { loading: false, success: true } });
  };

  handleSearch = async (event) => {
    event.preventDefault();
    await this.fetchResults();
  };

  handleChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleRequest = async (event) => {
    event.preventDefault();
    let titleId = await this.fetchTitleId();
    // Check local DB to see if title has already been added
    await this.submitRequest(titleId);
    // spin off task to add title to DB
  };

  render() {
    return (
      <div className="component-container" id="container">
        <h1>{this.displayName}</h1>
        <div className="search-container">
          <input
            type="text"
            id="movie-name"
            placeholder="Enter movie name here..."
            value={this.state.searchTerm}
            onChange={this.handleChange}
            onKeyUp={(e) => {
              if (e.key === "Enter") this.handleSearch(e);
            }}
          ></input>
          <button id="search-btn" onClick={this.handleSubmit}>
            {!this.state.search.loading ? (
              "Search"
            ) : (
              <ClipLoader
                className="btn-spinner"
                color="#1c1917"
                loading={this.state.loading}
                size={18}
              />
            )}
          </button>
        </div>
        <div id="result"></div>
        <div className="request-container">
          <div id="request">
            {this.state.request.success && (
              <Checkmark id="checkmark" size="medium" />
            )}
          </div>
          {this.state.searchResult && [
            <button id="request-btn" onClick={this.handleRequest}>
              {!this.state.request.loading ? (
                "Add this title"
              ) : (
                <ClipLoader
                  className="btn-spinner"
                  color="#1c1917"
                  loading={this.state.loading}
                  size={18}
                />
              )}
            </button>,
          ]}
        </div>
      </div>
    );
  }
}
