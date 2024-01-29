import React, { Component } from "react";
import "./Queue.css";

export class Library extends Component {
  static DisplayName = Queue.name;
  // static apiKey = process.env.RADARR_API_KEY;
  static ApiKey = "3704858bbcbe4f789f402bcde0d38496";
  static Url = `https://media.palacpl.us/radarr/api/v3/movie?apikey=${Queue.ApiKey}`;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return null;
  }
}
