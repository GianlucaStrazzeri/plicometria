import React from "react";
import ChatWidget from "@/components/chat/ChatWidget";

export const metadata = {
  title: "Chat — Plicometria",
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Asistente / Chat</h1>
        <ChatWidget />
      </div>
    </main>
  );
}
