import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeObjectsLayer, type ObjectInstance, type MeasureType } from './lib/objectLayer';
import { LOCAL_STORAGE_KEY } from '../../map/utils/deckUtils';
import { lonLatToRd } from '../../map/utils/crs';

type LayerMap = Record<string, Layer>;

export function useUserObjectsLayer(
    showObjects: boolean,
    isEditingMode: boolean,
    selectedObjectType: string,
    setSelectedObjectType: (type: string) => void,
) {

    const [objectTypes, setObjectTypes] = useState<MeasureType[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function fetchTypes() {
            if (!isEditingMode || objectTypes.length > 0) return;

            try {
                const response = await fetch('/backend/measures');
                if (!response.ok) throw new Error(response.statusText);
                const data: MeasureType[] = await response.json();

                if (!cancelled) {
                    setObjectTypes(data);
                    if (data.length > 0) {
                        setSelectedObjectType(data[0].name);
                    }
                }
                console.log("Fetched measure types:", data);
            } catch (e) {
                console.error("Failed to fetch measure types", e);
            }
        }

        fetchTypes();

        return () => { cancelled = true; };
    }, [isEditingMode, objectTypes.length, setSelectedObjectType]);

    const [userObjects, setUserObjects] = useState<ObjectInstance[]>(() => {
        try {
            const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!storedValue) return [];
            const parsed = JSON.parse(storedValue);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Error loading user objects from local storage:", e);
            return [];
        }
    });

    const [objectsToSave, setObjectsToSave] = useState<ObjectInstance[]>(userObjects);
    const [nextClientId, setNextClientId] = useState(0);
    const [objectsVersion, setObjectsVersion] = useState(0);
    const [error, setError] = useState<Error | null>(null);

    // Sync objectsToSave when userObjects changes (on initial load/save commit)
    useEffect(() => {
        setObjectsToSave(userObjects);
    }, [userObjects]);

    const objectTypesMap = useMemo(() => {
        return objectTypes.reduce((acc, type) => {
            acc[type.name] = type;
            return acc;
        }, {} as Record<string, MeasureType>);
    }, [objectTypes]);

    const getSelectedTypeProperties = useCallback((): MeasureType | undefined => {
        return objectTypesMap[selectedObjectType];
    }, [objectTypesMap, selectedObjectType]);

    const handleInteraction = useCallback((info: PickingInfo) => {
        if (!isEditingMode) return;

        if (info.object) {
            const clickedObject = info.object as ObjectInstance;
            const clickedLayerId = info.layer?.id;
            const objectIdToRemove = clickedObject.id;

            if (clickedLayerId === 'user-objects') {
                if (objectIdToRemove && objectIdToRemove.startsWith('CLIENT-')) {
                    setObjectsToSave(prev => prev.filter(t => t.id !== objectIdToRemove));
                    return true;
                } else {
                    return; // Not a client-placed object
                }
            }
            return;
        }

        if (!info.coordinate) return;
        const [lon, lat] = info.coordinate;

        const selectedType = getSelectedTypeProperties();
        if (!selectedType) return;

        const newId = `CLIENT-${selectedObjectType}-${Date.now()}-${nextClientId}`;
        setNextClientId(prev => prev + 1);

        const newObject: ObjectInstance = {
            id: newId,
            objectType: selectedObjectType,
            position: [lon, lat, 0],
            scale: selectedType.scale,
        };

        setObjectsToSave(prev => [...prev, newObject]);

        return true;
    }, [isEditingMode, selectedObjectType, nextClientId]);


    const userObjectLayers = useMemo<LayerMap | null>(() => {
        if (!showObjects || objectsToSave.length === 0 || objectTypes.length === 0) return null;

        // 1. Group objects by their stored objectType
        const groupedObjects = objectsToSave.reduce((acc, obj) => {
            if (!acc[obj.objectType]) {
                acc[obj.objectType] = [];
            }
            acc[obj.objectType].push(obj);
            return acc;
        }, {} as Record<string, ObjectInstance[]>);

        // 2. Create one layer for each group
        const layers: LayerMap = {};

        for (const typeName in groupedObjects) {
            const typeProps = objectTypesMap[typeName];

            if (!typeProps) {
                // Skip objects whose type definition failed to load
                console.warn(`Missing properties for saved object type: ${typeName}. Skipping layer.`);
                continue;
            }

            layers[typeName] = makeObjectsLayer(
                `user-objects-${typeName}`, // Unique ID for deck.gl
                groupedObjects[typeName],
                typeProps.model,
                {
                    // Use properties stored on the MeasureType
                    color: [0, 255, 0, 255],
                    orientation: typeProps.rotation
                }
            );
        }

        return layers;
    }, [objectsToSave, showObjects, objectTypes.length, objectTypesMap]);

    const hasUnsavedChanges = useMemo(() => {
        // If the references happen to be the same, content is definitely the same
        if (userObjects === objectsToSave) {
            return false;
        }

        // If lengths are different, changes exist
        if (userObjects.length !== objectsToSave.length) {
            return true;
        }

        const sortedUser = [...userObjects].sort((a, b) => a.id.localeCompare(b.id));
        const sortedDraft = [...objectsToSave].sort((a, b) => a.id.localeCompare(b.id));

        // Serialize and compare the strings
        return JSON.stringify(sortedUser) !== JSON.stringify(sortedDraft);

    }, [userObjects, objectsToSave]);


    const saveObjects = useCallback(async () => {
        try {
            const payload = {
                points: objectsToSave.map(obj => {
                    const [lon, lat] = obj.position;

                    const [x, y] = lonLatToRd(lon, lat);

                    return {
                        x,
                        y,
                        geometry: 'circle', // currently qgis only accepts the geometry as circle, should be changed later
                    };
                }),
            };

            const response = await fetch('/backend/update-pet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to update pet: ${response.status} ${response.statusText}`);
            }

            await Promise.resolve().then(() => {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(objectsToSave));
                setUserObjects(objectsToSave);
                setObjectsVersion(v => v + 1);
            });

        } catch (e) {
            console.error('Error saving objects to local storage:', e);
            setError(e instanceof Error ? e : new Error(String(e)));
        }
    }, [objectsToSave]);

    const discardChanges = useCallback(() => {
        setObjectsToSave(userObjects);
    }, [userObjects]);

    return {
        userObjectLayers: userObjectLayers ? Object.values(userObjectLayers) : [],
        handleInteraction,
        saveObjects,
        discardChanges,
        error,
        hasUnsavedChanges,
        objectsVersion,
        objectTypes,
    };
}
