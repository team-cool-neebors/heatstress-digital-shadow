import React, { useCallback, useState } from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import { QGIS_OVERLAY_LAYERS, type QgisLayerId } from "./features/wms-overlay/lib/qgisLayers";
import type { PickingInfo } from "@deck.gl/core";
import { useBuildingHighlight } from "./features/buildings-3d/useBuildingHighlight";
import type { SideMenuItem } from "./components/sideMenu/SideMenuItem";
import SideMenu from "./components/sideMenu/SideMenu";
import { LayersIcon } from "./components/icons/LayersIcon";
import { OverlayLayersPanel } from "./components/panels/OverlayLayersPanel";
import { TreeIcon } from "./components/icons/TreeIcon";
import { HeatStressMeasuresPanel } from "./components/panels/HeatStressMeasuresPanel";
import { BuildingIcon } from "./components/icons/BuildingIcon";
import { BuildingsPanel } from "./components/panels/BuildingsPanel";

export type ObjectType = "tree" | "bush" | "pond" | "fountain";

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
  const [isBuildingExpanded, setIsBuildingExpanded] = useState(false);

  const [showObjects, setShowObjects] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedObjectType, setSelectedObjectType] =
    useState<ObjectType | null>(null);

  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayLayerId, setOverlayLayerId] = useState<QgisLayerId>(
    QGIS_OVERLAY_LAYERS[0].id
  );

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

  const handleToggleObjects = (value: boolean) => {
    setShowObjects(value);

    if (!value) {
      setSelectedObjectType(null);
      setIsEditingMode(false);
    }
  };

  const handleSelectObjectType = (type: ObjectType | null) => {
    setSelectedObjectType(type);
    setIsEditingMode(type !== null);
  };

  const items: SideMenuItem[] = [
    {
      id: "overlayLayers",
      icon: <LayersIcon />,
      label: "Overlay Layers",
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
      id: "heatstressmeasures",
      icon: <TreeIcon />,
      label: "Heat Stress Measures",
      panel: (
        <HeatStressMeasuresPanel
          showObjects={showObjects}
          onToggleObjects={handleToggleObjects}
          selectedObjectType={selectedObjectType}
          onSelectObjectType={handleSelectObjectType}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={saveObjects}
          onDiscard={discardChanges}
        />
      ),
    },
    {
      id: "buildings",
      icon: <BuildingIcon />,
      label: "Buildings (3D View)",
      panel: <BuildingsPanel />,
    },
  ];

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

  const menuNode = React.useRef<HTMLDivElement>(null);

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

      <div ref={menuNode} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", height: "100dvh", width: 400, pointerEvents: "auto" }}>
          <SideMenu items={items} />
        </div>
      </div>
    </div>
  )
}