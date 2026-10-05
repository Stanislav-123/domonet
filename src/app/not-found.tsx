import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Страница не найдена</h1>
        <Link href="/" className="mt-4 inline-block text-accent">
          На главную
        </Link>
      </div>
    </main>
  );
}
