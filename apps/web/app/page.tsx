"use client";

import { brand } from "@nexa/branding";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
          {brand.name}
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {brand.tagline}
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <button
            onClick={() => signIn()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Sign In
          </button>
          <a
            href="#features"
            className="px-8 py-3 border-2 border-slate-300 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  );
}
