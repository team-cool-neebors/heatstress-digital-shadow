import React, { useCallback } from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import Burger from "./ui/Burger";
import Menu from "./ui/Menu";
import { useOnClickOutside } from "./ui/hooks/useOnClickOutside";
import { QGIS_OVERLAY_LAYERS, type QgisLayerId } from "./features/wms-overlay/lib/qgisLayers";
import type { PickingInfo } from "@deck.gl/core";

// TODO: change this to backend API call to fetch available object types when db is added
const OBJECT_TYPES = ['tree'];

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
  const [showObjects, setShowObjects] = React.useState(false);
  const [isEditingMode, setIsEditingMode] = React.useState(false);
  const [selectedObjectType, setSelectedObjectType] = React.useState(OBJECT_TYPES[0]);
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [overlayLayerId, setOverlayLayerId] = React.useState<QgisLayerId>("pet-version-1");
  const {
    layers,
    error,
    onViewStateClick,
    saveObjects,
    discardChanges,
    hasUnsavedChanges,
    featureInfo,
    handleMapClick
  } = useDeckLayers({
    showBuildings,
    showObjects,
    isEditingMode,
    selectedObjectType,
    objPath: 'data/10-72-338-LoD22-3D.obj',
    showOverlay,
    overlayLayerId,
  });

  const deckClickHandler = useCallback((info: PickingInfo) => {
    const handledByInteraction = onViewStateClick(info);

    handleMapClick(info);

    return handledByInteraction;
  }, [onViewStateClick, handleMapClick]);

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
        onMapInteraction={deckClickHandler}
      />

      {isEditingMode && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          top: 10,
          right: 10,
          zIndex: 10
        }}>
          <select
            value={selectedObjectType}
            onChange={(e) => setSelectedObjectType(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          >
            {OBJECT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={saveObjects}
            disabled={!hasUnsavedChanges}
            style={{ padding: '8px 15px', cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed' }}
          >
            Save Objects
          </button>
          <button
            onClick={discardChanges}
            disabled={!hasUnsavedChanges}
            style={{ padding: '8px 15px', cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed' }}
          >
            Discard Changes
          </button>
        </div>
      )}

      <div ref={menuNode} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto" }}>
          <Burger open={open} setOpen={setOpen} aria-controls="main-menu" />
        </div>

        <div style={{ pointerEvents: "auto" }}>
          <Menu
            id="main-menu"
            open={open}
            onClose={() => setOpen(false)}
            showBuildings={showBuildings}
            showObjects={showObjects}
            onToggleBuildings={setShowBuildings}
            onToggleObjects={setShowObjects}
            isEditingMode={isEditingMode}
            onToggleEditingMode={setIsEditingMode}
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
