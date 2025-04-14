import Poster, { PosterProps } from "./Poster";

interface LibraryShelfProps {
  posters: PosterProps[];
}

export default function LibraryShelf({ posters }: LibraryShelfProps) {
  // Sort posters by addedDate in descending order (most recent first)
  const sortedPosters = [...posters].sort(
    (a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
  );

  // Split posters into rows of 5
  const rows = [];
  for (let i = 0; i < sortedPosters.length; i += 5) {
    rows.push(sortedPosters.slice(i, i + 5));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem",
            backgroundColor: "#1c1917", // Match the existing background color
            borderRadius: "8px", // Add rounded corners for a shelf-like feel
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
          }}
        >
          {row.map((poster, index) => (
            <div key={index} style={{ flex: 1, minWidth: "200px" }}>
              <Poster
                imageUrl={poster.imageUrl}
                title={poster.title}
                description={poster.description}
                addedDate={poster.addedDate}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}