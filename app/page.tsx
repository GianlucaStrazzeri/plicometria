import type { Metadata } from "next";
import Link from "next/link";
import LandingClinic from "@/components/marketing/LandingClinics";

export const metadata: Metadata = {
  title: "NextClinic — Landing",
  description: "Marketing landing de NextClinic",
};

export default function LandingPage() {
  return (
    <>
      <div className="fixed right-6 top-6 z-50">
        <Link
          href="/clients"
          className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-slate-800"
        >
          Try it
        </Link>
      </div>

      <LandingClinic />
    </>
  );
}
