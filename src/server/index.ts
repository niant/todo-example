import express from "express";
import path from "path";
import { router } from "./Todos/TodosRoutes";

const PORT = process.env.SERVER_PORT || 3001;

const app = express();

app.use(express.json());

app.use("/api", router);

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
