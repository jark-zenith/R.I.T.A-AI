import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return '"' + text.replaceAll('"', '""') + '"';
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("transactions")
    .select("occurred_on,kind,amount_minor,currency,description,reconciled_at")
    .order("occurred_on", { ascending: false })
    .limit(1000);

  if (error) return NextResponse.json({ error: "Unable to generate report" }, { status: 500 });

  const rows = [
    ["date", "type", "amount_minor", "currency", "description", "reconciled_at"],
    ...(data ?? []).map(tx => [tx.occurred_on, tx.kind, tx.amount_minor, tx.currency, tx.description, tx.reconciled_at]),
  ];
  const csv = rows.map(row => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rita-transactions.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
