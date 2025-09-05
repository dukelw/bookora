import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  information: ReactNode;
  graph: ReactNode;
  data: ReactNode;
};

export default function DashboardLayout({
  children,
  information,
  graph,
  data,
}: DashboardLayoutProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-3 border p-4">{children}</div>

      <div className="col-span-1 border p-4">
        <h2 className="font-bold mb-2">Information</h2>
        {information}
      </div>

      <div className="col-span-2 border p-4">
        <h2 className="font-bold mb-2">Graph</h2>
        {graph}
      </div>

      <div className="col-span-2 border p-4">
        <h2 className="font-bold mb-2">Data</h2>
        {data}
      </div>
    </div>
  );
}
