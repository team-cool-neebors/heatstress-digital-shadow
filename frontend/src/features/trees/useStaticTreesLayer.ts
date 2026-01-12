import { useEffect, useState } from 'react';
import type { Layer } from '@deck.gl/core';
import { makeTreesLayer, type TreeInstance } from './lib/treeLayer';
import { rdToLonLat } from '../../map/utils/crs';
import { BBOX, OBJECTS } from '../../map/utils/deckUtils';

export function useStaticTreesLayer(showObjects: boolean) {
  const [objectLayer, setObjectLayer] = useState<Layer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!showObjects) {
      setObjectLayer(null);
      return;
    }

    async function fetchObjectData() {
      setError(null);
      try {
        const response = await fetch(`/backend/objects/trees?bbox=${BBOX}`);
        const json = await response.json();

        const features = (json.features || []) as {
          id: string;
          geometry: { coordinates: [number, number] }; // [xRD, yRD]
          properties: { relatieve_hoogteligging?: number } & Record<string, unknown>;
        }[];

        // Transform the data
        const data: TreeInstance[] = features.map((feature) => {
          const [xRD, yRD] = feature.geometry.coordinates;
          const [lon, lat] = rdToLonLat(xRD, yRD);

          const rawHeight = feature.properties?.relatieve_hoogteligging;
          const height = (rawHeight && rawHeight > 0) ? rawHeight : 15;

          return {
            id: feature.id,
            objectType: 'tree',
            position: [lon, lat, 1],
            scale: height
          };
        });

        const layer = makeTreesLayer(
          'objects',
          data,
          OBJECTS.tree.url
        );

        if (!cancelled) setObjectLayer(layer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    fetchObjectData();
    return () => { cancelled = true; };
  }, [showObjects]);

  return { objectLayer, error };
}
