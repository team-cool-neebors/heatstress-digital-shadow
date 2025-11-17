import {useEffect, useMemo} from 'react';
import type {Layer, PickingInfo} from '@deck.gl/core';
import { makeWmsLayer } from '../layers/wmsLayer';
import { useQgisFeatureInfo } from "./qgisFeatureInfo";
import type { QgisLayerId } from "./qgisLayers";
import { makeOsmTileLayer } from '../layers/osmLayer';
import { useBuildingLayers } from './useBuildingLayers';
import { useObjectLayers } from './useObjectLayers';
import { useUserObjectLayers } from './useUserObjectLayers';

export const WMS_BOUNDS: [number, number, number, number] = [
  3.609725,     // west
  51.4979978,   // south
  3.6170983,    // east
  51.5025997    // north
];

export const WMS_WIDTH = 2048;
export const WMS_HEIGHT = 2048;

type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings: boolean;
  showObjects: boolean;
  isEditingMode: boolean;
  selectedObjectType: string;
  showOverlay: boolean;
  overlayLayerId: QgisLayerId;
};

export function useDeckLayers({ objPath, showBuildings, showObjects, isEditingMode, selectedObjectType, showOverlay, overlayLayerId }: UseDeckLayersOpts) {
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
  
  const { featureInfo, request, clear } = useQgisFeatureInfo({
    bounds: WMS_BOUNDS,
    width: WMS_WIDTH,
    height: WMS_HEIGHT,
    baseUrl: "/nginx",
    layerName: overlayLayerId,
  });

  const wmsLayer = useMemo<Layer | null>(() => {
    if (!showOverlay) return null;

    return makeWmsLayer({
      baseUrl: "/nginx",
      layerName: overlayLayerId,
      bounds: WMS_BOUNDS,
      width: WMS_WIDTH,
      height: WMS_HEIGHT,
      transparent: true,
      opacity: 1,
    });
  }, [showOverlay, overlayLayerId]);

  useEffect(() => {
    if (!showOverlay) {
      clear();
    }
  }, [showOverlay, clear]);

  // Combine all errors for display
  const error = buildingError || objectError || userObjectError || null;

  const layers: Layer[] = useMemo(() => {
    const arr: Layer[] = [osmBase];

    if (buildingsLayer) arr.push(buildingsLayer);
    if (objectLayer) arr.push(objectLayer)
    if (userObjectLayer) arr.push(userObjectLayer);
    if (wmsLayer) arr.push(wmsLayer);

    return arr;
  }, [osmBase, buildingsLayer, objectLayer, userObjectLayer, wmsLayer]);
  
  function handleMapClick(info: PickingInfo): void {
    if (!showOverlay) return;
    if (!info.coordinate) return;

    const [lon, lat] = info.coordinate as [number, number];
    void request(lon, lat);
  }

  return {
    layers,
    error,
    onViewStateClick: handleInteraction,
    saveObjects: saveObjects,
    hasUnsavedChanges,
    featureInfo,
    handleMapClick
  };
}
