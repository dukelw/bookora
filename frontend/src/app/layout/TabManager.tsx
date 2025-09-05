"use client";
import { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import TabBar from "./TabBar";
import HomeTab from "../components/tabs/HomeTab";
import UsersTab from "../components/tabs/UserTab";
import InventoryTab from "../components/tabs/InventoryTab";
import Navbar from "./NavBar";

const TabComponents: Record<string, React.ReactNode> = {
  home: <HomeTab />,
  users: <UsersTab />,
  inventory: <InventoryTab />,
  settings: <div>⚙️ Settings</div>,
};

const LOCAL_KEY = "dashboard-tabs";

export default function TabManager() {
  const [tabs, setTabs] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["home"];
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved).tabs : ["home"];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === "undefined") return "home";
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved).activeTab : "home";
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ tabs, activeTab }));
  }, [tabs, activeTab]);

  const openTab = (id: string) => {
    setTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveTab(id);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t !== id);
      if (id === activeTab) {
        setActiveTab(newTabs[0] ?? "home");
      }
      return newTabs;
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar onSelect={openTab} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onClose={closeTab}
          onSelect={setActiveTab}
        />
        <div className="p-4 flex-1 overflow-auto bg-white">
          {TabComponents[activeTab]}
        </div>
      </div>
    </div>
  );
}
