import loginEndpoint from "./login.js";
import historyEndpoint from "./history.js";
export default function api(app) {
  app.use("/api/v1/login", loginEndpoint);
  app.use("/api/v1/history", historyEndpoint);
}
