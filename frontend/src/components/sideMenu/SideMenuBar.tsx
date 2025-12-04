import type { SideMenuItem } from "./SideMenuItem";

interface BarProps {
  items: SideMenuItem[];
  activeItem: string | null;
  onSelect: (id: string) => void;
}

const SideMenuBar: React.FC<BarProps> = ({ items, activeItem, onSelect }) => {
  return (
    <div style={{ width: 50, background: "#f4f4f4", paddingTop: 10 }}>
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          style={{
            cursor: "pointer",
            padding: 10,
            background: activeItem === item.id ? "#dedede" : "transparent"
          }}
          title={item.label}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default SideMenuBar;
