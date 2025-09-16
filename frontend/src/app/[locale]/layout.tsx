import AppNavbar from "../layout/default/NavBar";
import Footer from "../layout/default/Footer";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppNavbar />
      {children}
      <Footer />
    </div>
  );
}
