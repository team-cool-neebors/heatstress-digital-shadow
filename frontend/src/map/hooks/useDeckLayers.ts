import { useMemo } from 'react';
import type { Layer } from '@deck.gl/core';
import { makeOsmTileLayer } from '../../features/basemap/lib/osmLayer';
import { useBuildingsLayer } from '../../features/buildings-3d/useBuildingsLayer';
import { useStaticTreesLayer } from '../../features/trees/useStaticTreesLayer';
import { useUserTreesLayer } from '../../features/trees/useUserTreesLayer';
import { useWMSLayers } from '../../features/wms-overlay/useWMSLayers';
import type { QgisLayerId } from '../../features/wms-overlay/lib/qgisLayers';


type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings: boolean;
  showObjects: boolean;
  isEditingMode: boolean;
  selectedObjectType: string;
  showOverlay: boolean;
  overlayLayerId: QgisLayerId;
};

export function useDeckLayers({
  objPath,
  showBuildings,
  showObjects,
  isEditingMode,
  selectedObjectType,
  showOverlay,
  overlayLayerId
}: UseDeckLayersOpts) {
  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);

  const {
    layer: buildingsLayer,
    error: buildingError
  } = useBuildingsLayer({
    visible: showBuildings,
    objPath: objPath,
  });

  const { objectLayer, error: objectError } = useStaticTreesLayer(
    showObjects,
    selectedObjectType
  );

  const {
    userObjectLayer,
    handleInteraction,
    saveObjects,
    discardChanges,
    error: userObjectError,
    hasUnsavedChanges,
    objectsVersion,
    exportObjects,
    importObjects
  } = useUserTreesLayer(showObjects, isEditingMode, selectedObjectType);

  const { wmsLayer, featureInfo, handleMapClick } = useWMSLayers({
    showOverlay,
    overlayLayerId,
    objectsVersion,
  });

  const error = buildingError || objectError || userObjectError || null;

  const layers: Layer[] = useMemo(() => {
    const arr: Layer[] = [osmBase];

    if (buildingsLayer) arr.push(buildingsLayer);
    if (objectLayer) arr.push(objectLayer);
    if (userObjectLayer) arr.push(userObjectLayer);
    if (wmsLayer) arr.push(wmsLayer);

    return arr;
  }, [osmBase, buildingsLayer, objectLayer, userObjectLayer, wmsLayer]);

  return {
    layers,
    error,
    onViewStateClick: handleInteraction,
    saveObjects,
    discardChanges,
    hasUnsavedChanges,
    featureInfo,
    handleMapClick,
    exportObjects,
    importObjects
  };
}
