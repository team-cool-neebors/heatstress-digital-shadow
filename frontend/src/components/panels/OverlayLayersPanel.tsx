import type { QgisLayerId, QgisMapStylesId } from "../../features/wms-overlay/lib/qgisLayers";
import { QGIS_MAP_STYLES, QGIS_OVERLAY_LAYERS } from "../../features/wms-overlay/lib/qgisLayers";

type OverlayProps = {
  overlayLayerId: QgisLayerId | "";
  onOverlayLayerChange: (val: QgisLayerId) => void;
  overlayStyleId: QgisMapStylesId | "";
  onOverlayStyleChange: (val: QgisMapStylesId) => void;
  showStyles: boolean;
};

export function OverlayLayersPanel({
  overlayLayerId,
  onOverlayLayerChange,
  overlayStyleId,
  onOverlayStyleChange,
  showStyles,
}: OverlayProps) {
  return (
    <div>
      <h3>Overlay Layers</h3>

      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        {QGIS_OVERLAY_LAYERS.map((layer) => (
          <label
            key={layer.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="overlay-layer"
              checked={overlayLayerId === layer.id}
              onChange={() => onOverlayLayerChange(layer.id)}
              style={{
                cursor: "pointer",
              }}
            />
            {layer.label}
          </label>
        ))}
      </fieldset>

      {showStyles && (
        <>
          <h3>Overlay Styles</h3>
          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            {QGIS_MAP_STYLES.map((style) => (
              <label
                key={style.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="overlay-style"
                  checked={overlayStyleId === style.id}
                  onChange={() => onOverlayStyleChange(style.id)}
                  style={{
                    cursor: "pointer",
                  }}
                />
                {style.label}
              </label>
            ))}
          </fieldset>
        </>
      )}
    </div>
  );
}
