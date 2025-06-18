import express from "express";
import passport from "passport";
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
    res.redirect("http://localhost:5173");
  }
);

router.get("/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  res.json(req.user);
});

export default router;
