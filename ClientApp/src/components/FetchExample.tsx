import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Post {
    id: number;
    title: string;
}

export default function FetchExample() {
    const [page, setPage] = useState(0);

    const {
        data: posts,
        isError,
        isLoading,
    } = useQuery({
        queryKey: ['posts', { page }],
        queryFn: async () => {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return (await response.json()) as Post[];
        },
    });

    return (
        <div>
            <h1>Posts</h1>
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error loading posts</p>}
            {posts && (
                <ul>
                    {posts.map((post) => (
                        <li key={post.id}>{post.title}</li>
                    ))}
                </ul>
            )}
            <button onClick={() => setPage((prev) => prev - 1)} disabled={page === 0}>
                Previous
            </button>
            <button onClick={() => setPage((prev) => prev + 1)} disabled={!posts || posts.length < 10}>
                Next
            </button>
        </div>
    )
}