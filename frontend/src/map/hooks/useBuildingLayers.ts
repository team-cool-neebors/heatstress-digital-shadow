import { useEffect, useState } from 'react';
import type { Layer } from '@deck.gl/core';
import { load } from '@loaders.gl/core';
import { OBJLoader } from '@loaders.gl/obj';
import { buildObjLayerFromMesh, computeCentroidRD } from '../layers/buildingsLayer';
import { rdToLonLat } from '../utils/crs';
import type { Mesh } from '@loaders.gl/schema';
import { getPositionArray, resolveUrl } from '../utils/deckUtils';

export function useBuildingLayers(objPath: string | undefined, showBuildings: boolean) {
  const objUrl = showBuildings ? resolveUrl(objPath) : undefined;
  const [buildingsLayer, setBuildingsLayer] = useState<Layer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function go() {
      setError(null);
      if (!showBuildings || !objUrl) {
        setBuildingsLayer(null);
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

        if (!cancelled) setBuildingsLayer(layer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    go();
    return () => { cancelled = true; };
  }, [objUrl, showBuildings]);

  return { buildingsLayer, error };
}
