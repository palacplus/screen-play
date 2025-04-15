import { usePersistedState } from "../hooks/usePersistedState";
import "./LibraryPage.css";
import AddMoviePanel from "../components/AddMoviePanel";
import { Movie } from "@/types/library";
import LibraryShelf from "../components/LibraryShelf";
import GitHubLink from "../components/GitHubLink";
import LibraryStats from "../components/LibraryStats";
import { useState, useEffect } from "react";

export default function LibraryPage() {
    const [posters, setPosters] = usePersistedState<Movie[]>("posters", []);
    const [stats, setStats] = useState({
        totalMovies: posters.length,
        activeUsers: 1200,
        totalHoursWatched: 4500,
        totalRatings: 3200,
        topTitles: ["Inception", "Back To The Future", "Jurassic Park"],
    });
    const [isAddMovieOpen, setIsAddMovieOpen] = useState(false); // State to control popup visibility

    const handleAddMovie = (movie: Movie) => {
        setPosters((prevPosters) => [...prevPosters, movie]);
        setIsAddMovieOpen(false); // Close the popup after adding a movie
    };

    // Update stats whenever the posters array changes
    useEffect(() => {
        setStats((prevStats) => ({
            ...prevStats,
            totalMovies: posters.length,
        }));
    }, [posters]);

    const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains("popup-backdrop")) {
            setIsAddMovieOpen(false);
        }
    };

    return (
        <div className="page lib-page">
            {/* Add Movie Button */}
            <button
                className="add-movie-btn"
                onClick={() => setIsAddMovieOpen(true)}
            >
                +
            </button>

            {/* Add Movie Popup */}
            {isAddMovieOpen && (
                <div
                    className="popup-backdrop"
                    onClick={handlePopupClick} // Close popup on outside click
                >
                    <div className="popup-content add-movie-popup">
                        <AddMoviePanel onAddMovie={handleAddMovie} />
                    </div>
                </div>
            )}

            <div className="main-content">
                <div className="right-side">
                    <LibraryShelf posters={posters} />
                </div>
            </div>
            <GitHubLink />
        </div>
    );
}
