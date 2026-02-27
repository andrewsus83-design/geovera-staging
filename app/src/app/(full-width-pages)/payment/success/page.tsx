"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "loading" | "confirmed" | "pending" | "failed" | "timeout";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const invoiceId = params.get("invoice_id") ?? params.get("external_id") ?? "";
  const plan = params.get("plan") ?? "";

  const [status, setStatus] = useState<Status>("loading");
  const [paymentInfo, setPaymentInfo] = useState<{ amount?: number; currency?: string; channel?: string } | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (!invoiceId) {
      // No invoice_id means free tier activation — show confirmed directly
      setStatus("confirmed");
      return;
    }

    const MAX = 10;
    const poll = async () => {
      if (attempts.current >= MAX) {
        setStatus("timeout");
        return;
      }
      attempts.current++;
      try {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check_payment_status", invoice_id: invoiceId }),
        });
        const data = await res.json();
        if (data.success) {
          const inv = data.invoice;
          if (inv.status === "PAID" || inv.status === "SETTLED") {
            setPaymentInfo({ amount: inv.amount, currency: inv.currency, channel: inv.payment_channel });
            setStatus("confirmed");
          } else if (inv.status === "EXPIRED" || inv.status === "FAILED") {
            setStatus("failed");
          } else {
            setTimeout(poll, 3000);
          }
        } else {
          setTimeout(poll, 3000);
        }
      } catch {
        setTimeout(poll, 3000);
      }
    };
    poll();
  }, [invoiceId]);

  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()
    : "your plan";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">

          {/* Loading */}
          {status === "loading" && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="h-14 w-14 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Verifying Payment…</h1>
                <p className="text-sm text-gray-400 mt-1">Please wait while we confirm your payment</p>
              </div>
            </div>
          )}

          {/* Confirmed */}
          {status === "confirmed" && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="h-14 w-14 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
                  Payment Confirmed!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {planLabel} plan is now active
                </p>
              </div>
              {paymentInfo?.amount && (
                <div className="w-full rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {paymentInfo.currency} {paymentInfo.amount?.toLocaleString()}
                    </span>
                  </div>
                  {paymentInfo.channel && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Method</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{paymentInfo.channel}</span>
                    </div>
                  )}
                </div>
              )}
              <Link
                href="/"
                className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors text-center block"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Pending / timeout */}
          {(status === "pending" || status === "timeout") && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Pending</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your payment is being processed. Your plan will activate automatically once confirmed.
                </p>
              </div>
              <Link href="/" className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors text-center block">
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Failed */}
          {status === "failed" && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Failed</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your payment could not be processed.</p>
              </div>
              <Link href="/" className="w-full rounded-xl bg-gray-900 dark:bg-white px-4 py-3 text-sm font-semibold text-white dark:text-gray-900 hover:opacity-90 transition-opacity text-center block">
                Return to Dashboard
              </Link>
            </div>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by <span className="font-medium">Xendit</span> · Secure payment processing
        </p>
      </div>
    </div>
  );
}
