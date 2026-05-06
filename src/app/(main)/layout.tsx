import { SessionProviderWrapper } from "./_components/session-provider-wrapper";
import { MainHeader } from "./_components/main-header";
import { MainFooter } from "./_components/main-footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderWrapper>
      <div className="min-h-screen flex flex-col">
        <MainHeader />
        <main className="flex-1 pt-14">
          {children}
        </main>
        <MainFooter />
      </div>
    </SessionProviderWrapper>
  );
}
