import formidable from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const config = {
  api: { bodyParser: false },
};

// Helper untuk ambil user_id dari headers/request/session
function getUserId(req) {
  // Ganti ini sesuai implementasi login/session-mu!
  // Contoh: dari custom header, cookie, session, dsb
  return req.headers["x-user-id"] || null;
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Menu tidak ditemukan" });
    }
    return res.status(200).json(item);
  } else if (req.method === "PUT") {
    // Pastikan folder upload ada
    const uploadDir = path.join(process.cwd(), "public/images/menu");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Helper Promise untuk parse FormData
    const parseForm = () =>
      new Promise((resolve, reject) => {
        const form = formidable({
          multiples: false,
          uploadDir,
          keepExtensions: true,
        });
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    let fields = {};
    let files = {};
    let updateData = {};
    try {
      const parsed = await parseForm();
      fields = parsed.fields;
      files = parsed.files;

      const { name, price, category } = fields;
      updateData = {
        name: Array.isArray(name) ? name[0] : name,
        price: Array.isArray(price) ? Number(price[0]) : Number(price),
        category: Array.isArray(category) ? category[0] : category,
      };

      // Handle gambar baru
      if (files.image) {
        const fileObj = files.image;
        const filePath =
          fileObj?.filepath ||
          fileObj?.path ||
          fileObj?.tempFilePath ||
          (Array.isArray(fileObj) && fileObj[0]?.filepath);

        if (filePath) {
          updateData.imageUrl = path.basename(filePath);
        }
      }

      const updated = await prisma.menuItem.update({
        where: { id },
        data: updateData,
      });

      // Insert log aktivitas
      const userId = getUserId(req);
      await prisma.activityLog.create({
        data: {
          user_id: userId,
          action: "update",
          target: "MenuItem",
          target_id: id,
          message: `Update menu: ${updateData.name}`,
        },
      });

      return res.status(200).json(updated);
    } catch (e) {
      console.error("[PUT /api/menu/:id] ERROR:", e);
      console.error("fields:", fields);
      console.error("files:", files);
      console.error("updateData:", updateData);
      return res
        .status(400)
        .json({ error: "Gagal update menu", detail: e?.message || e });
    }
  } else if (req.method === "DELETE") {
    try {
      const menu = await prisma.menuItem.delete({ where: { id } });

      // Insert log aktivitas
      const userId = getUserId(req);
      await prisma.activityLog.create({
        data: {
          user_id: userId,
          action: "delete",
          target: "MenuItem",
          target_id: id,
          message: `Hapus menu: ${menu.name}`,
        },
      });

      return res.status(200).json({ message: "Menu dihapus" });
    } catch (e) {
      return res.status(400).json({ error: "Gagal hapus menu" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
