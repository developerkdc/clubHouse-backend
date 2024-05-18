// admin-panel/server.js
import { config } from "dotenv";
config();
import express from "express";
import http from "http";
import socketIoModule from "./socket.js";
import expressGroupRoutes from "express-group-routes";
import mongo_service from "./database/mongo.service.js";
mongo_service();
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

//  Admin Routes imports
import authRouter from "./routes/Admin/auth.routes.js";
import usersRouter from "./routes/Admin/user.routes.js";
import rolesRouter from "./routes/Admin/roles.routes.js";
import memberRouter from "./routes/Admin/member.routes.js";
import newsRouter from "./routes/Admin/news.routes.js";
import eventRouter from "./routes/Admin/event.routes.js";
import galleryRouter from "./routes/Admin/gallery.routes.js";
import banquetRouter from "./routes/Admin/banquet.routes.js";
import sportRouter from "./routes/Admin/sport.routes.js";
import salonRouter from "./routes/Admin/salon.routes.js";
import spaRouter from "./routes/Admin/spa.routes.js";
import libraryRouter from "./routes/Admin/library.routes.js";
import healthFitnessRouter from "./routes/Admin/healthFitness.routes.js";

// member routes import
import memberAuthRouter from "./routes/Member/auth.routes.js";
import memberNewsRouter from "./routes/Member/news.routes.js";
import memberEventRouter from "./routes/Member/event.routes.js";
import memberGalleryRouter from "./routes/Member/gallery.routes.js";
import memberBanquetRouter from "./routes/Member/banquet.routes.js";
import memberSportRouter from "./routes/Member/sport.routes.js";
import memberSalonRouter from "./routes/Member/salon.routes.js";
import memberSpaRouter from "./routes/Member/spa.routes.js";
import memberLibraryRouter from "./routes/Member/library.routes.js";
import memberHealthFitnessRouter from "./routes/Member/healthFitness.routes.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { globalErrorHandler } from "./Utils/GlobalErrorHandler.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
var corsOptions = {
  origin: ["http://localhost:3001","https://clubhouse.kdcstaging.in","http://localhost:3000"],
  optionsSuccessStatus: 200,
  credentials: true,
}
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("./uploads"));
app.use(express.static(__dirname));
app.use(cookieParser());

// Use the socket.io module
// socketIoModule(server);

app.group("/api/v1/admin", (router) => {
  router.use("/auth", authRouter);
  router.use("/user", usersRouter);
  router.use("/role", rolesRouter);
  router.use("/member", memberRouter);
  router.use("/news", newsRouter);
  router.use("/event", eventRouter);
  router.use("/gallery", galleryRouter);
  router.use("/banquet", banquetRouter);
  router.use("/sport", sportRouter);
  router.use("/salon", salonRouter);
  router.use("/spa", spaRouter);
  router.use("/library", libraryRouter);
  router.use("/health_fitness", healthFitnessRouter);
});
app.group("/api/v1/member", (router) => {
  router.use("/auth", memberAuthRouter);
  router.use("/news", memberNewsRouter);
  router.use("/event", memberEventRouter);
  router.use("/gallery", memberGalleryRouter);
  router.use("/banquet", memberBanquetRouter);
  router.use("/sport", memberSportRouter);
  router.use("/salon", memberSalonRouter);
  router.use("/spa", memberSpaRouter);
  router.use("/library", memberLibraryRouter);
  router.use("/health_fitness", memberHealthFitnessRouter);
});

app.use(globalErrorHandler);

// Error handling for the server
server.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
});

server.listen(PORT, () => {
  console.log(`Admin Panel Server listening on port ${PORT}`);
});
