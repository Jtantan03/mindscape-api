import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  // console.log(token)
  if (!token) {
    return res.status(401).json({ err: "No token provided" });
  }
  try {
    req.user = jwt.verify(token.slice(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ err: "Invalid token" });
  }
};

// import jwt from "jsonwebtoken";

// export const authenticate = (req, res, next) => {
//   const token = req.headers.authorization;
//   console.log("Token:", token);
//   if (!token) {
//     return res.status(401).json({ err: "No token provided" });
//   }
//   try {
//     req.user = jwt.verify(token.slice(7), process.env.JWT_SECRET);
//     console.log("User:", req.user);
//     next();
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(401).json({ err: "Invalid token" });
//   }
// };


