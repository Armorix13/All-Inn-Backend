import express, { Router } from "express";
import userRoute from "../routes/user.route";

const routes: Router = express.Router();

routes.use("/user", userRoute);


export default routes;



