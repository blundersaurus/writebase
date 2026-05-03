import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-5">
          <Link href="/" className="font-semibold shrink-0">
            WriteBase
          </Link>
          <Link href="/ideas" className="text-sm text-neutral-700 hover:text-neutral-900">
            Ideas
          </Link>
          <Link href="/articles" className="text-sm text-neutral-700 hover:text-neutral-900">
            Articles
          </Link>
          <div className="w-px h-4 bg-neutral-300 shrink-0" />
          <Link href="/stories/ideas" className="text-sm text-indigo-600 hover:text-indigo-800">
            Story Ideas
          </Link>
          <Link href="/stories/drafts" className="text-sm text-indigo-600 hover:text-indigo-800">
            Story Drafts
          </Link>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </>
  );
}
