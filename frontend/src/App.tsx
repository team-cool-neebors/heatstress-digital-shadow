import React, { useCallback, useState } from "react";
import DeckMap from "./map/DeckMap";
import { useDeckLayers } from "./map/hooks/useDeckLayers";
import Burger from "./components/ui/Burger";
import Menu from "./components/ui/Menu";
import { useOnClickOutside } from "./components/ui/hooks/useOnClickOutside";
import { QGIS_OVERLAY_LAYERS, type QgisLayerId } from "./features/wms-overlay/lib/qgisLayers";
import { DEFAULT_OBJECT_TYPE } from "./map/utils/deckUtils";
import { useBuildingHighlight } from "./features/buildings-3d/useBuildingHighlight";
import type { PickingInfo } from "@deck.gl/core";
import Button from "./components/ui/Button";
import styles from "./styles/ui/Menu.module.css";

export default function App() {
  const [showBuildings, setShowBuildings] = React.useState(false);
  const [showObjects, setShowObjects] = React.useState(false);
  const [isEditingMode, setIsEditingMode] = React.useState(false);
  const [selectedObjectType, setSelectedObjectType] = React.useState(DEFAULT_OBJECT_TYPE);
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [overlayLayerId, setOverlayLayerId] = useState<QgisLayerId>("");
  const [isBuildingExpanded, setIsBuildingExpanded] = useState(false);

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
    objectTypes,
  } = useDeckLayers({
    showBuildings,
    showObjects,
    isEditingMode,
    selectedObjectType,
    setSelectedObjectType,
    objPath: 'data/10-72-338-LoD22-3D_leveled.obj',
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

      {isEditingMode && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            top: 10,
            right: 10,
            zIndex: 10,
          }}
        >
          <select
            value={selectedObjectType}
            onChange={(e) => setSelectedObjectType(e.target.value)}
            className={styles.dropdownMenu}
          >
            {objectTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
          <Button
            label="Save Objects"
            onClick={saveObjects}
            disabled={!hasUnsavedChanges}
          />
          <Button
            label="Discard Changes"
            onClick={discardChanges}
            disabled={!hasUnsavedChanges}
          />
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
            onToggleObjects={handleToggleObjects}
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
              Failed to load OBJ:{" "}
              {error instanceof Error ? error.message : String(error)}
            </div>
          )}
        </div>

        {(featureInfo || buildingInfo) && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              pointerEvents: "none",
            }}
          >
            {/* Overlay feature info (PET band, lon, lat) */}
            {featureInfo && (
              <div
                style={{
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
                  {featureInfo.band != null
                    ? featureInfo.band.toFixed(4)
                    : "n/a"}
                </div>
                <div>
                  <strong>Lon:</strong> {featureInfo.lon.toFixed(6)}
                </div>
                <div>
                  <strong>Lat:</strong> {featureInfo.lat.toFixed(6)}
                </div>
              </div>
            )}

            {/* Building info card, right of feature-info if both exist */}
            {buildingInfo && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "#ffffff",
                  color: "#222222",
                  borderRadius: isBuildingExpanded ? 16 : 999,
                  fontSize: 13,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  pointerEvents: "auto",
                  minWidth: 220,
                  maxWidth: 340,
                  overflow: "hidden",
                }}
              >
                {/* Top row: Building ID + "+" button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      marginRight: 8,
                    }}
                  >
                    <strong>Building ID:&nbsp;</strong>
                    <span>{buildingInfo.pand_data?.bag_id ?? buildingInfo.bag_id}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBuildingExpanded((prev) => !prev)}
                    style={{
                      background: "#ffffff",
                      borderRadius: "999px",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: "#000000ff",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      marginBottom: 3,
                    }}
                    aria-label={
                      isBuildingExpanded ? "Hide building details" : "Show building details"
                    }
                  >
                    {isBuildingExpanded ? "−" : "+"}
                  </button>
                </div>

                {/* Extra details only when expanded */}
                {isBuildingExpanded && (
                  <div
                    style={{
                      marginTop: 6,
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                      paddingTop: 6,
                      fontSize: 12,
                    }}
                  >
                    {/* Main 3 lines */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        columnGap: 8,
                        rowGap: 2,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Construction year</span>
                      <span>
                        {buildingInfo.pand_data?.construction_year ?? "Unknown"}
                      </span>

                      <span style={{ fontWeight: 500 }}>Status</span>
                      <span>{buildingInfo.pand_data?.status ?? "Unknown"}</span>

                      <span style={{ fontWeight: 500 }}>Usage Function</span>
                      <span>
                        {usageFunctions.length ? usageFunctions.join(", ") : "Unknown"}
                      </span>
                    </div>

                    {/* Detailed VBO rows – only "Verblijfsobject in gebruik" */}
                    {activeVbos.length > 0 && (
                      <>
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: 4,
                          }}
                        >
                          Units in use
                        </div>

                        <div
                          style={{
                            maxHeight: 120,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            paddingRight: 4,
                          }}
                        >
                          {activeVbos.map((vbo) => (
                            <div
                              key={vbo.bag_id}
                              style={{
                                padding: "4px 6px",
                                borderRadius: 6,
                                background: "rgba(0,0,0,0.03)",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 500,
                                  fontSize: 11,
                                  marginBottom: 2,
                                }}
                              >
                                VBO {vbo.bag_id}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#555",
                                }}
                              >
                                {(vbo.usage_function || []).join(", ") || "—"} ·{" "}
                                {vbo.surface_area_m2} m² · {vbo.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
