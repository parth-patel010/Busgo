import multer from "multer";
import path from "path";
import fs from "fs";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

export const uploadsDir = process.env["VERCEL"]
  ? path.join("/tmp", "busgo-uploads")
  : path.resolve(workspaceRoot, "artifacts/api-server/uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function photoUrlFromPath(photoPath: string | null): string | null {
  return photoPath ? `/api/uploads/${path.basename(photoPath)}` : null;
}

export function deletePhotoFile(photoPath: string | null | undefined): void {
  if (photoPath && fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
}
