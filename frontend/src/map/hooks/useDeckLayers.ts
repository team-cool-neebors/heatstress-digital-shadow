import { useMemo } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeOsmTileLayer } from '../../features/basemap/lib/osmLayer';
import { useBuildingsLayer } from '../../features/buildings-3d/useBuildingsLayer';
import { useStaticTreesLayer } from '../../features/objects/useStaticTreesLayer';
import { useUserObjectsLayer } from '../../features/objects/useUserObjectsLayer';
import { useWMSLayers } from '../../features/wms-overlay/useWMSLayers';
import type { QgisLayerId, QgisMapStylesId } from '../../features/wms-overlay/lib/qgisLayers';
import { useWMSStyles } from '../../features/wms-overlay/useWMSStyles';

export type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings: boolean;
  showObjects: boolean;
  isEditingMode: boolean;
  selectedObjectType: string | null;
  setSelectedObjectType: (type: string) => void;
  showOverlay: boolean;
  overlayLayerId: QgisLayerId;
  overlayStyleId: QgisMapStylesId;
  showStyleOverlay: boolean;
};

export function useDeckLayers({
  objPath,
  showBuildings,
  showObjects,
  isEditingMode,
  selectedObjectType,
  setSelectedObjectType,
  showOverlay,
  overlayLayerId,
  overlayStyleId,
  showStyleOverlay,
}: UseDeckLayersOpts) {

  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);

  const {
    layer: buildingsLayer,
    error: buildingError
  } = useBuildingsLayer({
    visible: showBuildings,
    objPath: objPath,
  });

  const { objectLayer, error: objectError } = useStaticTreesLayer(showObjects);

  const {
    userObjectLayers,
    handleInteraction,
    saveObjects,
    discardChanges,
    error: userObjectError,
    hasUnsavedChanges,
    objectsVersion,
    objectTypes,
    isProcessing,
  } = useUserObjectsLayer(
    showObjects,
    isEditingMode,
    selectedObjectType,
    setSelectedObjectType,
  );

  const {
    wmsLayer,
    featureInfo: overlayFeatureInfo,
    handleMapClick: handleOverlayMapClick,
  } = useWMSLayers({
    showOverlay,
    overlayLayerId,
    objectsVersion,
  });

  const {
    wmsStyleLayer,
    featureInfo: styleFeatureInfo,
    handleMapClick: handleStyleMapClick,
  } = useWMSStyles({
    showOverlay: showStyleOverlay,
    overlayStyleId,
    objectsVersion,
  });

  const error = buildingError || objectError || userObjectError || null;

  const layers: Layer[] = useMemo(() => {
    const arr: Layer[] = [osmBase];

    if (buildingsLayer) arr.push(buildingsLayer);
    if (objectLayer) arr.push(objectLayer);
    if (userObjectLayers && Array.isArray(userObjectLayers)) arr.push(...userObjectLayers);
    if (wmsLayer) arr.push(wmsLayer);
    if (wmsStyleLayer) arr.push(wmsStyleLayer);

    return arr;
  }, [osmBase, buildingsLayer, objectLayer, userObjectLayers, wmsLayer, wmsStyleLayer]);

  const handleMapClick = (info: PickingInfo) => {
    handleOverlayMapClick(info);
    handleStyleMapClick(info);
  };

  return {
    layers,
    error,
    onViewStateClick: handleInteraction,
    saveObjects,
    discardChanges,
    hasUnsavedChanges,
    overlayFeatureInfo,
    styleFeatureInfo,
    handleMapClick,
    objectTypes,
    isProcessing,
  };
}
