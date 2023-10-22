import { Router } from "express";
import { dbconfig } from "../database.js";

const albumsRouter = Router();

// SKAL LAVES TIL mysql/promises SYNTAX LIGESOM DER ER GJORT I ARTISTS.JS

albumsRouter.get("/", async (request, response) => {
  const query = "SELECT * FROM albums ORDER BY title;";

  const [results] = await dbconfig.execute(query);
  response.json(results);
});

albumsRouter.get("/:id", async (request, response) => {
  const id = Number(request.params.id);
  const query = "SELECT * FROM albums WHERE id=?;";
  const values = [id];

  const [results] = await dbconfig.execute(query, values);
  response.json(results);
});

// posts an album and associates it with an artist format: {title:string, release_date:string, artist_id:int}
albumsRouter.post("/", async (request, response) => {
  console.log("album post");
  const album = request.body;
  const albumQuery = /*SQL*/ `
    INSERT INTO albums (title, release_date)
    VALUES (?, ?);`;
  const albumValues = [album.title, album.release_date];
  const [albumResult] = await dbconfig.execute(albumQuery, albumValues);

  const albums_artistsQuery = /*SQL*/ `
  INSERT INTO albums_artists (album_id, artist_id)
  VALUES (?, ?);`;
  const albums_artistsValues = [albumResult.insertId, album.artist_id];
  const [albums_artistsResult] = await dbconfig.execute(albums_artistsQuery, albums_artistsValues);

  const query = /*SQL*/ `
  SELECT albums.*, artists.name
  FROM albums
  INNER JOIN albums_artists on albums.id = albums_artists.album_id
  INNER JOIN artists on albums_artists.artist_id = artists.id
  WHERE album_id = ?`;
  const values = [albumResult.insertId];
  const [result] = await dbconfig.execute(query, values);

  response.json(result[0]);
});

// updates an album by id given,
albumsRouter.put("/:id", async (request, response) => {
  const id = request.params.id;
  const album = request.body;
  const query = "UPDATE albums SET title=?, release_date=? WHERE id=?;";
  const values = [album.title, album.release_date, id];

  const [result] = await dbconfig.execute(query, values);

  response.json(result);
});



albumsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id;
  const deleteAlbumArtistsQuery = "DELETE FROM albums_artists WHERE album_id = ?;";
  const deleteTracksAlbumsQuery = "DELETE FROM tracks_albums WHERE album_id = ?;";
  const deleteAlbumQuery = "DELETE FROM albums WHERE id = ?;";

  try {
    await dbconfig.execute(deleteAlbumArtistsQuery, [id]); // Delete associated references first
    await dbconfig.execute(deleteTracksAlbumsQuery, [id]); // Delete associated references first
    await dbconfig.execute(deleteAlbumQuery, [id]); // Delete the album

    response.json({ message: "Album deleted successfully" });
  } catch (error) {
    response.status(500).json({ error: "Internal server error" });
  }
});

export default albumsRouter;
