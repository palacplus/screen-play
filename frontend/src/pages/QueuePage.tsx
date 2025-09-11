import QueuePanel from "@/components/QueuePanel";
import "./QueuePage.css";

export default function QueuePage() {
    return (
        <div className="queue-page">
            <QueuePanel refreshInterval={30000} />
        </div>
    );
}
