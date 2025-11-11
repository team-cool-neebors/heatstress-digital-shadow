import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeOsmTileLayer } from '../layers/osmLayer';
import { load } from '@loaders.gl/core';
import { OBJLoader } from '@loaders.gl/obj';
import { buildObjLayerFromMesh, computeCentroidRD } from '../layers/buildingsLayer';
import { makeScenegraphLayerForObjects, type ObjectFeature } from '../layers/objectLayer';
import { rdToLonLat } from '../utils/crs';
import type { Mesh, MeshAttribute } from '@loaders.gl/schema';

type UseDeckLayersOpts = {
  objPath?: string;
  showBuildings?: boolean;
  showObjects?: boolean;
  isEditingMode: boolean;
  selectedObjectType: string;
};

const BBOX = "31593.331,391390.397,32093.331,391890.397";

const OBJECTS: Record<string, {
  url: string,
  scale: number,
  rotation: [number, number, number],
}> = {
  'tree': {
    url: '/models/tree-pine.glb',
    scale: 15,
    rotation: [0, 0, 90],
  },
};
const DEFAULT_OBJECT_TYPE = 'tree';

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

export function useDeckLayers({ objPath, showBuildings, showObjects, isEditingMode, selectedObjectType }: UseDeckLayersOpts) {
  const objUrl = showBuildings ? resolveUrl(objPath) : undefined;
  const osmBase = useMemo<Layer>(() => makeOsmTileLayer(), []);
  const [buildingsLayer, setbuildingsLayer] = useState<Layer | null>(null);
  const [objectLayer, setObjectLayer] = useState<Layer | null>(null);
  const [userObjects, setUserObjects] = useState<ObjectFeature[]>([]);
  const [objectsToSave, setObjectsToSave] = useState<ObjectFeature[]>([]);
  const [nextClientId, setNextClientId] = useState(0);
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
        setObjectLayer(null);
        return;
      }
      try {
        // Fetch data from backend
        // TODO: also fetch other placeable objects when the db is implemented
        const response = await fetch(`/backend/objects/trees?bbox=${BBOX}`);
        const json = await response.json();

        const features = (json.features || []) as {
          id: string;
          geometry: { coordinates: [number, number] }; // [xRD, yRD]
          properties: { relatieve_hoogteligging?: number } & Record<string, unknown>;
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
            id: feature.id,
            objectType: 'tree',
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

  const handleInteraction = useCallback((info: PickingInfo) => {
    if (!isEditingMode) return;

    if (info.object) {
      // Check if the clicked object is one of our client-placed objects
      const clickedObject = info.object as ObjectFeature;
      const clickedLayerId = info.layer?.id;

      if (clickedLayerId === 'user-objects') {
        const objectIdToRemove = clickedObject.id;

        // Only allow removal if it's a client-placed object (ID starts with 'CLIENT-')
        if (objectIdToRemove && objectIdToRemove.startsWith('CLIENT-')) {
          setUserObjects(prev => prev.filter(t => t.id !== objectIdToRemove));
          setObjectsToSave(prev => prev.filter(t => t.id !== objectIdToRemove));
          return true; // Event handled (removal successful)
        } else {
          return;
        }
      }

      // If clicked any other object (like a building or server object), do nothing
      return;
    }

    if (!info.coordinate) return;
    const [lon, lat] = info.coordinate;
    const typeConfig = OBJECTS[selectedObjectType] || OBJECTS[DEFAULT_OBJECT_TYPE];

    // Generate Unique Client ID
    const newId = `CLIENT-${selectedObjectType}-${nextClientId}`;
    setNextClientId(prev => prev + 1);

    const newObject: ObjectFeature = {
      id: newId,
      objectType: selectedObjectType,
      position: [lon, lat, 1],
      scale: typeConfig.scale,
    };

    setUserObjects(prev => [...prev, newObject]);
    setObjectsToSave(prev => [...prev, newObject]);

    return true; // Event handled (placement successful)
  }, [isEditingMode, selectedObjectType, nextClientId]);

  const userObjectLayer = useMemo<Layer | null>(() => {
    if (userObjects.length === 0) return null;

    const typeConfig = OBJECTS[DEFAULT_OBJECT_TYPE];

    return makeScenegraphLayerForObjects(
      'user-objects',
      userObjects,
      typeConfig.url,
      {
        color: [0, 255, 0, 255],
        orientation: typeConfig.rotation
      }
    );
  }, [userObjects]);

  const saveObjects = useCallback(async () => {
    if (objectsToSave.length === 0) {
      return;
    }

    try {
      console.log(`Sending ${objectsToSave.length} objects to backend...`);

      const payload = objectsToSave.map(obj => ({
        type: obj.objectType,
        position: obj.position,
        scale: obj.scale,
      }));

      return;

      // TODO: implement saving once the db is added
      const response = await fetch('/backend/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newObjects: payload }),
      });

      if (response.ok) {
        setObjectsToSave([]);
      } else {
        const errorText = await response.text();
        throw new Error(`Save failed: ${errorText}`);
      }
    } catch (e) {
      console.error('Error saving objects:', e);
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [objectsToSave]);

  const layers: Layer[] = useMemo(() => {
    const arr: Layer[] = [osmBase];

    if (buildingsLayer) arr.push(buildingsLayer);
    if (objectLayer) arr.push(objectLayer)
    if (userObjectLayer) arr.push(userObjectLayer);

    return arr;
  }, [osmBase, buildingsLayer, objectLayer, userObjectLayer]);

  return {
    layers,
    error,
    onViewStateClick: handleInteraction,
    saveObjects: saveObjects,
  };
}
