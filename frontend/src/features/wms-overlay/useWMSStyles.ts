import { useEffect, useMemo } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeWmsLayer } from './lib/wmsLayer';
import { useQgisFeatureInfo } from "./lib/qgisFeatureInfo";
import { QGIS_OVERLAY_LAYERS, type QgisMapStylesId } from './lib/qgisLayers';

export const WMS_BOUNDS: [number, number, number, number] = [
  3.588347,     // west
  51.4626817,   // south
  3.6581358,    // east
  51.5199357,   // north
];

export const WMS_WIDTH = 2048;
export const WMS_HEIGHT = 2048;

type UseWMSStylesOpts = {
    showOverlay: boolean;
    overlayStyleId: QgisMapStylesId;
    objectsVersion: number;
};

export function useWMSStyles({ showOverlay, overlayStyleId, objectsVersion }: UseWMSStylesOpts) {
    const WMS_BASE_URL = "/backend/qgis/wms"; 
    const petLayerId = QGIS_OVERLAY_LAYERS[0].id;
    const wmsStyleLayer = useMemo<Layer | null>(() => {
        if (!showOverlay) return null;

        return makeWmsLayer({
            id: `wms-overlay-${overlayStyleId}-${objectsVersion}`,
            baseUrl: WMS_BASE_URL,
            layerName: petLayerId,
            bounds: WMS_BOUNDS,
            minZoom: 0,
            maxZoom: 24,
            transparent: true,
            opacity: 1,
            cacheBuster: objectsVersion,
        });
    }, [showOverlay, overlayStyleId, objectsVersion]);

    const { featureInfo, request, clear } = useQgisFeatureInfo({
        bounds: WMS_BOUNDS,
        width: WMS_WIDTH,
        height: WMS_HEIGHT,
        baseUrl: WMS_BASE_URL,
        layerName: petLayerId,
    });

    useEffect(() => {
        if (!showOverlay) {
            clear();
        }
    }, [showOverlay, clear]);

    useEffect(() => {
        if (!showOverlay) return;

        const updateStyle = async () => {
            try {
                const response = await fetch(`/backend/update-style?style_name=${encodeURIComponent(overlayStyleId)}`, {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Failed to update style: ${response.status} ${response.statusText}`);
                }
            } catch (e) {
                console.error('Error updating style:', e);
            }
        };

        void updateStyle();
    }, [showOverlay, overlayStyleId]);

    const handleMapClick = (info: PickingInfo): void => {
        if (!showOverlay) return;
        if (!info.coordinate) return;

        const [lon, lat] = info.coordinate as [number, number];
        void request(lon, lat);
    }

    return {
        wmsStyleLayer,
        featureInfo,
        handleMapClick,
    };
}
