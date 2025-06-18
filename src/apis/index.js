import loginEndpoint from "./login.js";
import historyEndpoint from "./history.js";
export default function api(app) {
  //   app.get("/auth/github", passport.authenticate("github", { scope: ["repo"] }));

  //   app.get(
  //     "/auth/github/callback",
  //     passport.authenticate("github", { failureRedirect: "/" }),
  //     (req, res) => {
  //       res.redirect("http://localhost:5173");
  //     }
  //   );

  //   app.get("/api/user", (req, res) => {
  //     if (!req.user) {
  //       return res.status(401).json({ message: "Chưa đăng nhập" });
  //     }
  //     res.json(req.user);
  //   });
  app.use("/api/v1/login", loginEndpoint);
  app.use("/api/v1/history", historyEndpoint);
}
