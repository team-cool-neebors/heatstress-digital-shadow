import React from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import Burger from "./components/ui/Burger";
import SideMenu from "./components/ui/SideMenu";
import { useOnClickOutside } from "./components/ui/hooks/useOnClickOutside";

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
    const { layers, error } = useDeckLayers({
    showBuildings,
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
      />

      <div ref={menuNode} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto" }}>
          <Burger open={open} setOpen={setOpen} aria-controls="main-menu" />
        </div>

        <div style={{ pointerEvents: "auto" }}>
          <SideMenu
            id="main-menu"
            open={open}
            onClose={() => setOpen(false)}
            showBuildings={showBuildings}
            onToggleBuildings={setShowBuildings}
          />
          {error && showBuildings && (
            <div style={{ margin: 8, padding: 8, background:'#ffecec', color:'#a00', borderRadius:8 }}>
              Failed to load OBJ: {String(error.message || error)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
