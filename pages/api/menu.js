import formidable from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

// WAJIB: agar Next.js tidak auto-parse body, biar formidable yang handle!
export const config = {
  api: { bodyParser: false },
};

// Helper untuk ambil user_id (bisa dari session, token, atau header)
function getUserId(req) {
  return req.headers["x-user-id"] || null;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Tampilkan semua menu
    const items = await prisma.menuItem.findMany();
    res.status(200).json(items);
  } else if (req.method === "POST") {
    // Pastikan folder upload sudah ada
    const uploadDir = path.join(process.cwd(), "public/images/menu");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: "File upload error" });
        return;
      }

      // Fix untuk kemungkinan field berupa array
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const price = Array.isArray(fields.price)
        ? fields.price[0]
        : fields.price;
      const category = Array.isArray(fields.category)
        ? fields.category[0]
        : fields.category;

      // Validasi gambar
      const image = files.image;
      if (!image || (Array.isArray(image) && !image[0])) {
        res.status(400).json({ error: "Gambar wajib di-upload" });
        return;
      }
      const imgFile = Array.isArray(image) ? image[0] : image;
      if (!imgFile.filepath) {
        res.status(400).json({ error: "Gambar gagal di-upload" });
        return;
      }

      // Hanya simpan nama file
      const image_url = path.basename(imgFile.filepath);

      // Simpan ke database
      try {
        const item = await prisma.menuItem.create({
          data: {
            name,
            price: Number(price),
            category,
            imageUrl: image_url,
          },
        });

        // Insert log aktivitas
        const userId = getUserId(req);
        await prisma.activityLog.create({
          data: {
            user_id: userId,
            action: "create",
            target: "MenuItem",
            target_id: item.id,
            message: `Tambah menu: ${item.name}`,
          },
        });

        res.status(200).json(item);
      } catch (dbErr) {
        res
          .status(500)
          .json({ error: "Gagal simpan ke database", details: dbErr.message });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
