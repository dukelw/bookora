import AppNavbar from "../layout/default/NavBar";
import Footer from "../layout/default/Footer";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning={true}>
      {children}
      <Footer />
    </div>
  );
}
