import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

const storageLogos = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads", "logos");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now();
    cb(null, `logo_${req.usuario.id}_${unique}${ext}`);
  },
});

const uploadLogo = multer({ storage: storageLogos });

export { upload, uploadLogo };
