import {useEffect, useMemo, useState} from 'react';
import type {Layer, PickingInfo} from '@deck.gl/core';
import {makeOsmTileLayer} from '../layers/osmLayer';
import {load} from '@loaders.gl/core';
import {OBJLoader} from '@loaders.gl/obj';
import {buildObjLayerFromMesh, computeCentroidRD} from '../layers/buildingsLayer';
import {rdToLonLat} from '../utils/crs';
import type {Mesh, MeshAttribute} from '@loaders.gl/schema';
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

type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings?: boolean;
  showOverlay: boolean;
  overlayLayerId: QgisLayerId;
};

function resolveUrl(path?: string): string | undefined {
  if (!path) return undefined;
  const base =
    (typeof document !== 'undefined' && document.baseURI) ||
    (typeof window !== 'undefined' && window.location?.href) ||
    '/';

  return new URL(path, base).toString();
}

function getPositionArray(mesh: Mesh): Float32Array {
  const attr = mesh.attributes?.POSITION as MeshAttribute | undefined;
  if (!attr) throw new Error('OBJ mesh has no POSITION attribute');
  const v = attr.value as unknown;

  if (v instanceof Float32Array) return v;
  if (typeof v === 'object' && v !== null) {
    if (ArrayBuffer.isView(v)) {
      if (v instanceof DataView) {
        throw new Error('Unsupported POSITION value type: DataView');
      }
      return Float32Array.from(v as unknown as ArrayLike<number>);
    }
    if (v instanceof ArrayBuffer) {
      return new Float32Array(v);
    }
  }

  if (Array.isArray(v)) {
    return Float32Array.from(v);
  }

  throw new Error('Unsupported POSITION value type');
}

export function useDeckLayers({
  objPath, showBuildings, showOverlay, overlayLayerId, 
}: UseDeckLayersOpts) {
  const objUrl = showBuildings ? resolveUrl(objPath) : undefined;
  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);
  const [objLayer, setObjLayer] = useState<Layer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { featureInfo, request, clear } = useQgisFeatureInfo({
    bounds: WMS_BOUNDS,
    width: WMS_WIDTH,
    height: WMS_HEIGHT,
    baseUrl: "/qgis",
    layerName: overlayLayerId,
  });

  const wmsLayer = useMemo<Layer | null>(() => {
    if (!showOverlay) return null;

    return makeWmsLayer({
      baseUrl: "/qgis",
      layerName: overlayLayerId,
      bounds: WMS_BOUNDS,
      width: WMS_WIDTH,
      height: WMS_HEIGHT,
      transparent: true,
      opacity: 0.8,
    });
  }, [showOverlay, overlayLayerId]);

  useEffect(() => {
    if (!showOverlay) {
      clear();
    }
  }, [showOverlay, clear]);

  useEffect(() => {
    let cancelled = false;

    async function go() {
      setError(null);
      if (!showBuildings || !objUrl) {
        setObjLayer(null);
        return;
      }
      try {
        const loaded = await load(objUrl, OBJLoader);
        const mesh = (Array.isArray(loaded) ? loaded[0] : loaded) as Mesh;

        const pos = getPositionArray(mesh);
        const [cx, cy] = computeCentroidRD(pos);
        const [lon0, lat0] = rdToLonLat(cx, cy);

        const layer = buildObjLayerFromMesh('buildings-obj', mesh, [lon0, lat0], {
          color: [180, 180, 180, 255],
          zBase: 4.261,
          zLift: 0,
          heightScale: 1,
        });

        if (!cancelled) setObjLayer(layer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    go();
    return () => { cancelled = true; };
  }, [objUrl, showBuildings]);

  const layers = useMemo<Layer[]>(
    () => [
      osmBase,
      ...(objLayer ? [objLayer] : []),
      ...(wmsLayer ? [wmsLayer] : []),
    ],
    [osmBase, objLayer, wmsLayer]
  );

  function handleMapClick(info: PickingInfo): void {
    if (!showOverlay) return;
    if (!info.coordinate) return;

    const [lon, lat] = info.coordinate as [number, number];
    void request(lon, lat);
  }

  return { layers, error, featureInfo, handleMapClick };
}