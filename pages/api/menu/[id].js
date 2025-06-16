import formidable from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const config = {
  api: { bodyParser: false },
};

// Helper untuk ambil user_id dari headers/request/session
function getUserId(req, fields = null) {
  // Prioritas: dari form data -> dari JSON body -> dari headers
  if (fields && fields.user_id) {
    return Array.isArray(fields.user_id) ? fields.user_id[0] : fields.user_id;
  }

  // Jika request JSON, parse body
  if (req.body && typeof req.body === "object" && req.body.user_id) {
    return req.body.user_id;
  }

  // Fallback ke headers
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

    // Cek apakah request menggunakan form-data atau JSON
    const contentType = req.headers["content-type"] || "";
    let updateData = {};
    let userId = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle form-data (dengan file upload)
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

      try {
        const { fields, files } = await parseForm();

        // Extract user_id dari form fields
        userId = getUserId(req, fields);

        const { name, price, category, stock } = fields;
        updateData = {
          name: Array.isArray(name) ? name[0] : name,
          price: Array.isArray(price) ? Number(price[0]) : Number(price),
          category: Array.isArray(category) ? category[0] : category,
          stock: Array.isArray(stock) ? Number(stock[0]) : Number(stock) || 0,
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
      } catch (e) {
        console.error("[PUT /api/menu/:id] Form parsing ERROR:", e);
        return res
          .status(400)
          .json({ error: "Gagal parse form data", detail: e?.message });
      }
    } else {
      // Handle JSON request (tanpa file upload)
      try {
        // Parse JSON body manually karena bodyParser: false
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        await new Promise((resolve) => {
          req.on("end", () => {
            try {
              req.body = JSON.parse(body);
              resolve();
            } catch (e) {
              req.body = {};
              resolve();
            }
          });
        });

        userId = getUserId(req);

        const { name, price, category, stock } = req.body;
        updateData = {
          name,
          price: Number(price),
          category,
          stock: Number(stock) || 0,
        };
      } catch (e) {
        console.error("[PUT /api/menu/:id] JSON parsing ERROR:", e);
        return res
          .status(400)
          .json({ error: "Gagal parse JSON data", detail: e?.message });
      }
    }

    try {
      const updated = await prisma.menuItem.update({
        where: { id },
        data: updateData,
      });

      // Insert log aktivitas dengan user_id yang benar
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
      console.error("[PUT /api/menu/:id] Update ERROR:", e);
      return res
        .status(400)
        .json({ error: "Gagal update menu", detail: e?.message });
    }
  } else if (req.method === "DELETE") {
    let userId = null;

    // Cek jika body tersedia (biasanya untuk POST atau PUT)
    if (req.body && req.body.user_id) {
      userId = req.body.user_id;
    }

    // Cek di headers (untuk user_id yang dikirimkan dengan fetch)
    if (!userId) {
      userId = req.headers["x-user-id"];
    }

    // Cek di query string
    if (!userId) {
      userId = req.query.user_id;
    }

    if (!userId) {
      return res.status(400).json({ error: "user_id diperlukan" });
    }

    try {
      const menu = await prisma.menuItem.delete({ where: { id } });

      // Insert log aktivitas

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
