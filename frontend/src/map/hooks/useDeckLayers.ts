import { useMemo } from 'react';
import type { Layer } from '@deck.gl/core';
import type { QgisLayerId } from './qgisLayers';
import { makeOsmTileLayer } from '../../features/basemap/lib/osmLayer';
import { useBuildingsLayer } from '../../features/buildings-3d/useBuildingsLayer';
import { useObjectLayers } from './useObjectLayers';
import { useUserObjectLayers } from './useUserObjectLayers';
import { useWMSLayers } from './useWMSLayers';

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

  const { objectLayer, error: objectError } = useObjectLayers(
    showObjects,
    selectedObjectType
  );

  const { wmsLayer, featureInfo, handleMapClick } = useWMSLayers({
    showOverlay,
    overlayLayerId
  });

  const {
    userObjectLayer,
    handleInteraction,
    saveObjects,
    discardChanges,
    error: userObjectError,
    hasUnsavedChanges
  } = useUserObjectLayers(showObjects, isEditingMode, selectedObjectType);

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
    handleMapClick
  };
}
