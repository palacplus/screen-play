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
        <span>{days > 0 ? days + "d" : ""}</span>{" "}
        <span>{hours.toString().padStart(2, "0")}</span>:
        <span>{minutes.toString().padStart(2, "0")}</span>:
        <span>{seconds.toString().padStart(2, "0")}</span>
        <span className="eta">ETA</span>
      </div>
    </div>
  );
}
