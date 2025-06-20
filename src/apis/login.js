import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../auth/auth.js";

const router = express.Router();

router.use(express.json());

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["repo"] })
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const { user } = req.user;
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "10h" });
    res.redirect(`http://localhost:5173/callback?token=${token}`);
  }
);

router.get("/user", authenticateJWT, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return res.status(200).json({
    success: true,
    userInfo: req.user,
    message: "Login successfully!",
  });
});

export default router;
