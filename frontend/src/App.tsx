import type { MeasureType } from "./features/objects/lib/objectLayer";
import type { PickingInfo } from "@deck.gl/core";
import type { SideMenuItem } from "./components/sideMenu/SideMenuItem";
import React, { useCallback, useEffect, useState } from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import { QGIS_OVERLAY_LAYERS, type QgisLayerId, QGIS_MAP_STYLES, type QgisMapStylesId } from "./features/wms-overlay/lib/qgisLayers";
import { useBuildingHighlight } from "./features/buildings-3d/useBuildingHighlight";
import { SideMenu } from "./components/sideMenu/SideMenu";
import { LayersIcon } from "./components/icons/LayersIcon";
import { OverlayLayersPanel } from "./components/panels/OverlayLayersPanel";
import { TreeIcon } from "./components/icons/TreeIcon";
import { HeatStressMeasuresPanel } from "./components/panels/HeatStressMeasuresPanel";
import { BuildingIcon } from "./components/icons/BuildingIcon";
import { BuildingsPanel } from "./components/panels/BuildingsPanel";
import { BuildingInfoCard } from "./components/infoCards/BuildingInfoCard";
import { FeatureInfoCard } from "./components/infoCards/FeatureInfoCard";
import { LoadingIndicator } from "./components/loading/LoadingIndicator";

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);

  const [showObjects, setShowObjects] = useState(false);
  const [editingIntent, setEditingIntent] = useState(false);
  const [activeSideMenuId, setActiveSideMenuId] = useState<string | null>(null);
  const isEditingMode = editingIntent && activeSideMenuId === "heatstressmeasures";
  const [selectedObjectType, setSelectedObjectType] =
    useState<string | null>(null);
  const loaderLeft = activeSideMenuId ? "25.5rem" : "4rem";

  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayLayerId, setOverlayLayerId] = useState<QgisLayerId>(
    QGIS_OVERLAY_LAYERS[0].id
  );
  const [overlayStyleId, setOverlayStyleId] = useState<QgisMapStylesId>(
    QGIS_MAP_STYLES[0].id
  );
  const [showStyleOverlay, setShowStyleOverlay] = useState(true);
  const isPetOverlay = overlayLayerId === QGIS_OVERLAY_LAYERS[0].id;
  const showOverlayStyles = isPetOverlay;
  const showOverlayLayer = showOverlay && !isPetOverlay;

  const [activeOverlaySubpanel, setActiveOverlaySubpanel] =
  useState<"layers" | "styles">("layers");

  const {
    layers,
    onViewStateClick,
    saveObjects,
    discardChanges,
    hasUnsavedChanges,
    styleFeatureInfo,
    overlayFeatureInfo,
    handleMapClick,
    objectTypes,
    isProcessing,
  } = useDeckLayers({
    showBuildings,
    showObjects,
    isEditingMode,
    selectedObjectType,
    setSelectedObjectType,
    objPath: 'data/10-72-338-LoD22-3D_leveled.obj',
    showOverlay: showOverlayLayer,
    overlayLayerId,
    overlayStyleId,
    showStyleOverlay: showOverlayStyles && showStyleOverlay,
  });

  const activeFeatureInfo =
  isPetOverlay ? styleFeatureInfo : overlayFeatureInfo;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleToggleObjects = (value: boolean) => {
    setShowObjects(value);

    if (!value) {
      setSelectedObjectType(null);
      setEditingIntent(false);
    }
  };

  const handleSelectObjectType = (type: MeasureType | null) => {
    if (!type) {
      setSelectedObjectType(null);
      setEditingIntent(false);
      return;
    }

    const typeExists = objectTypes.find(t => t.name === type.name) ? true : false;

    if (!typeExists) {
      console.warn("Selected object type not found.");
      return;
    }

    setSelectedObjectType(type.name);
    setEditingIntent(typeExists);
  };

  const items: SideMenuItem[] = [
    {
      id: "overlayLayers",
      icon: <LayersIcon />,
      label: "Overlay Layers",
      panel: (
        <div>
          <OverlayLayersPanel
            overlayLayerId={overlayLayerId}
            onOverlayLayerChange={(id) => {
              setShowOverlay(true);
              setOverlayLayerId(id);
              if (id === QGIS_OVERLAY_LAYERS[0].id) {
                setShowStyleOverlay(true);
                setActiveOverlaySubpanel("styles");
              } else {
                setShowStyleOverlay(false);
                setActiveOverlaySubpanel("layers");
              }
            }}
            overlayStyleId={overlayStyleId}
            onOverlayStyleChange={(id) => {
              setShowOverlay(true);
              setOverlayStyleId(id);
              setShowStyleOverlay(true);
              setActiveOverlaySubpanel("styles");
            }}
            showStyles={showOverlayStyles}
          />
        </div>
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
          objectTypes={objectTypes}
          selectedObjectType={selectedObjectType}
          onSelectObjectType={handleSelectObjectType}
          hasUnsavedChanges={hasUnsavedChanges}
          isProcessing={isProcessing}
          onSave={saveObjects}
          onDiscard={discardChanges}
        />
      ),
    },
    {
      id: "buildings",
      icon: <BuildingIcon />,
      label: "Buildings (3D View)",
      panel: (
        <BuildingsPanel
          showBuildings={showBuildings}
          onToggleBuildings={setShowBuildings}
        />
      ),
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

      {isProcessing && (
        <LoadingIndicator
          label="Processing"
          backgroundColor="white"
          textColor="black"
          left={loaderLeft}
        />
      )}

      {/* TOP RIGHT INFO PANEL */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1000,
        pointerEvents: "none"
      }}>
        {buildingInfo ? (
          <BuildingInfoCard
            buildingInfo={buildingInfo}
            activeVbos={activeVbos}
            usageFunctions={usageFunctions}
          />
        ) : activeFeatureInfo ? (
          <FeatureInfoCard info={activeFeatureInfo} />
        ) : null}
      </div>

      <div ref={menuNode} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", height: "100dvh", width: 400, pointerEvents: "auto" }}>
          <SideMenu
            items={items}
            activeId={activeSideMenuId}
            onChange={setActiveSideMenuId} />
        </div>
      </div>
    </div>
  )
}
