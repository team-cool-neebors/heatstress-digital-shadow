import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeTreesLayer, type TreeInstance } from './lib/treeLayer';
import { LOCAL_STORAGE_KEY, OBJECTS, DEFAULT_OBJECT_TYPE } from '../../map/utils/deckUtils';
import { lonLatToRd } from '../../map/utils/crs';
import { useObjectIO } from '../../map/utils/importUtils';

export function useUserTreesLayer(showObjects: boolean, isEditingMode: boolean, selectedObjectType: string) {

    const [userObjects, setUserObjects] = useState<TreeInstance[]>(() => {
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

    const [objectsToSave, setObjectsToSave] = useState<TreeInstance[]>(userObjects);
    const [nextClientId, setNextClientId] = useState(0);
    const [objectsVersion, setObjectsVersion] = useState(0);
    const [error, setError] = useState<Error | null>(null);

    // Sync objectsToSave when userObjects changes (on initial load/save commit)
    useEffect(() => {
        setObjectsToSave(userObjects);
    }, [userObjects]);


    const handleInteraction = useCallback((info: PickingInfo) => {
        if (!isEditingMode) return;

        if (info.object) {
            const clickedObject = info.object as TreeInstance;
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
        const typeConfig = OBJECTS[selectedObjectType] || OBJECTS[DEFAULT_OBJECT_TYPE];

        const newId = `CLIENT-${selectedObjectType}-${Date.now()}-${nextClientId}`;
        setNextClientId(prev => prev + 1);

        const newObject: TreeInstance = {
            id: newId,
            objectType: selectedObjectType,
            position: [lon, lat, 1],
            scale: typeConfig.scale,
        };

        setObjectsToSave(prev => [...prev, newObject]);

        return true;
    }, [isEditingMode, selectedObjectType, nextClientId]);


    const userObjectLayer = useMemo<Layer | null>(() => {
        if (!showObjects || objectsToSave.length === 0) return null;

        const typeConfig = OBJECTS[DEFAULT_OBJECT_TYPE];

        return makeTreesLayer(
            'user-objects',
            objectsToSave,
            typeConfig.url,
            {
                color: [0, 255, 0, 255],
                orientation: typeConfig.rotation
            }
        );
    }, [objectsToSave, showObjects]);

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


    const saveObjects = useCallback(async (objectsOverride?: TreeInstance[]) => {
        const finalObjects = objectsOverride || objectsToSave;

        try {
            const payload = {
                points: finalObjects.map(obj => {
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
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalObjects));
                setUserObjects(finalObjects);
                // If we used an override, we must also update the "Draft" state to match
                if (objectsOverride) {
                    setObjectsToSave(finalObjects);
                }
                setObjectsVersion(v => v + 1);
            });

        } catch (e) {
            console.error('Error saving objects to local storage:', e);
            setError(e instanceof Error ? e : new Error(String(e)));
        }
    }, [objectsToSave]);

    const handleImportMerge = useCallback((importedObjects: TreeInstance[]) => {

        // Create a lookup map of existing object positions to check for duplicates
        const existingPositions = new Set(
            userObjects.map(obj => obj.position.join(','))
        );
            
      const uniqueNewObjects = importedObjects
        .filter(obj => {
            const positionKey = obj.position.join(',');
            // Exclude object if its position already exists in the map
            return !existingPositions.has(positionKey);
        })
        .map(obj => ({
           // generate IDs for unique items
            ...obj,
            id: `CLIENT-${obj.objectType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
    
        // Check if any unique objects were found
        if (uniqueNewObjects.length === 0) {
            console.warn("Import skipped: All imported objects were duplicates of existing trees.");
            return; 
        }

        console.log(`Successfully imported and added ${uniqueNewObjects.length}} new objects`);

        // Merge: Existing Saved Objects + New Imported Objects
        const combinedList = [...userObjects, ...uniqueNewObjects];

        // Trigger Auto-Save immediately
        saveObjects(combinedList);

    }, [userObjects, saveObjects]);

    const discardChanges = useCallback(() => {
        setObjectsToSave(userObjects);
    }, [userObjects]);

    const objectConfig = OBJECTS;

    const { importObjects, exportObjects } = useObjectIO(
        objectsToSave,
        objectConfig,
        handleImportMerge
    );
    
    return {
        userObjectLayer,
        handleInteraction,
        saveObjects,
        discardChanges,
        error,
        hasUnsavedChanges,
        objectsVersion,
        exportObjects,
        importObjects
    };
}
