import type { Metadata } from "next";
import Homepage from "@/components/homepage/homepage";

export const metadata: Metadata = {
  title: "Plicometria — Home",
  description: "Inicio rápido para navegar por la aplicación",
};

export default function HomepagePage() {
  return <Homepage />;
}
