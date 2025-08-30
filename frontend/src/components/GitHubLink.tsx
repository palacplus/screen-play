import "./GitHubLink.css";

export default function GitHubLink() {
    return (
        <div className="github-link">
        <a
          href="https://github.com/mike-palacio-nice/screen-play"
          target="_blank"
          rel="noopener noreferrer"
          className="github-anchor"
        >
          <i className="fab fa-github github-icon"></i>
          GitHub
        </a>
      </div>
    );
}