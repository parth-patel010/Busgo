import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import { pinoHttp } from "pino-http";
import type { IncomingMessage, ServerResponse } from "http";
import router from "./routes";
import { logger } from "./lib/logger";
import { uploadsDir } from "./lib/upload";

type RequestWithId = IncomingMessage & { id?: string | number };

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: RequestWithId) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: ServerResponse) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) throw new Error("SESSION_SECRET env var is required");

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);

app.use("/api/uploads", express.static(uploadsDir));
app.use("/api", router);

export default app;
