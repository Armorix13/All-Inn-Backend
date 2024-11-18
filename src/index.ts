import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import DbConnect from "./config/Database";
import { sendErrorResponse, sendSuccessResponse } from "./utils";
import routes from "./routes";
dotenv.config();

const app: Express = express();

DbConnect();

const PORT = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  sendSuccessResponse(res, 200, "api is working properly");
});

app.use("/api/",routes);

app.use("*", (_req: Request, res: Response) => {
  sendErrorResponse(res, 404, "Route not found");
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  sendErrorResponse(res, 500, err.message || "Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
