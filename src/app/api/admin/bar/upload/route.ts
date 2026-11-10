import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { BAR_ITEMS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireSuperAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase Storage не настроен" },
      { status: 500 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Допустимы только изображения (JPEG, PNG, WebP, GIF)" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой (максимум 5 МБ)" },
      { status: 400 },
    );
  }

  const { data: bucket } = await supabase.storage.getBucket(BAR_ITEMS_BUCKET);

  if (!bucket) {
    const { error: createError } = await supabase.storage.createBucket(
      BAR_ITEMS_BUCKET,
      { public: true },
    );

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  }

  const ext = file.name.includes(".")
    ? (file.name.split(".").pop()?.toLowerCase() ?? "jpg")
    : "jpg";
  const path = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BAR_ITEMS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data } = supabase.storage.from(BAR_ITEMS_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
