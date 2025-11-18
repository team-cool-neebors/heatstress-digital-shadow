import styled from "styled-components";
import type { QgisLayerId } from "../features/wms-overlay/lib/qgisLayers";

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

const StyledMenu = styled.nav<{ open: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100dvh;
  background: #ffffffff;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-100%)")};
  transition: transform 0.3s ease-in-out;
  z-index: 1000; /* below burger button but above map */

  @media (max-width: 576px) {
    width: 100%;
  }

  a {
    font-size: 2rem;
    text-transform: uppercase;
    padding: 1rem 0;
    font-weight: bold;
    letter-spacing: 0.2rem;
    color: #0d0c1d;
    text-decoration: none;
    transition: color 0.2s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: #343078;
    }
  }
`;

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
    <StyledMenu id={id} open={open} aria-hidden={!open}>
      {/* Buildings toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".75rem",
          color: "#0d0c1d",
          marginBottom: "1rem",
        }}
      >
        <input
          type="checkbox"
          checked={showBuildings}
          onChange={(e) => onToggleBuildings(e.target.checked)}
        />
        Show buildings
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: ".75rem", color: "#0d0c1d" }}>
        <input
          type="checkbox"
          checked={showObjects}
          onChange={(e) => onToggleObjects(e.target.checked)}
        />
        Show objects
      </label>

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
        Show QGIS overlay
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
    </StyledMenu>
  );
}
