import { useMemo } from 'react';
import type { Layer } from '@deck.gl/core';
import { makeOsmTileLayer } from '../layers/osmLayer';
import { useBuildingLayers } from './useBuildingLayers';
import { useObjectLayers } from './useObjectLayers';
import { useUserObjectLayers } from './useUserObjectLayers';

type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings: boolean;
  showObjects: boolean;
  isEditingMode: boolean;
  selectedObjectType: string;
};

export function useDeckLayers({ objPath, showBuildings, showObjects, isEditingMode, selectedObjectType }: UseDeckLayersOpts) {
  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);
  const { buildingsLayer, error: buildingError } = useBuildingLayers(objPath, showBuildings);
  const { objectLayer, error: objectError } = useObjectLayers(showObjects, selectedObjectType);
  const {
    userObjectLayer,
    handleInteraction,
    saveObjects,
    error: userObjectError,
    hasUnsavedChanges
  } = useUserObjectLayers(showObjects, isEditingMode, selectedObjectType);

  // Combine all errors for display
  const error = buildingError || objectError || userObjectError || null;

  const layers: Layer[] = useMemo(() => {
    const arr: Layer[] = [osmBase];

    if (buildingsLayer) arr.push(buildingsLayer);
    if (objectLayer) arr.push(objectLayer)
    if (userObjectLayer) arr.push(userObjectLayer);

    return arr;
  }, [osmBase, buildingsLayer, objectLayer, userObjectLayer]);

  return {
    layers,
    error,
    onViewStateClick: handleInteraction,
    saveObjects: saveObjects,
    hasUnsavedChanges,
  };
}
