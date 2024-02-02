import React from "react";
import { useTimer } from "react-timer-hook";

export default function DownloadTimer({ expiryTimestamp }) {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp,
    onExpire: () => console.debug("download timer expired"),
  });
  return (
    <div className="download-timer">
      <div>
        <span className="clock days">{days > 0 ? days + "d" : ""}</span>{" "}
        <span className="clock">{hours.toString().padStart(2, "0")}</span>
        <span className="clock colon">:</span>
        <span className="clock">{minutes.toString().padStart(2, "0")}</span>
        <span className="clock colon">:</span>
        <span className="clock">{seconds.toString().padStart(2, "0")}</span>
        <span className="clock eta">ETA</span>
      </div>
    </div>
  );
}
