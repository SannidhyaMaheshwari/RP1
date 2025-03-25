// app/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import Sidebar from "./components/Sidebar";

import Homepage from "./components/Homepage.jsx";
import Footer from "./components/Footer.jsx";

export default async function HomePage() {
  // Check authentication (e.g., token stored in cookies)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    console.log("No token found, redirecting to login");
    redirect("/login");
  }

  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded || !decoded.exp) {
      redirect("/login");
    }
    if (decoded.exp * 1000 < Date.now()) {
      redirect("/login");
    }
  } catch (error) {
    redirect("/login");
  }

  return <></>;
}
