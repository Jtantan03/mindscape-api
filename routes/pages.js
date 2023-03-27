import { Router } from "express";
import { authenticate } from "../middleware.js";

export function createPageRouter(pool) {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT username, user_id, date, title, story, private
        FROM public.users
        INNER JOIN pages ON users.id = pages.user_id
        WHERE private = false; 
      `); // add this condition to exclude private entries
      res.json({ data: result.rows });
    } catch (error) {
      console.error(
        "An error has occurred while fetching diary entries: ",
        error
      );
      res
        .status(500)
        .json({ error: "An error has occurred while fetching diary entries." });
    }
  });

  router.get("/private", authenticate, async (req, res) => {
    const userId = req.user.user_id;
    try {
      const result = await pool.query(
        // SELECT * FROM public.pages
        // WHERE user_id = $1 AND private = true
        `
          SELECT username, user_id, date, title, story, private
        FROM public.users
		INNER JOIN pages ON users.id = pages.user_id
          WHERE user_id = $1 AND private = true
        `,
        [userId]
      );

      res.json({ data: result.rows });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ err: "Server error" });
    }
  });

  router.get("/category/:id", authenticate, async (req, res) => {
    const userId = req.user.user_id;
    const id = req.params.id;
    try {
      const result = await pool.query(
        // SELECT * FROM public.pages
        // WHERE user_id = $1 AND private = true
        `
      SELECT 
      u.username, 
      p.date, 
      p.title, 
      p.story, 
      p.private, 
      c.category_name 
    FROM 
    public.users u 
    JOIN public.pages p ON u.id = p.user_id 
    JOIN public.categories c ON p.category_id = c.id
    WHERE 
    u.id = $1 AND c.id = $2;
        `,
        [userId, id]
      );

      res.json({ data: result.rows });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ err: "Server error" });
    }
  });

  router.get("/:id", authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT username, user_id, date, title, story, private, pages.id
        FROM public.users
        INNER JOIN pages ON users.id = pages.user_id
        WHERE user_id = $1;
      `,
        [req.user.user_id]
      );
      res.json({ data: result.rows });
    } catch (error) {
      console.error(
        "An error has occurred while fetching diary entries: ",
        error
      );
      res
        .status(500)
        .json({ error: "An error has occurred while fetching diary entries." });
    }
  });

  //just remove the private
  router.post("/", authenticate, async (req, res) => {
    const user_id = req.user.user_id;
    const data = req.body;
    if (
      !data.title ||
      !data.date ||
      !data.story ||
      !data.private === undefined
    ) {
      return null;
      // res.status(400).json({ err: "missing data" });
    }

    await pool.query(
      `INSERT INTO public.pages ( title, date, story, category_id, private, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.title,
        data.date,
        data.story,
        data.categoryId,
        data.private == null ? false : true, // add private value here
        user_id,
      ]
    );

    res.json({ message: "Page created successfully" });
  });

  // very important
  router.put("/:id", authenticate, async (req, res) => {
    let id = req.params.id;
    const data = req.body.body;
    // const data = req.body;
    if (
      !data.title ||
      !data.story ||
      !data.date ||
      !data.private === undefined
    ) {
      res.status(400).json({ err: "Missing data" });
    }
    await pool.query(
      `
            UPDATE public.pages
            SET
            date = $1,
            title = $2,
            story = $3,
            private = $4
            WHERE id = $5
            `,
      [data.date, data.title, data.story, data.private, id]
    );
    res.json({ message: "Page updated successfully" });
  });

  router.delete("/:id", authenticate, async (req, res) => {
    const id = req.params.id;
    await pool.query(
      `DELETE FROM public.pages WHERE id = ${id} AND user_id = ${req.user.user_id}`
    );
    res.json({ message: "Page deleted successfully" });
  });

  return router;
}

//
