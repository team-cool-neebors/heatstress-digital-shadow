import {useEffect, useMemo, useState} from 'react';
import type {Layer} from '@deck.gl/core';
import {makeOsmTileLayer} from '../layers/osmLayer';
import {load} from '@loaders.gl/core';
import {OBJLoader} from '@loaders.gl/obj';
import {buildObjLayerFromMesh, computeCentroidRD} from '../layers/buildingsLayer';
import {rdToLonLat} from '../utils/crs';
import type {Mesh, MeshAttribute} from '@loaders.gl/schema';

type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings?: boolean;
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

export function useDeckLayers({ objPath, showBuildings }: UseDeckLayersOpts) {
  const objUrl = showBuildings ? resolveUrl(objPath) : undefined;
  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);
  const [objLayer, setObjLayer] = useState<Layer | null>(null);
  const [error, setError] = useState<Error | null>(null);

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
    () => [osmBase, ...(objLayer ? [objLayer] : [])],
    [osmBase, objLayer]
  );

  return { layers, error };
}
