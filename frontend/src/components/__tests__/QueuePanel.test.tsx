import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import QueuePanel from "../QueuePanel";
import { getQueue } from "../../services/api/library";
import { QueueResponse, QueueItem } from "../../types/library";

// Mock the API service
jest.mock("../../services/api/library");
const mockedGetQueue = getQueue as jest.MockedFunction<typeof getQueue>;

// Mock timers for auto-refresh functionality
jest.useFakeTimers();

const mockQueueItem: QueueItem = {
    movieId: 1,
    status: "downloading",
    quality: {
        quality: {
            id: 1,
            name: "HD-1080p",
            source: "radarr"
        }
    },
    size: 2147483648, // 2GB
    sizeleft: 1073741824, // 1GB
    estimatedCompletionTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    added: new Date().toISOString(),
    movie: {
        id: 1,
        imdbId: "tt1375666",
        tmdbId: 27205,
        title: "Inception",
        year: 2010,
        description: "A mind-bending thriller about dreams within dreams.",
        rated: "PG-13",
        fileName: "Inception.2010.1080p.BluRay.x264-GROUP",
        originalTitle: "Inception",
        language: "English",
        sortTitle: "inception",
        sizeOnDisk: 2147483648,
        status: "downloaded",
        releaseDate: "2010-07-16",
        images: [{
            id: 1,
            movieId: 1,
            coverType: "poster",
            url: "/api/v1/movies/1/images/poster",
            remoteUrl: "https://example.com/inception-poster.jpg"
        }],
        youTubeTrailerId: "YoHD9XEInc0",
        studio: "Warner Bros",
        path: "/movies/Inception (2010)",
        qualityProfileId: 1,
        hasFile: true,
        monitored: true,
        minimumAvailability: "inCinemas",
        isAvailable: true,
        folderName: "Inception (2010)",
        runtime: 148,
        cleanTitle: "inception",
        titleSlug: "inception-27205",
        rootFolderPath: "/movies",
        genres: ["Action", "Adventure", "Sci-Fi"],
        tags: [],
        added: new Date().toISOString(),
        ratings: [
            {
                id: 1,
                movieId: 1,
                source: "imdb",
                votes: 2000000,
                value: 8.8,
                type: "user"
            }
        ],
        popularity: 85.5,
        director: "Christopher Nolan",
        actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
        writers: ["Christopher Nolan"],
        country: "USA",
        awards: "Oscar Nominated",
        boxOffice: "$836,836,967",
        isDeleted: false,
        deletedDate: null,
        updatedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        isComplete: true
    }
};

const mockQueueResponse: QueueResponse = {
    items: [mockQueueItem]
};

const emptyQueueResponse: QueueResponse = {
    items: []
};

