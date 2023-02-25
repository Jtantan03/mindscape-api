import { Router } from "express";

export function createCategoryRouter(pool) {
  const router = Router();

  router.get("", async (req, res) => {
    const result = await pool.query("SELECT * FROM public.categories");
    res.json({ data: result.rows });
  });

  router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const result = await pool.query(`SELECT * FROM public.categories WHERE id = ${id}`);
    res.json({ data: result.rows });
  });

  // post
  router.post("", async (req, res) => {
    const userId = 10;
    const data = req.body;

    if (
      !data.name 
    ) {
      return res.status(402).json({ err: "Missing data" });
    }

    await pool.query(
      `
        INSERT INTO public.categories (user_id, category_name)
        VALUES ($1, $2)
        `,
      [
        userId,
        data.name
      ]
    );

    res.json({ message: "Successfully registered" });
  });

    // EDIT THE DATA

    router.put("/:id", async (req, res) => {
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
