import type { QgisLayerId } from "../../features/wms-overlay/lib/qgisLayers";
import { QGIS_OVERLAY_LAYERS } from "../../features/wms-overlay/lib/qgisLayers";

type Props = {
  value: QgisLayerId | "";
  onChange: (val: QgisLayerId) => void;
};

export function OverlayLayersPanel({ value, onChange }: Props) {
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
              checked={value === layer.id}
              onChange={() => onChange(layer.id)}
            />
            {layer.label}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
