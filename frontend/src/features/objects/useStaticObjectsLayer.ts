import { useEffect, useState } from 'react';
import type { Layer } from '@deck.gl/core';
import { makeObjectsLayer, type ObjectInstance } from './lib/objectLayer';
import { rdToLonLat } from '../../map/utils/crs';
import { BBOX, OBJECTS } from '../../map/utils/deckUtils';

export function useStaticObjectsLayer(showObjects: boolean, selectedObjectType: string) {
  const [objectLayer, setObjectLayer] = useState<Layer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchObjectData() {
      setError(null);
      if (!showObjects) {
        setObjectLayer(null);
        return;
      }
      try {
        const response = await fetch(`/backend/objects/trees?bbox=${BBOX}`);
        const json = await response.json();

        const features = (json.features || []) as {
          id: string;
          geometry: { coordinates: [number, number] }; // [xRD, yRD]
          properties: { relatieve_hoogteligging?: number } & Record<string, unknown>;
        }[];

        // Transform the data
        const data: ObjectInstance[] = features.map((feature) => {
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

        const layer = makeObjectsLayer(
          'objects',
          data,
          OBJECTS[selectedObjectType].url
        );

        if (!cancelled) setObjectLayer(layer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    fetchObjectData();
    return () => { cancelled = true; };
  }, [showObjects, selectedObjectType]);

  return { objectLayer, error };
}
