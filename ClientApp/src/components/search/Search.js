import React, { Component } from "react";
import { Navigate, Outlet } from "react-router-dom";
import "./Search.css";
import { ClipLoader } from "react-spinners";

export class Search extends Component {
  static omdbApiKey = process.env.REACT_APP_OMDB_API_KEY;
  static radarrApiKey = process.env.REACT_APP_RADARR_API_KEY;

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      loading: false,
      error: false,
      errorMessage: "",
      searchResult: null,
    };
  }

  render() {
    console.debug(this.state);
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
          <Outlet context={this.state} />
          {this.state.searchResult &&
          !this.state.loading &&
          !this.state.error ? (
            <Navigate to={this.state.searchResult.imdbId} />
          ) : (
            <h3 className="msg">{this.state.errorMessage}</h3>
          )}
        </div>
      </div>
    );
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
        this.setState({
          loading: false,
          error: searchState.error,
          errorMessage: searchState.errorMessage,
        });
      });
    return result;
  };

  lookupTitle = async (imdbId) => {
    this.setState({
      loading: true,
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
        });
      });
    return titleId;
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
  };

  handleChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };
}
