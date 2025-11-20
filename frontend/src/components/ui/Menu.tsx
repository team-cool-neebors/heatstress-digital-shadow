import styles from "../../styles/ui/Menu.module.css";
import MenuItem from "./ItemMenu";
import MenuUploadItem from "./UploadItemMenu";
import type { QgisLayerId, QgisLayerIdOrEmpty } from "../../features/wms-overlay/lib/qgisLayers";
import OverlayMenuItem from "./OverlayMenuItem";

type Props = {
  open: boolean;
  onClose?: () => void;
  id?: string;
  showBuildings: boolean;
  showObjects: boolean;
  onToggleBuildings: (v: boolean) => void;
  onToggleObjects: (v: boolean) => void;
  isEditingMode: boolean;
  onToggleEditingMode: (v: boolean) => void;
  showOverlay: boolean;
  onToggleOverlay: (value: boolean) => void;
  overlayLayerId: QgisLayerIdOrEmpty;
onChangeOverlayLayer: (value: QgisLayerIdOrEmpty) => void;
  overlayLayerOptions: ReadonlyArray<{ id: QgisLayerId; label: string }>;
};

export default function Menu({
  open,
  id,
  showBuildings,
  showObjects,
  onToggleBuildings,
  onToggleObjects,
  isEditingMode,
  onToggleEditingMode,
  showOverlay,
  onToggleOverlay,
  overlayLayerId,
  onChangeOverlayLayer,
  overlayLayerOptions,
}: Props) {
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
          label="Flora View (Trees)"
          checked={showObjects}
          onChange={onToggleObjects}
        />
        <OverlayMenuItem
  label="Map Overlay View"
  checked={showOverlay}
  onToggle={onToggleOverlay}
  value={overlayLayerId}
  onChange={onChangeOverlayLayer}
  options={overlayLayerOptions}
/>
        <label style={{ display: "flex", alignItems: "center", gap: ".75rem", color: "#0d0c1d" }}>
          <input
            type="checkbox"
            checked={isEditingMode}
            onChange={(e) => onToggleEditingMode(e.target.checked)}
          />
          Editing Mode
        </label>
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

