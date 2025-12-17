import styles from "../../styles/ui/Menu.module.css";
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
}: Props) {
  return (
    <nav
      id={id}
      className={`${styles.menu} ${open ? styles.open : styles.closed}`}
      aria-hidden={!open}
    >
      <div className={styles.menuItems}>
      
  
      
      </div>
    </nav>
  );
}

