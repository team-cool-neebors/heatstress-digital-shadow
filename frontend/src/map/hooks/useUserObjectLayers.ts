import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Layer, PickingInfo } from '@deck.gl/core';
import { makeScenegraphLayerForObjects, type ObjectFeature } from '../layers/objectLayer';
import { LOCAL_STORAGE_KEY, OBJECTS, DEFAULT_OBJECT_TYPE } from '../utils/deckUtils';

export function useUserObjectLayers(showObjects: boolean, isEditingMode: boolean, selectedObjectType: string) {
    
    const [userObjects, setUserObjects] = useState<ObjectFeature[]>(() => {
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

    const [objectsToSave, setObjectsToSave] = useState<ObjectFeature[]>(userObjects);
    const [nextClientId, setNextClientId] = useState(0);
    const [error, setError] = useState<Error | null>(null);

    // Sync objectsToSave when userObjects changes (on initial load/save commit)
    useEffect(() => {
        setObjectsToSave(userObjects);
    }, [userObjects]);


    const handleInteraction = useCallback((info: PickingInfo) => {
        if (!isEditingMode) return;

        if (info.object) {
            const clickedObject = info.object as ObjectFeature;
            const clickedLayerId = info.layer?.id;
            const objectIdToRemove = clickedObject.id;

            if (clickedLayerId === 'user-objects') {
                if (objectIdToRemove && objectIdToRemove.startsWith('CLIENT-')) {
                    setObjectsToSave(prev => prev.filter(t => t.id !== objectIdToRemove));
                    console.log(`Removed user-placed object: ${objectIdToRemove}`);
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

        const newObject: ObjectFeature = {
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

        return makeScenegraphLayerForObjects(
            'user-objects',
            objectsToSave,
            typeConfig.url,
            {
                color: [0, 255, 0, 255],
                orientation: typeConfig.rotation
            }
        );
    }, [objectsToSave, showObjects]);


    const saveObjects = useCallback(async () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(objectsToSave));
            
            setUserObjects(objectsToSave);

            // TODO: API call logic
        } catch (e) {
            console.error('Error saving objects to local storage:', e);
            setError(e instanceof Error ? e : new Error(String(e)));
        }
    }, [objectsToSave]);

    return { 
        userObjectLayer, 
        handleInteraction, 
        saveObjects, 
        error,
        hasUnsavedChanges: objectsToSave !== userObjects 
    };
}