describe("QueuePanel Component", () => {
    let consoleErrorSpy: jest.SpyInstance | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        consoleErrorSpy = undefined;
    });

    afterEach(async () => {
        // Clean up any spies
        if (consoleErrorSpy) {
            consoleErrorSpy.mockRestore();
            consoleErrorSpy = undefined;
        }
        
        await act(async () => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
        jest.useFakeTimers();
    });

    test("should render loading state initially", () => {
        mockedGetQueue.mockImplementation(() => new Promise(() => {})); // Never resolves
        render(<QueuePanel />);
        
        expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });

    test("should render empty queue state when no items", async () => {
        mockedGetQueue.mockResolvedValue(emptyQueueResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("Queue is empty")).toBeInTheDocument();
        });
        
        expect(screen.getByText("📭")).toBeInTheDocument();
        expect(screen.getByText("No movies are currently being downloaded.")).toBeInTheDocument();
        expect(screen.getByText("Download Queue")).toBeInTheDocument();
        expect(screen.getByTestId("queue-count")).toHaveTextContent("0");
    });

    test("should render queue items when data is available", async () => {
        mockedGetQueue.mockResolvedValue(mockQueueResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("Download Queue")).toBeInTheDocument();
            expect(screen.getByTestId("queue-count")).toHaveTextContent("1");
        });
        
        // Check movie details
        expect(screen.getByText("Inception")).toBeInTheDocument();
        expect(screen.getByText("2010")).toBeInTheDocument();
        expect(screen.getByText("148 min")).toBeInTheDocument();
        expect(screen.getByText("Action, Adventure, Sci-Fi")).toBeInTheDocument();
        
        // Check quality and size
        expect(screen.getByText("HD-1080p")).toBeInTheDocument();
        expect(screen.getByText("2 GB")).toBeInTheDocument();
        
        // Check status badge
        expect(screen.getByText("downloading")).toBeInTheDocument();
        
        // Check progress info
        expect(screen.getByText("50% complete")).toBeInTheDocument();
        expect(screen.getByText("1 GB remaining")).toBeInTheDocument();
    });

    test("should display correct progress calculation", async () => {
        const customQueueItem = {
            ...mockQueueItem,
            size: 1000000000, // 1GB
            sizeleft: 250000000  // 250MB
        };
        
        const customResponse: QueueResponse = {
            ...mockQueueResponse,
            items: [customQueueItem]
        };
        
        mockedGetQueue.mockResolvedValue(customResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("75% complete")).toBeInTheDocument();
        });
    });

    test("should render multiple queue items sorted by added date", async () => {
        const olderItem: QueueItem = {
            ...mockQueueItem,
            movieId: 2,
            added: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            movie: {
                ...mockQueueItem.movie,
                title: "The Matrix"
            }
        };
        
        const newerItem: QueueItem = {
            ...mockQueueItem,
            movieId: 3,
            added: new Date().toISOString(), // Now
            movie: {
                ...mockQueueItem.movie,
                title: "Interstellar"
            }
        };
        
        const multipleItemsResponse: QueueResponse = {
            items: [olderItem, newerItem] // Older first in response
        };
        
        mockedGetQueue.mockResolvedValue(multipleItemsResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("Download Queue")).toBeInTheDocument();
            expect(screen.getByTestId("queue-count")).toHaveTextContent("2");
        });
        
        const movieTitles = screen.getAllByRole("heading", { level: 3 });
        expect(movieTitles[0]).toHaveTextContent("Interstellar"); // Newer item first
        expect(movieTitles[1]).toHaveTextContent("The Matrix"); // Older item second
    });

    test("should handle different queue item statuses", async () => {
        const pausedItem: QueueItem = {
            ...mockQueueItem,
            status: "paused"
        };
        
        const pausedResponse: QueueResponse = {
            ...mockQueueResponse,
            items: [pausedItem]
        };
        
        mockedGetQueue.mockResolvedValue(pausedResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("paused")).toBeInTheDocument();
        });
    });

    test("should handle poster image error with placeholder", async () => {
        const itemWithBadPoster: QueueItem = {
            ...mockQueueItem,
            movie: {
                ...mockQueueItem.movie,
                images: [{
                    id: 1,
                    movieId: 1,
                    coverType: "poster",
                    url: "/api/v1/movies/1/images/poster",
                    remoteUrl: "invalid-url"
                }]
            }
        };
        
        const response: QueueResponse = {
            items: [itemWithBadPoster]
        };
        
        mockedGetQueue.mockResolvedValue(response);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            const posterImage = screen.getByAltText("Inception poster");
            expect(posterImage).toBeInTheDocument();
            
            // Simulate image error
            fireEvent.error(posterImage);
            
            expect(posterImage).toHaveAttribute("src", expect.stringContaining("data:image/svg+xml"));
        });
    });

    test("should refresh data when refresh button is clicked", async () => {
        mockedGetQueue.mockResolvedValue(mockQueueResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("Download Queue")).toBeInTheDocument();
            expect(screen.getByTestId("queue-count")).toHaveTextContent("1");
        });
        
        expect(mockedGetQueue).toHaveBeenCalledTimes(1);
        
        const refreshButton = screen.getByText("Refresh");
        
        await act(async () => {
            fireEvent.click(refreshButton);
        });
        
        await waitFor(() => {
            expect(mockedGetQueue).toHaveBeenCalledTimes(2);
        });
    });

    test("should handle API errors gracefully", async () => {
        // Suppress console.error for this test since we're intentionally causing an error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        mockedGetQueue.mockRejectedValue(new Error("Network error"));
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("Failed to load queue. Please try again later.")).toBeInTheDocument();
        });
        
        expect(screen.getByText("🔄 Retry")).toBeInTheDocument();
    });

    test("should retry API call when retry button is clicked after error", async () => {
        // Suppress console.error for this test since we're intentionally causing an error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        mockedGetQueue.mockRejectedValueOnce(new Error("Network error"));
        mockedGetQueue.mockResolvedValueOnce(mockQueueResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("Failed to load queue. Please try again later.")).toBeInTheDocument();
        });
        
        const retryButton = screen.getByText("🔄 Retry");
        
        await act(async () => {
            fireEvent.click(retryButton);
        });
        
        await waitFor(() => {
            expect(screen.getByText("Download Queue")).toBeInTheDocument();
            expect(screen.getByTestId("queue-count")).toHaveTextContent("1");
        });
    });

    test("should auto-refresh data at specified interval", async () => {
        mockedGetQueue.mockResolvedValue(mockQueueResponse);
        
        render(<QueuePanel refreshInterval={5000} />);
        
        await waitFor(() => {
            expect(mockedGetQueue).toHaveBeenCalledTimes(1);
        });
        
        // Fast-forward time by 5 seconds
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });
        
        await waitFor(() => {
            expect(mockedGetQueue).toHaveBeenCalledTimes(2);
        });
        
        // Fast-forward time by another 5 seconds
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });
        
        await waitFor(() => {
            expect(mockedGetQueue).toHaveBeenCalledTimes(3);
        });
    });

    test("should display last updated timestamp", async () => {
        mockedGetQueue.mockResolvedValue(mockQueueResponse);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
        });
    });

    test("should format file sizes correctly", async () => {
        const itemWithVariousSizes: QueueItem = {
            ...mockQueueItem,
            size: 1073741824, // 1GB
            sizeleft: 536870912  // 512MB
        };
        
        const response: QueueResponse = {
            ...mockQueueResponse,
            items: [itemWithVariousSizes]
        };
        
        mockedGetQueue.mockResolvedValue(response);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("1 GB")).toBeInTheDocument();
            expect(screen.getByText("512 MB remaining")).toBeInTheDocument();
        });
    });

    test("should format estimated completion time correctly", async () => {
        const futureTime = new Date(Date.now() + 7260000); // 2 hours and 1 minute from now
        const itemWithEta: QueueItem = {
            ...mockQueueItem,
            estimatedCompletionTime: futureTime.toISOString()
        };
        
        const response: QueueResponse = {
            ...mockQueueResponse,
            items: [itemWithEta]
        };
        
        mockedGetQueue.mockResolvedValue(response);
        
        render(<QueuePanel />);
        
        await waitFor(() => {
            expect(screen.getByText("2h 0m remaining")).toBeInTheDocument();
        });
    });
});
