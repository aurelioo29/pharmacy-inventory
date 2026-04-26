import Link from "next/link";
import { Button } from "antd";
import { Home, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f6] px-4">
      <div className="w-full max-w-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-blue-50 text-blue-600">
          <SearchX size={34} strokeWidth={1.8} />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          404 - Page Not Found
        </h1>

        <p className="mb-6 text-sm text-slate-500">
          Halaman yang kamu cari tidak ditemukan. Mungkin URL salah, atau
          halamannya memang kabur duluan. Profesional sekali.
        </p>

        <Link href="/dashboard">
          <Button
            type="primary"
            className="his-toolbar-button !border-none"
            icon={<Home size={16} />}
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </main>
  );
}
