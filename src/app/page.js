// src/app/page.js (atau page.jsx)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
