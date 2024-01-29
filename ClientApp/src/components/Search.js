import React, { Component } from "react";
import { ClipLoader } from "react-spinners";
import { Checkmark } from "react-checkmark";
import Request from "./Request";
import "./Search.css";
import { MovieDetails } from "./MovieDetails";

const Status = {
  ADDED: "Added!",
  PREVIOUSLYADDED: "Available!",
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
      loading: false,
      error: false,
      errorMessage: "",
      request: new Request(Status.PENDING),
      searchResult: null,
    };
  }

  fetchImdbId = async () => {
    this.setState({ loading: true, error: false });
    const url = `https://www.omdbapi.com/?t=${this.state.searchTerm}&apiKey=${Search.omdbApiKey}`;
    const searchState = this.state;
    let result = null;
    await fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.Response === "True") {
          result = data.imdbID;
          console.log(`Found IMDB ID ${result}`);
        } else {
          searchState.error = true;
        }
      })
      .catch((error) => {
        console.error(error.message);
        searchState.error = true;
        searchState.errorMessage = error.message;
      })
      .finally(() => {
        searchState.loading = false;
        this.setState({ searchState });
      });
    return result;
  };

  lookupTitle = async (imdbId) => {
    this.setState({
      loading: true,
      request: this.state.request.startLoading(),
    });
    const url = `https://media.palacpl.us/radarr/api/v3/movie/lookup/imdb?imdbId=${imdbId}&apikey=${Search.radarrApiKey}`;
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
        this.setState({ searchResult: data });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ error: true, errorMessage: error.message });
      })
      .finally(() => {
        this.setState({
          loading: false,
          request: this.state.request.stopLoading(),
        });
      });
    return titleId;
  };

  checkAvailablilty = async (titleId) => {
    this.setState({ request: this.state.request.startLoading() });
    const url = `https://media.palacpl.us/radarr/api/v3/movie?tmdbId=${titleId}&apikey=${Search.radarrApiKey}`;

    await fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.length === 0) {
          console.log(`${titleId} has not been previously added`);
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

  submitRequest = async () => {
    this.setState({ request: this.state.request.startLoading() });

    let url = `https://media.palacpl.us/radarr/api/v3/movie?apikey=${Search.radarrApiKey}`;
    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: this.state.searchResult.tmdbId,
        title: this.state.searchResult.title,
        imdbId: this.state.searchResult.imdbId,
        rootFolderPath: "/movies",
        qualityProfileId: 1,
        monitored: true,
        addOptions: {
          searchForMovie: true,
        },
      }),
    };
    console.log(this.state.searchResult);

    await fetch(url, requestOptions)
      .then((resp) => {
        if (resp.status === 201) {
          return resp.json();
        }
        throw new Error(resp.statusText);
      })
      .then((data) => {
        console.log(`Submitting request ${data}`);
        this.state.request.setCompleted(Status.ADDED);
      })
      .catch((error) => {
        console.error(error.message);
        this.state.request.setError(error.message);
      })
      .finally(() => {
        this.setState({ request: this.state.request.stopLoading() });
      });
  };

  handleSearch = async (event) => {
    event.preventDefault();
    if (this.state.searchTerm.length > 0) {
      let imdbId = await this.fetchImdbId();
      if (!this.state.error && imdbId) {
        await this.lookupTitle(imdbId);
      }
      this.setState({
        searchTerm: "",
        loading: false,
      });
    }
    console.debug(this.state);
  };

  handleChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleRequest = async (event) => {
    event.preventDefault();
    if (this.state.searchResult.tmdbId) {
      this.setState({ request: new Request(Status.PENDING) });
      this.checkAvailablilty(this.state.searchResult.tmdbId);
      if (this.state.request.status === Status.PENDING) {
        await this.submitRequest();
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
            {!this.state.loading ? (
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
        <div id="result">
          {this.state.searchResult &&
          !this.state.loading &&
          !this.state.error ? (
            <MovieDetails data={this.state.searchResult} />
          ) : (
            <h3 class="msg">{this.state.errorMessage}</h3>
          )}
        </div>
        <div className="request-container">
          <span>{!this.state.error && this.state.request.status}</span>
          {this.state.searchResult &&
            !this.state.loading &&
            !this.state.error && [
              <button
                id="request-btn"
                onClick={this.handleRequest}
                hidden={this.state.error || this.state.request.error}
                disabled={
                  this.state.request.success || this.state.request.error
                }
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
