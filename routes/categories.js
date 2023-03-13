import { Router } from "express";
import { authenticate } from "../middleware.js"

export function createCategoryRouter(pool) {
  const router = Router();

  router.get("", async (req, res) => {
    const result = await pool.query("SELECT * FROM public.categories");
    res.json({ data: result.rows });
  });

  router.get("/:id", authenticate, async (req, res) => {
    let id = req.user.user_id;
    const result = await pool.query(
      `SELECT * FROM public.categories WHERE user_id=$1 `, [id]
    );
    res.json({ data: result.rows });
  });

  // post
  router.post("/", authenticate, async (req, res) => {
    const user_id = req.user.user_id;
    const data = req.body;
    console.log("wow", data)
    if (
      !data.name 
    ) {
      return res.status(402).json({ err: "Missing data" });
    }
    await pool.query(
      `
        INSERT INTO public.categories (category_name, user_id)
        VALUES ($1, $2)
        `,
      [
        data.name,
        user_id,
      ]
    );

    res.json({ message: "Successfully created" });
  });

    // EDIT THE DATA

    router.put("/:id", authenticate, async (req, res) => {
      const id = req.params.id;
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ err: "missing data" });
      }
      await pool.query(
        `
        UPDATE public.categories SET category_name=$1 WHERE id=$2
    `,
        [req.body.name, id]
      );
      res.json({ message: "Category updated successfully" });
    });

    //DELETE THE DATA

    router.delete("/:id", async (req, res) => {
      const id = req.params.id;
      await pool.query("DELETE FROM public.categories WHERE id = $1", [id]);
      res.json({ message: "Category deleted successfully" });
    });

  return router;
}
