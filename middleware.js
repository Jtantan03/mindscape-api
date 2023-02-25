import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
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




