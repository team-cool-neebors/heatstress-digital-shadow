import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeTreesLayer, type TreeInstance } from './lib/treeLayer';
import { LOCAL_STORAGE_KEY, OBJECTS, DEFAULT_OBJECT_TYPE } from '../../map/utils/deckUtils';
import { lonLatToRd } from '../../map/utils/crs';
import { parseImportedData } from '../../map/utils/importUtils';

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


    // Helper function for exportObjects function
    const triggerDownload = (data: string, filename: string, mimeType: string) => {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportObjects = useCallback((format: 'geojson' | 'json') => {
    if (objectsToSave.length === 0) {
        console.warn("No objects to export.");
        return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    let dataStr = '';
    let fileName = '';
    let mimeType = '';

    // GeoJSON
    if (format === 'geojson') {
        const geoJsonData = {
        type: "FeatureCollection",
        features: objectsToSave.map(obj => ({
            type: "Feature",
            geometry: {
            type: "Point",
            coordinates: obj.position 
            },
            properties: {
            id: obj.id,
            objectType: obj.objectType,
            scale: obj.scale,
            placement_date: new Date(parseInt(obj.id.split('-')[2] || Date.now().toString())).toISOString()
            }
        })),
        };
        
        dataStr = JSON.stringify(geoJsonData, null, 2);
        fileName = `user_objects_${dateStr}.geojson`;
        mimeType = 'application/geo+json';

    } else {
        // Plain JSON
        const simpleData = objectsToSave.map(obj => ({
        id: obj.id,
        objectType: obj.objectType,
        longitude: obj.position[0],
        latitude: obj.position[1],
        scale: obj.scale,
        placement_date: new Date(parseInt(obj.id.split('-')[2] || Date.now().toString())).toISOString()
        }));

        dataStr = JSON.stringify(simpleData, null, 2);
        fileName = `user_objects_raw_${dateStr}.json`;
        mimeType = 'application/json';
    }

    triggerDownload(dataStr, fileName, mimeType);

    }, [objectsToSave]);

    const objectConfig = OBJECTS;

    const importObjects = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') return;
            const parsedJson = JSON.parse(result);

            const normalizedObjects = parseImportedData(
                parsedJson, 
                objectConfig,        
                DEFAULT_OBJECT_TYPE  
            );

            setObjectsToSave(normalizedObjects);
            
        } catch (err) {
            console.error("Import failed", err);
        }
    };
    reader.readAsText(file);
}, [objectConfig]);
    
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
