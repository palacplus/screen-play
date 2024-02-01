import React, { Component } from "react";

export class MovieDetails extends Component {
  static displayName = MovieDetails.name;

  constructor(props) {
    super(props);
    this.Title = this.props.data.title;
    this.TmdbId = this.props.data.tmdbId;
    this.ImdbId = this.props.data.imdbId;
    this.Certification = props.data.certification;
    this.Rating = props.data.ratings.imdb.value;
    this.Year = props.data.year;
    this.Runtime = props.data.runtime;
    this.Genres = props.data.genres;
    this.Plot = props.data.overview;
    this.Actors = props.data.Actors ?? [];

    if (props.data.images) {
      this.Poster = props.data.images.find((img) => img.coverType === "poster").url;
    }
    this.AddedTs = Date.parse(this.props.data.added);
    this.AddedDt = new Date(this.props.data.addedTs).toLocaleString("en-US", {
      timeZoneName: "short",
    });
  }

  render() {
    return (
      <div>
        <div className="info">
          <img
            src={this.props.data.images ? this.props.data.images.find((img) => img.coverType === "poster").url : ""}
            className="poster"
            alt=""
          ></img>
          <div className="title">
            <h2>{this.props.data.title}</h2>
            <div className="rating">
              <img
                src="https://raw.githubusercontent.com/AsmrProg-YT/100-days-of-javascript/74e652f559e5256d1d7bbdce823c42f7a480830a/Day%20%2311%20-%20Movie%20Info%20App/star-icon.svg"
                alt=""
              ></img>
              <h4>{this.props.data.ratings.imdb.value}</h4>
            </div>
            <div className="details">
              <span>{this.props.data.certification}</span>
              <span>{this.props.data.year}</span>
              <span>{this.props.data.runtime} min</span>
            </div>
            <div className="genre">
              {this.props.data.genres.map((genre, index) => (
                <div key={index}>{genre}</div>
              ))}
            </div>
          </div>
        </div>
        <h3>Plot:</h3>
        <div className="overview">
          <p>{this.props.data.overview}</p>
          <p>{this.props.data.actors ? this.this.props.data.actors.join(", ") : []}</p>
        </div>
      </div>
    );
  }
}
