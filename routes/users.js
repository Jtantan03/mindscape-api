import { Router } from "express";
import bcrypt from 'bcrypt';
import { authenticate } from '../middleware.js'

export function createUserRouter(pool) {
  const router = Router();


// post
  router.post("", async (req, res) => {
    console.log("get")
   
    const data = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    if (
      !data.username ||
      !data.password ||
      !data.firstName ||
      !data.lastName ||
      !data.birthday ||
      !data.gender ||
      !data.address
    ) {
      return res.status(402).json({ err: "Missing data" });
    }

    await pool.query(
      `
        INSERT INTO public.users (username, password, first_name, last_name, birthday, gender, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
      [
        data.username,
        hashedPassword,
        data.firstName,
        data.lastName,
        data.birthday,
        data.gender,
        data.address,
      ]
    );

    res.json({ message: "Successfully registered" });
  });

  // get
  router.get("", async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM public.users",
    );
    res.json({ data: result.rows });
  });

  // router.get('/:id', authenticate, async (req, res) => {
  //   const result = await pool.query(`SELECT * FROM public.users WHERE id ='${req.user.user_id}' `);
  //   return res.json({ data: result.rows [ 0 ]});
  // });

  router.get("/:id'", async (req, res) => {
    console.log("get")
    const id = req.params.id
    const result = await pool.query(`SELECT * FROM public.users WHERE id ='${id}' `);
    return res.json({ data: result.rows }); 
  });

   // //   put
   router.put("/:id", async (req, res) => {
    console.log(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const id = req.params.id;
    const data = req.body;
    if (
      !data.username ||
      !data.password ||
      !data.firstName ||
      !data.lastName ||
      !data.birthday ||
      !data.gender ||
      !data.address == undefined
    ) {
      res.status(400).json({ err: "missing data" });
    }
    await pool.query(`
      UPDATE public.users SET username=$1, password=$2, first_name=$3, last_name=$4, birthday=$5, gender=$6, address=$7 WHERE public.users.id = ${id}`,
      [
        data.username,
        hashedPassword,
        data.firstName,
        data.lastName,
        data.birthday,
        data.gender,
        data.address
      ]
      );
    res.json({ message: "User updated successfully" });
  });

  // DELETE THE DATA

  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    await pool.query(`DELETE FROM public.users WHERE id = ${id}`);
    res.json({ message: "Page deleted successfully" });
  });
 
  return router;
}