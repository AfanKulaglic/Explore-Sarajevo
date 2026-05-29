"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <span className="text-[200px] font-bold text-gray-100 select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Stranica nije pronađena
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Nažalost, stranica koju tražite ne postoji ili je premještena.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all"
          >
            <Home className="w-5 h-5" />
            Početna
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Nazad
          </button>
        </div>
      </div>
    </div>
  );
}
