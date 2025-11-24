import { useEffect, useMemo } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeWmsLayer } from './lib/wmsLayer';
import { useQgisFeatureInfo } from "./lib/qgisFeatureInfo";
import type { QgisLayerId } from "./lib/qgisLayers";

export const WMS_BOUNDS: [number, number, number, number] = [
    3.609725,     // west
    51.4979978,   // south
    3.6170983,    // east
    51.5025997    // north
];

export const WMS_WIDTH = 2048;
export const WMS_HEIGHT = 2048;

type UseWMSLayersOpts = {
    showOverlay: boolean;
    overlayLayerId: QgisLayerId;
};

const WMS_BASE_URL = "/backend/qgis/wms"; 

export function useWMSLayers({ showOverlay, overlayLayerId }: UseWMSLayersOpts) {
    const wmsLayer = useMemo<Layer | null>(() => {
        if (!showOverlay) return null;

        return makeWmsLayer({
            baseUrl: WMS_BASE_URL,
            layerName: overlayLayerId,
            bounds: WMS_BOUNDS,
            width: WMS_WIDTH,
            height: WMS_HEIGHT,
            transparent: true,
            opacity: 1,
        });
    }, [showOverlay, overlayLayerId]);

    const { featureInfo, request, clear } = useQgisFeatureInfo({
        bounds: WMS_BOUNDS,
        width: WMS_WIDTH,
        height: WMS_HEIGHT,
        baseUrl: WMS_BASE_URL,
        layerName: overlayLayerId,
    });

    useEffect(() => {
        if (!showOverlay) {
            clear();
        }
    }, [showOverlay, clear]);

    const handleMapClick = (info: PickingInfo): void => {
        if (!showOverlay) return;
        if (!info.coordinate) return;

        const [lon, lat] = info.coordinate as [number, number];
        void request(lon, lat);
    }

    return {
        wmsLayer,
        featureInfo,
        handleMapClick,
    };
}
