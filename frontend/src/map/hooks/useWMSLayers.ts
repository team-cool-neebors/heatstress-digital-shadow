import { useEffect, useMemo } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeWmsLayer } from '../layers/wmsLayer';
import { useQgisFeatureInfo } from "./qgisFeatureInfo";
import type { QgisLayerId } from "./qgisLayers";

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

export function useWMSLayers({ showOverlay, overlayLayerId }: UseWMSLayersOpts) {
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

    const { featureInfo, request, clear } = useQgisFeatureInfo({
        bounds: WMS_BOUNDS,
        width: WMS_WIDTH,
        height: WMS_HEIGHT,
        baseUrl: "/nginx",
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
