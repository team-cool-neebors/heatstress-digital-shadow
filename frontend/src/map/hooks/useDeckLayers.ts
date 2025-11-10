import { useEffect, useMemo, useState } from 'react';
import type { Layer } from '@deck.gl/core';
import { makeOsmTileLayer } from '../layers/osmLayer';
import { load } from '@loaders.gl/core';
import { OBJLoader } from '@loaders.gl/obj';
import { buildObjLayerFromMesh, computeCentroidRD } from '../layers/buildingsLayer';
import { makeScenegraphLayerForObjects, type ObjectFeature } from '../layers/objectLayer';
import { rdToLonLat } from '../utils/crs';
import type { Mesh, MeshAttribute } from '@loaders.gl/schema';

type UseDeckLayersOpts = {
  objPath?: string;
  treeModelPath: string,
  showBuildings?: boolean;
  showObjects?: boolean;
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

export function useDeckLayers({ objPath, treeModelPath, showBuildings, showObjects }: UseDeckLayersOpts) {
  const objUrl = showBuildings ? resolveUrl(objPath) : undefined;
  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);
  const [buildingsLayer, setbuildingsLayer] = useState<Layer | null>(null);
  const [treeLayer, setTreeLayer] = useState<Layer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function go() {
      setError(null);
      if (!showBuildings || !objUrl) {
        setbuildingsLayer(null);
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

        if (!cancelled) setbuildingsLayer(layer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    go();
    return () => { cancelled = true; };
  }, [objUrl, showBuildings]);

  useEffect(() => {
    let cancelled = false;

    async function fetchObjectData() {
      if (!showObjects) {
        setTreeLayer(null);
        return;
      }
      try {
        // Fetch data from backend
        // TODO: also fetch other placeable objects when the db is implemented
        const response = await fetch('/backend/objects/trees?bbox=31593.331,391390.397,32093.331,391890.397');
        const json = await response.json();

        const features = (json.features || []) as {
          geometry: { coordinates: [number, number] }; // [xRD, yRD]
          properties: { relatieve_hoogteligging?: number, [key: string]: any };
        }[];

        // Transform the data
        const data: ObjectFeature[] = features.map((feature) => {
          // Coordinates are expected to be in RD (EPSG:28992) from QGIS Server
          const [xRD, yRD] = feature.geometry.coordinates;
          const [lon, lat] = rdToLonLat(xRD, yRD); // Convert RD to WGS84 (lon, lat)

          // Use 'relatieve_hoogteligging' property for height, default to 15m
          const rawHeight = feature.properties?.relatieve_hoogteligging;
          const height = (rawHeight && rawHeight > 0) ? rawHeight : 15;

          return {
            // position: [lon, lat, elevation].
            position: [lon, lat, 1],
            // scale is the actual desired height in meters
            scale: height
          };
        });

        console.log(`Loaded ${data.length} object features.`);

        // Create the ScenegraphLayer using the abstracted function
        const layer = makeScenegraphLayerForObjects(
          'objects',
          data,
          treeModelPath
        );

        if (!cancelled) setTreeLayer(layer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    fetchObjectData();
    return () => { cancelled = true; };
  }, [showObjects]);

  const layers: Layer[] = useMemo(() => {
    const arr: Layer[] = [osmBase];
    if (buildingsLayer) arr.push(buildingsLayer);
    if (treeLayer) arr.push(treeLayer);
    return arr;
  }, [osmBase, buildingsLayer, treeLayer]);

  return { layers, error };
}
