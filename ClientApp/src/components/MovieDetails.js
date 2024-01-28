import React, { Component } from "react";

export class MovieDetails extends Component {
  static displayName = MovieDetails.name;

  constructor(props) {
    super(props);
    this.Title = props.data.title;
    this.TmdbId = props.data.tmdbId;
    this.ImdbId = props.data.imdbId;
    this.Certification = props.data.certification;
    this.Rating = props.data.ratings.imdb.value;
    this.Year = props.data.year;
    this.Runtime = props.data.runtime;
    this.Genres = props.data.genres;
    this.Plot = props.data.overview;
    this.Actors = props.data.Actors ?? [];

    if (props.data.images) {
      this.Poster = props.data.images.find(
        (img) => img.coverType === "poster"
      ).url;
    }
    this.AddedTs = Date.parse(props.data.added);
    this.AddedDt = new Date(props.data.addedTs).toLocaleString("en-US", {
      timeZoneName: "short",
    });
  }

  render() {
    // console.log(this.hidden);
    return (
      <div>
        <div className="info">
          <img src={this.Poster} className="poster" alt=""></img>
          <div className="title">
            <h2>{this.Title}</h2>
            <div className="rating">
              <img
                src="https://raw.githubusercontent.com/AsmrProg-YT/100-days-of-javascript/74e652f559e5256d1d7bbdce823c42f7a480830a/Day%20%2311%20-%20Movie%20Info%20App/star-icon.svg"
                alt=""
              ></img>
              <h4>{this.Rating}</h4>
            </div>
            <div className="details">
              <span>{this.Certification}</span>
              <span>{this.Year}</span>
              <span>{this.Runtime} min</span>
            </div>
            <div className="genre">
              {this.Genres.map((genre) => (
                <div>{genre}</div>
              ))}
            </div>
          </div>
        </div>
        <h3>Plot:</h3>
        <p>{this.Plot}</p>
        <p>{this.Actors.join(", ")}</p>
      </div>
    );
  }
}
