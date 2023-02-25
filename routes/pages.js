import { Router } from "express";
import { authenticate } from "../middleware.js"

export function createPageRouter(pool) {
  const router = Router();

  // router.get("", async (req, res) => {
  //   const result = await pool.query("SELECT * FROM public.pages");
  //   res.json({ data: result.rows });
  // });

  router.get("/:id", authenticate, async (req, res) => {
    console.log(req)
    const id = req.params.id;
    const result = await pool.query(`SELECT * FROM public.pages WHERE id = ${id}`);
    res.json({ data: result.rows });
  });

  // router.get("/", authenticate, async (req, res) => {
  //   console.log(req)
  //   const id = req.user.user_id;
  //   console.log(req.user)
  //   const result = await pool.query(`SELECT * FROM public.pages `);
  //   res.json({ data: result.rows });
  // });

  router.get("/", async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM public.pages`);
      res.json({ data: result.rows });
    } catch (error) {
      console.error("An error has occurred while fetching diary entries: ", error);
      res.status(500).json({ error: "An error has occurred while fetching diary entries." });
    }
  });
  

  router.post("/", authenticate, async (req, res) => {
    const user_id = req.user.user_id;
    console.log(req.user);
    const data = req.body;
    if (
      !data.title || 
      !data.date ||
      !data.story ) {
      res.status(400).json({ err: "missing data" });
    }
    
    await pool.query(
      `INSERT INTO public.pages ( title, date, story, user_id)
      VALUES ($1, $2, $3, ${user_id})`,
      [
        data.title,
        data.date,
        data.story,
      ]
    );
    res.json({ message: "Page created successfully" });
  });

// important
  // router.post("", async (req, res) => {
  //   const userId = 10;
  //   const data = req.body;
  //   if (
  //     !data.title || 
  //     !data.story || 
  //     !data.pictures ||
  //     !data.private == undefined) {
  //     res.status(400).json({ err: "missing data" });
  //   }
    
  //   await pool.query(
  //     `INSERT INTO public.pages (date, title, story, pictures, user_id, private, category_id)
  //     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  //     [
  //       new Date,
  //       data.title,
  //       data.story,
  //       data.pictures,
  //       userId, 
  //       data.private, 
  //       data.category_id
  //     ]
  //   );
  //   res.json({ message: "Page created successfully" });
  // });

  router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const userId = 10;
    const data = req.body;
    if (!data.title || data.story === undefined) {
      res.status(400).json({ err: "Missing data" });
    }
    await pool.query(
      `
            UPDATE public.pages
            SET 
            date = $1, 
            title = $2, 
            story = $3, 
            pictures = $4, 
            user_id = $5,
            private = $6,
            category_id = $7
            WHERE id = ${id}
            `,
      [
        new Date,
        data.title,
        data.story,
        data.pictures,
        userId, 
        data.private, 
        data.category_id
      ]
    );
    res.json({ message: "Page updated successfully" });
  });

  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    await pool.query(`DELETE FROM public.pages WHERE id = ${id}`);
    res.json({ message: "Page deleted successfully" });
  });

  return router;
}
