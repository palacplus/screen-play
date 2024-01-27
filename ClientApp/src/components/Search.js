import React, { Component } from "react";
import { ClipLoader } from "react-spinners";
import { Checkmark } from "react-checkmark";
import Request from "./Request";
import "./Search.css";

const Status = {
  ADDED: "Added!",
  PREVIOUSLYADDED: "Already available!",
  PENDING: "",
};

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
      request: new Request(Status.PENDING),
      searchResult: null,
    };
  }

  fetchResults = async () => {
    this.setState({ search: { loading: true, error: null } });
    let result = document.getElementById("result");

    let url = `https://www.omdbapi.com/?t=${this.state.searchTerm}&apiKey=${Search.omdbApiKey}`;

    let searchState = this.state.search;
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
          searchState.error = data.Error;
        }
      })
      .catch((error) => {
        console.error(error.message);
        result.innerHTML = `<h3 class="msg">Error Occured</h3>`;
        searchState.error = error;
      })
      .finally(() => {
        searchState.loading = false;
        this.setState({ search: searchState });
      });
  };

  fetchTitleId = async () => {
    this.setState({ request: this.state.request.startLoading() });

    let url = `https://media.palacpl.us/radarr/api/v3/movie/lookup/imdb?imdbId=${this.state.searchResult.imdbID}&apikey=${Search.radarrApiKey}`;
    let titleId = null;

    await fetch(url)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error("Not Found");
        }
        return resp.json();
      })
      .then((data) => {
        titleId = data.tmdbId;
      })
      .catch((error) => {
        console.error(error);
        this.state.request.setError(error.message);
      })
      .finally(() => {
        this.setState({ request: this.state.request.stopLoading() });
      });
    return titleId;
  };

  checkForTitle = async (titleId) => {
    this.setState({ request: this.state.request.startLoading() });

    let url = `https://media.palacpl.us/radarr/api/v3/movie?tmdbId=${titleId}&apikey=${Search.radarrApiKey}`;

    await fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.length === 0) {
          return;
        }
        if (data[0].monitored && data[0].hasFile) {
          this.state.request.setCompleted(Status.PREVIOUSLYADDED);
        }
      })
      .catch((error) => {
        console.error(error);
        this.state.request.setError();
      })
      .finally(() => {
        this.setState({ request: this.state.request.stopLoading() });
      });
  };

  submitRequest = async (titleId) => {
    this.setState({ request: this.state.request.startLoading() });

    let url = `https://media.palacpl.us/radarr/api/v3/movie?apikey=${Search.radarrApiKey}`;
    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: titleId,
        title: this.state.searchResult.Title,
        imdbId: this.state.searchResult.imdbID,
        rootFolderPath: "/movies",
        qualityProfileId: 1,
        monitored: true,
        addOptions: {
          searchForMovie: true,
        },
      }),
    };

    await fetch(url, requestOptions)
      .then((resp) => {
        if (resp.status === 201) {
          return resp.json();
        }
        throw new Error(resp.statusText);
      })
      .then((data) => {
        console.log(data);
        this.state.request.setCompleted(Status.ADDED);
      })
      .catch((error) => {
        console.error(error.message);
        this.state.request.setError(error.message);
      })
      .finally(() => {
        this.setState({ request: this.state.request.stopLoading() });
      });
    this.setState({ request: { loading: false, success: true } });
  };

  handleSearch = async (event) => {
    event.preventDefault();
    this.setState({ request: new Request(Status.PENDING) });
    await this.fetchResults();
    this.setState({ searchTerm: "" });
  };

  handleChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleRequest = async (event) => {
    event.preventDefault();
    let titleId = await this.fetchTitleId();
    if (titleId) {
      console.log(`Found title with ID ${titleId}`);
      await this.checkForTitle(titleId);

      if (this.state.request.status === Status.PENDING) {
        await this.submitRequest(titleId);
      }
    }

    console.log(this.state.request);
    // spin off task to add title to DB
  };

  render() {
    return (
      <div className="component-container" id="container">
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
          <button id="search-btn" onClick={this.handleSearch}>
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
          <span>{this.state.request.status}</span>
          {this.state.searchResult && [
            <button
              id="request-btn"
              onClick={this.handleRequest}
              disabled={this.state.request.success}
            >
              {!this.state.request.loading ? (
                this.state.request.success ? (
                  <Checkmark id="checkmark" size="medium" color="#4ea345" />
                ) : (
                  "Add this title"
                )
              ) : (
                <ClipLoader
                  className="btn-spinner"
                  color="#1c1917"
                  loading={this.state.request.loading}
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
