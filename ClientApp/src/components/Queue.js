import React, { Component } from "react";
import { Oval } from "react-loader-spinner";
import { ProgressBar } from "react-bootstrap";
import DownloadTimer from "./DownloadTimer";
import "./Queue.css";

export class Queue extends Component {
  static DisplayName = Queue.name;
  // static apiKey = process.env.RADARR_API_KEY;
  static ApiKey = "3704858bbcbe4f789f402bcde0d38496";
  static Url = `https://media.palacpl.us/radarr/api/v3/queue?apikey=${Queue.ApiKey}&pageSize=20&sortKey=added&sortDirection=descending`;

  constructor(props) {
    super(props);
    this.state = { downloads: [], loading: true, error: null, timedOut: false };
  }

  componentDidMount() {
    this.fetchQueueData();
    this.updateTimeoutId = setTimeout(this.fetchQueueData, 1000);
    this.intervalId = setInterval(this.fetchQueueData, 3000);
    this.timeoutId = setTimeout(() => {
      this.setState({
        timedOut: true,
        error: "Unable to load queue. Please check again later.",
      });
      clearInterval(this.intervalId);
    }, 8000);
  }

  componentWillUnmount() {
    clearTimeout(this.updateTimeoutId);
    clearInterval(this.intervalId); // Clear interval to prevent memory leaks
    clearTimeout(this.timeoutId);
  }

  static renderQueueTable(downloads) {
    return (
      <table className="table queue-table">
        <tbody>
          {downloads.map((download) => (
            <tr key={download.id}>
              <td>
                <img src={download.poster} alt=""></img>
              </td>
              <td>
                <ProgressBar
                  animated={download.percent < 100}
                  now={download.percent}
                  variant={download.percent < 100 ? "" : "success"}
                  label={download.percent === 100 ? "✔ Completed" : ""}
                />
                <header>
                  <h4>{download.title}</h4>

                  <div
                    className="quality"
                    style={{
                      color: Queue.resolutionColor(
                        download.quality.quality.resolution
                      ),
                      borderColor: Queue.resolutionColor(
                        download.quality.quality.resolution
                      ),
                    }}
                  >
                    {download.quality.quality.name}
                  </div>
                </header>
                <div className="content">
                  <div className="details">
                    <span>{download.rated}</span>
                    <span>{download.year}</span>
                    <span>{download.runtime} min</span>
                  </div>
                  <DownloadTimer
                    expiryTimestamp={Queue.convertToDate(download.timeleft)}
                  />
                </div>
                <footer>
                  <div className="added">
                    <span>{download.addedDt}</span>
                  </div>
                </footer>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <div className="queue-container">
        {this.state.downloads.length === 0 ? (
          this.state.timedOut ? (
            <h3>{this.state.error}</h3>
          ) : (
            <Oval
              visible={true}
              height="80"
              width="80"
              color="white"
              secondaryColor="#ffb92a"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass="spinner"
            />
          )
        ) : (
          Queue.renderQueueTable(this.state.downloads)
        )}
      </div>
    );
  }

  static resolutionColor(resolution) {
    switch (resolution) {
      case 2160:
        return "#d6c540";
      case 1080:
        return "#C0C0C0";
      default:
        return "#CD7F32";
    }
  }

  static convertToDate(timeLeft) {
    if (!timeLeft) return new Date();
    var tsArray = timeLeft.split(".");
    var days = 0;
    if (tsArray.length > 1) {
      days = parseInt(tsArray[0]);
      tsArray = tsArray[1];
    } else {
      tsArray = tsArray[0];
    }
    tsArray = tsArray.split(":");

    var dt = new Date();
    var hours = dt.getHours() + parseInt(tsArray[0]) + days * 24;
    var minutes = dt.getMinutes() + parseInt(tsArray[1]);
    var seconds = dt.getSeconds() + parseInt(tsArray[2]);
    dt.setHours(hours, minutes, seconds);
    return dt;
  }

  fetchQueueData = async () => {
    this.setState({ loading: true });
    let records = [];
    await fetch(Queue.Url)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(resp.text);
        }
        return resp.json();
      })
      .then((data) => {
        if (data.records.length === 0) {
          throw new Error("Not Available");
        }
        records = data.records;
        clearTimeout(this.timeoutId);
      })
      .catch((error) => {
        console.error(error);
        this.setState({ error: error.message });
      });
    records = await this.updateQueueData(records);
    records.sort((a, b) => b.addedTs - a.addedTs);
    if (this.state.error === null) {
      this.setState({ loading: false, downloads: records });
    }
  };

  updateQueueData = async (records) => {
    let updates = [];
    updates = await records.reverse().reduce(async (acc, record) => {
      let arr = await acc;
      let stored = this.state.downloads.find(({ id }) => id === record.id);
      if (stored) {
        stored.percent =
          100 - Math.round((record.sizeleft / record.size) * 100);
        arr.push(stored);
      } else {
        record = await this.fetchDetails(record);
        if (record) {
          arr.push(record);
        }
      }
      return arr;
    }, Promise.resolve([]));
    return updates;
  };

  fetchDetails = async (record) => {
    let url = `https://media.palacpl.us/radarr/api/v3/movie/${record.movieId}?apikey=${Queue.ApiKey}`;
    await fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data) {
          record.title = data.title;
          if (data.images) {
            record.poster = data.images.find(
              (img) => img.coverType === "poster"
            ).remoteUrl;
          }
          record.addedTs = Date.parse(data.added);
          record.addedDt = new Date(record.addedTs).toLocaleString("en-US", {
            timeZoneName: "short",
          });
          record.year = data.year;
          record.rated = data.certification;
          record.runtime = data.runtime;
          if (data.title === "Not Found") {
            record = null;
          }
        } else {
          record = null;
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: error });
      });
    return record;
  };
}
