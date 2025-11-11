import React from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import Burger from "./ui/Burger";
import Menu from "./ui/Menu";
import { useOnClickOutside } from "./ui/hooks/useOnClickOutside";

// TODO: change this to backend API call to fetch available object types when db is added
const OBJECT_TYPES = ['tree'];

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
  const [showObjects, setShowObjects] = React.useState(false);
  const [isEditingMode, setIsEditingMode] = React.useState(false);
  const [selectedObjectType, setSelectedObjectType] = React.useState(OBJECT_TYPES[0]);
  const {
    layers,
    error,
    onViewStateClick,
    saveObjects,
  } = useDeckLayers({
    showBuildings,
    showObjects,
    isEditingMode,
    selectedObjectType,
    objPath: 'data/10-72-338-LoD22-3D.obj',
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
        onClick={onViewStateClick}
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
            style={{ padding: '8px 15px', cursor: 'pointer' }}
          >
            Save Objects
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
          />
          {error && showBuildings && (
            <div style={{ margin: 8, padding: 8, background: '#ffecec', color: '#a00', borderRadius: 8 }}>
              Failed to load OBJ: {String(error.message || error)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
