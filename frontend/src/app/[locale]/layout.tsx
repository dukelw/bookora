import AppNavbar from "../layout/default/NavBar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppNavbar />
      {children}
    </div>
  );
}
