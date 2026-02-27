"use client";
import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
                Payment Failed
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your payment could not be completed. No charges were made.
              </p>
            </div>
            <div className="w-full space-y-2">
              <Link
                href="/"
                className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors text-center block"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center block"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Need help? Contact us at <span className="font-medium">support@geovera.xyz</span>
        </p>
      </div>
    </div>
  );
}
