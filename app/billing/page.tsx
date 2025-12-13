"use client";

import BillingDashboard from "@/components/billing/BillingDashboard";
import CashRegisterDashboard from "@/components/billing/cashregister/CashRegisterDashboard";

export default function BillingPage() {
  return (
    <div className="space-y-4 mx-auto w-full max-w-md p-4 sm:max-w-5xl">
      <div className="w-full">
        <BillingDashboard />
      </div>

      <div className="w-full">
        <CashRegisterDashboard />
      </div>
    </div>
  );
}
