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

    const handleAddMovie = (movie: Movie) => {
        setPosters((prevPosters) => [...prevPosters, movie]);
    };

    // Update stats whenever the posters array changes
    useEffect(() => {
        setStats((prevStats) => ({
            ...prevStats,
            totalMovies: posters.length,
        }));
    }, [posters]);

    return (
        <div className="page lib-page">
            <div className="main-content">
                <div className="left-side">
                    <AddMoviePanel onAddMovie={handleAddMovie} />
                    <LibraryStats {...stats} />
                </div>
                <div className="right-side">
                    <LibraryShelf posters={posters} />
                </div>
            </div>
            <GitHubLink />
        </div>
    );
}
