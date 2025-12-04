import React, { useState } from "react";
import SideMenuBar from "./SideMenuBar";
import type { SideMenuItem } from "./SideMenuItem";
import SideMenuPanel from "./SideMenuPanel";

interface Props {
  items: SideMenuItem[];
}

const SideMenu: React.FC<Props> = ({ items }) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setActiveItem(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <SideMenuBar
        items={items}
        activeItem={activeItem}
        onSelect={toggleMenu}
      />
      <SideMenuPanel
        activeItem={items.find(i => i.id === activeItem)}
      />
    </div>
  );
};

export default SideMenu;
