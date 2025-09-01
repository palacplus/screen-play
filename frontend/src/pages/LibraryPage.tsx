import { usePersistedState } from "../hooks/usePersistedState";
import "./LibraryPage.css";
import AddMoviePanel from "../components/AddMoviePanel";
import { MoviePartial } from "@/types/library";
import LibraryShelf from "../components/LibraryShelf";
import GitHubLink from "../components/GitHubLink";
import Popup from "../components/Popup";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllMovies } from "../services/api/library";

export default function LibraryPage() {
    const [posters, setPosters] = usePersistedState<MoviePartial[]>("posters", []);
    const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<MoviePartial | null>(null);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    const handleAddMovie = (movie: MoviePartial) => {
        setPosters((prevPosters) => [...prevPosters, movie]);
        setIsAddMovieOpen(false);
    };

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const movies = await getAllMovies();
                setPosters(movies);
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            }
            setLoading(false);
        };

        fetchMovies();
    }, [setPosters]);

    const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains("popup-backdrop")) {
            setIsAddMovieOpen(false);
        }
    };

    const filteredPosters = useMemo(() => {
        const title = searchParams.get("title")?.toLowerCase();
        if (!title) {
            return posters;
        }
        return posters.filter((poster) => {
            const matchedTitle = title ? poster.title?.toLowerCase().includes(title) : true;
            return matchedTitle;
        });
    }, [posters, searchParams]);

    return (
        <div className="page lib-page">
            <button
                className="add-movie-btn"
                data-testid="add-movie-btn"
                onClick={() => setIsAddMovieOpen(true)}
            >
                +
            </button>
            {isAddMovieOpen && (
                <div
                    className="popup-backdrop"
                    onClick={handlePopupClick}
                >
                    <div className="popup-content add-movie-popup">
                        <AddMoviePanel onAddMovie={handleAddMovie} />
                    </div>
                </div>
            )}

            <div className="main-content">
                <div className="right-side">
                    <LibraryShelf 
                        posters={filteredPosters} 
                        isLoading={loading}
                        onMovieSelect={setSelectedMovie}
                    />
                </div>
            </div>
            
            {selectedMovie && (
                <Popup
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
            
            <GitHubLink />
        </div>
    );
}
