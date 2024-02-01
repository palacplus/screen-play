import { Component } from "react";
import "./Search.css";
import MovieRequest from "./MovieRequest";
import { MovieDetails } from "../MovieDetails";
import { Status } from "./SearchConstants";
import { ClipLoader } from "react-spinners";
import { Checkmark } from "react-checkmark";
import { withLocation } from "../Wrappers";

class SearchResult extends Component {
  static radarrApiKey = process.env.REACT_APP_RADARR_API_KEY;

  constructor(props) {
    super(props);
    this.state = {
      request: new MovieRequest(Status.PENDING),
      loading: false,
      error: false,
      errorMessage: "",
    };
  }

  render() {
    const data = this.props.location.state;
    console.debug(data);
    return (
      <div className="result">
        <MovieDetails data={data} />
        <div className="request-container">
          <span>{!this.state.error && this.state.request.status}</span>
          {data && !this.state.loading && !this.state.error && (
            <button
              id="request-btn"
              onClick={this.handleRequest}
              hidden={this.state.error || this.state.request.error}
              disabled={this.state.request.success || this.state.request.error}
            >
              {!this.state.request.loading ? (
                this.state.request.success ? (
                  <Checkmark id="checkmark" size="medium" color="#4ea345" />
                ) : (
                  "Add this title"
                )
              ) : (
                <ClipLoader className="btn-spinner" color="#1c1917" loading={this.state.request.loading} size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  handleRequest = async (event) => {
    event.preventDefault();
    if (this.state.data.tmdbId) {
      this.setState({ request: new Request(Status.PENDING) });
      this.checkAvailablilty(this.state.data.tmdbId);
      if (this.state.request.status === Status.PENDING) {
        await this.submitRequest();
      }
    }
    console.log(this.state.request);
  };

  checkAvailablilty = async (titleId) => {
    this.setState({ request: this.state.request.startLoading() });
    const url = `https://media.palacpl.us/radarr/api/v3/movie?tmdbId=${titleId}&apikey=${SearchResult.radarrApiKey}`;

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

    let url = `https://media.palacpl.us/radarr/api/v3/movie?apikey=${SearchResult.radarrApiKey}`;
    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: this.state.data.tmdbId,
        title: this.state.data.title,
        imdbId: this.state.data.imdbId,
        rootFolderPath: "/movies",
        qualityProfileId: 1,
        monitored: true,
        addOptions: {
          searchForMovie: true,
        },
      }),
    };
    console.log(this.state.data);

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
}
const SearchResultWrapped = withLocation(SearchResult);
export default SearchResultWrapped;
