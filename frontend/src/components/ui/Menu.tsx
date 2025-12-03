import styles from "../../styles/ui/Menu.module.css";
import MenuItem from "./MenuItem";
import type { QgisLayerId } from "../../features/wms-overlay/lib/qgisLayers";
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
          label="Objects View"
          checked={showObjects}
          onChange={onToggleObjects}
        >
          {showObjects && (
            <label className={styles.menuItemLabel}>
              <input
                type="checkbox"
                checked={isEditingMode}
                onChange={(e) => onToggleEditingMode(e.target.checked)}
              />
              Editing Mode
            </label>
          )}
        </MenuItem>
        <OverlayMenuItem
          label="Map Overlay View"
          checked={showOverlay}
          onToggle={onToggleOverlay}
          value={overlayLayerId}
          onChange={onChangeOverlayLayer}
          options={overlayLayerOptions}
        />
      </div>
    </nav>
  );
}

