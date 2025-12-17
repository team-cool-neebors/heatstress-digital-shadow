import React, { useCallback, useState } from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import { useOnClickOutside } from "./components/ui/hooks/useOnClickOutside";
import { QGIS_OVERLAY_LAYERS, type QgisLayerId } from "./features/wms-overlay/lib/qgisLayers";
import type { PickingInfo } from "@deck.gl/core";
import { useBuildingHighlight } from "./features/buildings-3d/useBuildingHighlight";
import type { SideMenuItem } from "./components/sideMenu/SideMenuItem";

import SideMenu from "./components/sideMenu/SideMenu";
import { LayersIcon } from "./components/icons/LayersIcon";
import { OverlayLayersPanel } from "./components/panels/OverlayLayersPanel";
import { TreeIcon } from "./components/icons/TreeIcon";
import { HeatStressMeasuresPanel } from "./components/panels/HeatStressMeasuresPanel";

// TODO: change this to backend API call to fetch available object types when db is added
const OBJECT_TYPES = ["tree"];

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
  const [showObjects, setShowObjects] = React.useState(false);
  const [isEditingMode, setIsEditingMode] = React.useState(false);
  const [selectedObjectType, setSelectedObjectType] = React.useState(OBJECT_TYPES[0]);
 const [showOverlay, setShowOverlay] = useState(true);
const [overlayLayerId, setOverlayLayerId] = useState<QgisLayerId>(
  QGIS_OVERLAY_LAYERS[0].id
);
  const [isBuildingExpanded, setIsBuildingExpanded] = useState(false);

const items: SideMenuItem[] = [
  {
    id: "layers",
    icon: <LayersIcon />,
    label: "Layers",
    panel: (
      <OverlayLayersPanel
        value={overlayLayerId}
        onChange={(id) => {
          setShowOverlay(true);
          setOverlayLayerId(id);
        }}
      />
    ),
  },
  {
    id: "heat",
    icon: <TreeIcon />,
    label: "Heatstress measures",
    panel: <HeatStressMeasuresPanel />,
  },
];


  const handleToggleObjects = (value: boolean) => {
    setShowObjects(value);

    if (!value) {
      setIsEditingMode(false);
    }
  };

  const {
    layers,
    error,
    onViewStateClick,
    saveObjects,
    discardChanges,
    hasUnsavedChanges,
    featureInfo,
    handleMapClick,
  } = useDeckLayers({
    showBuildings,
    showObjects,
    isEditingMode,
    selectedObjectType,
    objPath: "data/10-72-338-LoD22-3D_leveled.obj",
    showOverlay,
    overlayLayerId,
  });

  const { highlightLayer, handleBuildingClick, buildingInfo } = useBuildingHighlight({
    enabled: showBuildings,
  });

  const activeVbos =
    buildingInfo?.verblijfsobject_data?.filter(
      (vbo) => vbo.status === "Verblijfsobject in gebruik"
    ) ?? [];

  const usageFunctions = Array.from(
    new Set(activeVbos.flatMap((vbo) => vbo.usage_function ?? []))
  );

  const deckClickHandler = useCallback(
    (info: PickingInfo) => {
      handleBuildingClick(info);
      setIsBuildingExpanded(false);

      const handledByInteraction = onViewStateClick(info);

      handleMapClick(info);

      return handledByInteraction;
    },
    [handleBuildingClick, onViewStateClick, handleMapClick]
  );

  const [open, setOpen] = React.useState(false);
  const menuNode = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(menuNode.current, () => setOpen(false));

  return (
    <div style={{ position: "relative", height: "100dvh", width: "100%" }}>
      <DeckMap
        layers={highlightLayer ? [...layers, highlightLayer] : layers}
        initialViewState={{
          longitude: 3.613,
          latitude: 51.5,
          zoom: 14,
          pitch: 45,
          bearing: 0,
        }}
        onMapInteraction={deckClickHandler}
        isEditingMode={isEditingMode}
      />
      <div style={{ position: "absolute", height: "100dvh", width: "100%" }}>
        <SideMenu items={items} />
      </div>
      </div>
  )
}