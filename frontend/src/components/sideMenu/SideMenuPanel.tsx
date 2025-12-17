import type { SideMenuItem } from "./SideMenuItem";

interface PanelProps {
  activeItem?: SideMenuItem;
  onClose: () => void;
}

const SideMenuPanel: React.FC<PanelProps> = ({ activeItem, onClose }) => {
  if (!activeItem) return null;

  return (
    <div
      style={{
        width: 300,
        background: "#fff",
        borderLeft: "1px solid #ccc",
        padding: 20,
        position: "relative",   // to position the X button
      }}
    >
      {/* Close (X) button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "transparent",
          border: "none",
          fontSize: 20,
          cursor: "pointer",
          width: 50,
        }}
        aria-label="Close panel"
      >
        ×
      </button>

      {/* Panel content */}
      {activeItem.panel}
    </div>
  );
};

export default SideMenuPanel;
