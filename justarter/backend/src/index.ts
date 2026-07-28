import express from "express";
import cors from "cors";
import suggestionsRouter from "./routes/suggestions.js";

const PORT = process.env.PORT ?? 3001;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/suggestions", suggestionsRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
