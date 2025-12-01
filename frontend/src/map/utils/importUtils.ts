import { useCallback } from 'react';
import type { TreeInstance } from '../../features/trees/lib/treeLayer';


export interface ObjectConfig {
    [key: string]: { url?: string; scale?: number; }
}

// Unified file shape
interface NeighborhoodFile {
    __app_signature: 'neeghboorhoods';
    __export_date: string;
    type?: 'FeatureCollection'; 
    features?: Array<{          
        type: 'Feature';
        geometry: { coordinates: number[] };
        properties: Partial<TreeInstance>; 
    }>;
    data?: TreeInstance[];    
}

const APP_SIGNATURE = 'neeghboorhoods';
const DEFAULT_OBJECT_TYPE = 'tree_1'; 

// Helper: Trigger Download
const triggerDownload = (dataStr: string, fileName: string, mimeType: string) => {
    const blob = new Blob([dataStr], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
};

//  The Hook 
export const useObjectIO = (
    objectsToSave: TreeInstance[], 
    setObjectsToSave: (objs: TreeInstance[]) => void,
    objectConfig: ObjectConfig
) => {

    const importObjects = useCallback(async (file: File) => {
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text) as NeighborhoodFile;

            if (json.__app_signature !== APP_SIGNATURE) throw new Error("Invalid signature");

            let candidates: Partial<TreeInstance>[] = [];

            // Normalize
            if (json.type === 'FeatureCollection' && Array.isArray(json.features)) {
                candidates = json.features.map(f => ({
                    ...f.properties,
                    position: f.geometry.coordinates as [number, number, number]
                }));
            } else if (Array.isArray(json.data)) {
                candidates = json.data;
            } else {
                throw new Error("Unknown format");
            }

            // Validate
            const validObjects: TreeInstance[] = candidates.map(item => {
                const type = (item.objectType && objectConfig[item.objectType]) 
                    ? item.objectType : DEFAULT_OBJECT_TYPE;
                
                return {
                    id: item.id || crypto.randomUUID(),
                    objectType: type,
                    position: (item.position?.length === 3) ? item.position : [0,0,0],
                    scale: item.scale ?? objectConfig[type]?.scale ?? 1,
                };
            });

            setObjectsToSave(validObjects);
            console.log(`Imported ${validObjects.length} objects.`);

        } catch (err) {
            console.error("Import failed:", err);
            alert("Failed to import file. See console for details.");
        }
    }, [objectConfig, setObjectsToSave]);


    // EXPORT LOGIC 
    const exportObjects = useCallback((format: 'geojson' | 'json') => {
        if (objectsToSave.length === 0) {
            console.warn("No objects to export.");
            return;
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        const timestamp = new Date().toISOString();
        
        const fileContent: NeighborhoodFile = {
            __app_signature: APP_SIGNATURE,
            __export_date: timestamp,
        };

        let fileName = '';
        let mimeType = '';

        if (format === 'geojson') {
            fileContent.type = 'FeatureCollection';
            fileContent.features = objectsToSave.map(obj => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: obj.position },
                properties: { 
                    ...obj,
                    placement_date: new Date(parseInt(obj.id.split('-')[2] || Date.now().toString())).toISOString()
                } 
            }));
            fileName = `neighborhood_${dateStr}.geojson`;
            mimeType = 'application/geo+json';
        } else {
            fileContent.data = objectsToSave;
            fileName = `neighborhood_raw_${dateStr}.json`;
            mimeType = 'application/json';
        }

        triggerDownload(JSON.stringify(fileContent, null, 2), fileName, mimeType);

    }, [objectsToSave]);

    return { importObjects, exportObjects };
};