import { Client, TablesDB, Query, ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);

// Search Count
export async function updateSearchCount(searchTerm, movie) {
  if (!searchTerm?.trim() || !movie?.id) return;

  try {
    const { rows } = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", searchTerm)],
    });

    if (rows.length > 0) {
      await tablesDB.incrementRowColumn({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: rows[0].$id,
        column: "count",
        value: 1,
      });

      return;
    }

    await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data: {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      },
    });
  } catch (error) {
    console.error("Failed to update search count:", error);
  }
}

// Get trending movies
export async function getTrendingMovies() {
  try {
    const { rows } = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.orderDesc("count"),
        Query.limit(5),
      ],
    });

    return rows;
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    return [];
  }
}