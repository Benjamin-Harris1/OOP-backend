import { dbconfig } from "../database.js";
import { Router } from "express";

const albumsTracksRouter = Router();

albumsTracksRouter.get("/", async (request, response) => {
    const query = `
    SELECT tracks_albums.track_id, tracks_albums.album_id, albums.title AS album_title
    FROM tracks_albums
    INNER JOIN albums ON tracks_albums.album_id = albums.id
  `;
  try {
    const [results] = await dbconfig.execute(query);
    response.json(results);
  } catch (error) {
    response.status(500).json({ error: "Internal server error" });
  }
});

export default albumsTracksRouter;