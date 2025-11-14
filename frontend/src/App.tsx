import React from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import Burger from "./ui/Burger";
import Menu from "./ui/Menu";
import { useOnClickOutside } from "./ui/hooks/useOnClickOutside";
import { QGIS_OVERLAY_LAYERS, type QgisLayerId } from "./map/hooks/qgisLayers";

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [overlayLayerId, setOverlayLayerId] = React.useState<QgisLayerId>("pet-version-1");

  const { layers, error, featureInfo, handleMapClick } = useDeckLayers({
    showBuildings,
    objPath: 'data/10-72-338-LoD22-3D.obj',
    showOverlay,
    overlayLayerId,
  });

  const [open, setOpen] = React.useState(false);
  const menuNode = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(menuNode.current, () => setOpen(false));

  return (
    <div style={{ position: "relative", height: "100dvh", width: "100%" }}>
      <DeckMap
        layers={layers}
        initialViewState={{
          longitude: 3.613,
          latitude: 51.5,
          zoom: 14,
          pitch: 45,
          bearing: 0,
        }}
        onMapClick={handleMapClick}
      />

      <div
        ref={menuNode}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <Burger open={open} setOpen={setOpen} aria-controls="main-menu" />
        </div>

        <div style={{ pointerEvents: "auto" }}>
          <Menu
            id="main-menu"
            open={open}
            onClose={() => setOpen(false)}
            showBuildings={showBuildings}
            onToggleBuildings={setShowBuildings}
            showOverlay={showOverlay}
            onToggleOverlay={setShowOverlay}
            overlayLayerId={overlayLayerId}
            onChangeOverlayLayer={setOverlayLayerId}
            overlayLayerOptions={QGIS_OVERLAY_LAYERS}
          />
          {error && showBuildings && (
            <div
              style={{
                margin: 8,
                padding: 8,
                background: "#ffecec",
                color: "#a00",
                borderRadius: 8,
              }}
            >
              Failed to load OBJ: {String(error.message || error)}
            </div>
          )}
        </div>

        {featureInfo && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              padding: "10px 18px",
              background: "#ffffff",
              color: "#222222",
              borderRadius: 999,
              fontSize: 13,
              display: "flex",
              gap: 16,
              alignItems: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              border: "1px solid rgba(0,0,0,0.08)",
              pointerEvents: "auto",
            }}
          >
            <div>
              <strong>Band 1:</strong>{" "}
              {featureInfo.band != null ? featureInfo.band.toFixed(4) : "n/a"}
            </div>
            <div>
              <strong>Lon:</strong> {featureInfo.lon.toFixed(6)}
            </div>
            <div>
              <strong>Lat:</strong> {featureInfo.lat.toFixed(6)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
