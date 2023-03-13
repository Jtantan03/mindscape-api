import { Router } from "express";
import { authenticate } from "../middleware.js";

export function createPageRouter(pool) {
  const router = Router();

  // router.get("", async (req, res) => {
  //   const result = await pool.query("SELECT * FROM public.pages");
  //   res.json({ data: result.rows });
  // });

  // router.get("/:id", authenticate, async (req, res) => {
  //   console.log(req)
  //   console.log("id")
  //   console.log("get")
  //   let id = req.user.user_id;
  //   const result = await pool.query(`SELECT * FROM public.pages WHERE id = $1`, [id]);
  //   console.log(req.user.user_id)
  //   console.log(result)
  //   return res.json({ data: result.rows });
  // });

  //important
  // router.get("/:id", authenticate, async (req, res) => {
  //   // console.log(req)
  //   let id = req.user.user_id;
  //   // console.log(req.user)
  //   const result = await pool.query(`SELECT username, user_id, date, title, story FROM public.users INNER JOIN pages
  //   ON users.id = pages.user_id WHERE user_id=$1;`, [id]);
  //   res.json({ data: result.rows });
  // });

  //important
  // router.get("/:id", authenticate, async (req, res) => { //for users diary
  //   // console.log(req)
  //   let id = req.user.user_id;
  //   // console.log(req.user)
  //   const result = await pool.query(`SELECT username, user_id, date, title, pages.id, story FROM public.users INNER JOIN pages
  //   ON users.id = pages.user_id WHERE user_id = $1 `, [id]);
  //   res.json({ data: result.rows });
  // });
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
    console.log(userId)
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

  

  //important
  // router.get("/", async (req, res) => { // for all users diary
  //   try {
  //     const result = await pool.query(`SELECT username, user_id, date, title, story FROM public.users INNER JOIN pages
  //     ON users.id = pages.user_id;`);
  //     res.json({ data: result.rows });
  //   } catch (error) {
  //     console.error("An error has occurred while fetching diary entries: ", error);
  //     res.status(500).json({ error: "An error has occurred while fetching diary entries." });
  //   }
  // });

  

  //just remove the private
  router.post("/", authenticate, async (req, res) => {
    const user_id = req.user.user_id;
    // console.log(req.user);
    const data = req.body;
    console.log(data)
    if (!data.title || !data.date || !data.story || !data.private === undefined) {
      return null
      // res.status(400).json({ err: "missing data" });
    }

    await pool.query(
      `INSERT INTO public.pages ( title, date, story, private, user_id)
      VALUES ($1, $2, $3, $4, ${user_id})`,
      [
        data.title,
        data.date,
        data.story,
        data.private == null ? false : true// add private value here
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

  // very important
  router.put("/:id", authenticate, async (req, res) => {
    let id = req.params.id;
    const data = req.body.body;
    console.log(req)
    // const data = req.body;
    if (!data.title || !data.story || !data.date || !data.private === undefined) {
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
      [
        data.date,
        data.title,
        data.story,
        data.private,
        id,
      ]
    );
    res.json({ message: "Page updated successfully" });
  });

  // router.put("/:id", authenticate, async (req, res) => {
  //   const id = req.params.id;
  //   const data = req.body;
  //   console.log(data);

  //   if (!data.title || !data.story || !data.date ) {
  //     res.status(400).json({ err: "Missing data" });
  //     return;  
  //   }
    
  //   const private_value = data.private || false;

  //   try {
  //     const page = await pool.query(
  //       `SELECT * FROM public.pages WHERE id = $1`,
  //       [id]
  //     );

  //     if (page.rowCount === 0) {
  //       res.status(404).json({ err: "Page not found" });
  //       return;
  //     }

  //     const isAuthorized = page.rows[0].user_id === req.user.user_id;

  //     if (!isAuthorized) {
  //       res.status(401).json({ err: "Unauthorized" });
  //       return;
  //     }

  //     await pool.query(
  //       `
  //       UPDATE public.pages
  //       SET 
  //       date = $1, 
  //       title = $2, 
  //       story = $3,
  //       private = $4 
  //       WHERE id = $5
  //       `,
  //       [data.date, 
  //         data.title, 
  //         data.story, 
  //         private_value, 
  //         id]
  //     );

  //     res.json({ message: "Page updated successfully" });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ err: "Server error" });
  //   }
  // });

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
