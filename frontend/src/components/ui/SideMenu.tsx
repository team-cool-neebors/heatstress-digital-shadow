import styles from "../../styles/ui/Menu.module.css";
import MenuItem from "./ItemMenu";
import MenuUploadItem from "./UploadItemMenu";

type Props = {
  open: boolean;
  onClose?: () => void;
  id?: string;
  showBuildings: boolean;
  onToggleBuildings: (v: boolean) => void;
};

export default function SideMenu({ open, id, showBuildings, onToggleBuildings }: Props) {
  return (
    <nav
      id={id}
      className={`${styles.menu} ${open ? styles.open : styles.closed}`}
      aria-hidden={!open}
    >
      <h2 className={styles.menuTitle}>Map Layers</h2>
      <div className={styles.menuItems}>
        <MenuItem
          label="3D View (Buildings)"
          checked={showBuildings}
          onChange={onToggleBuildings}
        />
        <MenuItem
          label="Heat Stress Overlay"
        />
        <MenuUploadItem
          label="Import Your Own Map"
          categories={["Wind Map", "PET Map", "Weather Map"]}
          accept=".geojson,.tif,.qgz"
          onUpload={(file, category) => {
            console.log("Uploading:", file.name, "→", category);
          }}
        />
      </div>
    </nav>
  );
}

