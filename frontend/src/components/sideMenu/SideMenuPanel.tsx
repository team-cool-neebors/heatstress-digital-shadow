import type { SideMenuItem } from "./SideMenuItem";

interface PanelProps {
  activeItem?: SideMenuItem;
}

const SideMenuPanel: React.FC<PanelProps> = ({ activeItem }) => {
  if (!activeItem) return null;

  return (
    <div
      style={{
        width: activeItem ? 300 : 0,
        overflow: "hidden",
        transition: "width 0.3s ease",
        background: "#fff",
        borderLeft: "1px solid #ccc",
        padding: activeItem ? 20 : 0,
      }}
    >
      {activeItem.panel}
    </div>
  );
};

export default SideMenuPanel;
