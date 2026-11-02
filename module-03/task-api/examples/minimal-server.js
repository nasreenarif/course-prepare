import express from "express";
const app = express();
app.get("/api/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});
app.listen(3000, () => console.log("Open http://localhost:3000/api/health"));
