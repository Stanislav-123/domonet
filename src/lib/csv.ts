export function csvCell(value: unknown) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function csvResponse(
  filename: string,
  header: string[],
  rows: AsyncGenerator<unknown[]>,
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`\uFEFF${header.map(csvCell).join(",")}\n`));
      try {
        for await (const row of rows) {
          controller.enqueue(encoder.encode(`${row.map(csvCell).join(",")}\n`));
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
