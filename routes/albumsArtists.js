import { dbconfig } from "../database.js";
import { Router } from "express";

const albumsArtistsRouter = Router();


albumsArtistsRouter.get("/", async (request, response) => {
    const query = `
      SELECT DISTINCT albums_artists.artist_id, artists.name AS artist_name, albums_artists.album_id
      FROM albums_artists
      INNER JOIN artists ON albums_artists.artist_id = artists.id;
    `;
    try {
      const [results] = await dbconfig.execute(query);
      response.json(results);
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  });

export default albumsArtistsRouter;