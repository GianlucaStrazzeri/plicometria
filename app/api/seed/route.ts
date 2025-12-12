import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    // Example seed data for `foods` table. Adjust fields to match your schema.
    const foods = [
      {
        name: "Manzana",
        duration: "",
        proteins: 0.3,
        fats: 0.2,
        carbs: 14,
        sugars: 10,
        vitamins: "A,C",
        caloriesPer100: 52,
        tags: ["fruta", "snack"],
      },
      {
        name: "Pechuga de pollo (100g)",
        duration: "",
        proteins: 31,
        fats: 3.6,
        carbs: 0,
        sugars: 0,
        vitamins: "B6",
        caloriesPer100: 165,
        tags: ["proteína", "carne"],
      },
    ];

    const { data, error } = await supabaseAdmin.from("foods").insert(foods).select();
    if (error) {
      console.error("Seed error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: data }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
