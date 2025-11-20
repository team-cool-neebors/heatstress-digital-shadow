import styles from "../../styles/ui/Menu.module.css";
import MenuItem from "./ItemMenu";
import MenuUploadItem from "./UploadItemMenu";
import type { QgisLayerId } from "../../features/wms-overlay/lib/qgisLayers";

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
  overlayLayerId: QgisLayerId;
  onChangeOverlayLayer: (value: QgisLayerId) => void;
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
}: Props) {  return (
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
         <label style={{ display: "flex", alignItems: "center", gap: ".75rem", color: "#0d0c1d" }}>
        <input
          type="checkbox"
          checked={isEditingMode}
          onChange={(e) => onToggleEditingMode(e.target.checked)}
        />
        Editing Mode
      </label>
       {/* QGIS overlay toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".75rem",
          color: "#0d0c1d",
        }}
      >
        <input
          type="checkbox"
          checked={showOverlay}
          onChange={(e) => onToggleOverlay(e.target.checked)}
        />
        Map Overlay View
      </label>

      {/* Overlay layer dropdown (only when enabled) */}
      {showOverlay && (
        <div style={{ marginTop: ".75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: ".85rem",
              color: "#555",
              marginBottom: ".25rem",
            }}
          >
            Overlay layer
          </label>
          <select
            value={overlayLayerId}
            onChange={(e) =>
              onChangeOverlayLayer(e.target.value as QgisLayerId)
            }
            style={{
              width: "100%",
              padding: ".35rem .5rem",
              fontSize: ".9rem",
            }}
          >
            {overlayLayerOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
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

