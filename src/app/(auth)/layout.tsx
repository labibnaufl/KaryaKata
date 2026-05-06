import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Karya Kata.",
    default: "Authentication",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000]/5 to-white">
      {children}
    </div>
  );
}
