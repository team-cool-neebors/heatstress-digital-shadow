// Defining a generic interface for type definition so it will be compatitable for when we get objects from the db
export interface ObjectConfig {
    [key: string]: {
        url?: string;
        scale?: number;
    }
}


export const parseImportedData = (
    jsonContent: any, 
    availableTypes: ObjectConfig, 
    defaultType: string          
) => {

    // Define the unique signature we use to validate a file is our own before we import
    const APP_SIGNATURE = 'neeghboorhoods';

    // Check for the signature immediately
    if (jsonContent.__app_signature !== APP_SIGNATURE) {
        throw new Error("Invalid file signature. Only files exported from this application can be imported.");
    }

    // Create a Set of keys for fast lookup
    const validTypeKeys = Object.keys(availableTypes);

    // Dynamic Sanitizer
    const sanitizeType = (type: string): string => {
        return validTypeKeys.includes(type) ? type : defaultType;
    };

    // Dynamic Scale Lookup
    const getScale = (instanceScale: number | undefined, type: string): number => {
        if (typeof instanceScale === 'number') return instanceScale;
        return availableTypes[type]?.scale || 1; 
    };

    let rawList: any[] = [];

    // Detect GeoJSON or Plain JSON
    if (jsonContent.type === 'FeatureCollection' && Array.isArray(jsonContent.features)) {
        rawList = jsonContent.features.map((f: any) => ({
            id: f.properties.id,
            objectType: f.properties.objectType,
            position: f.geometry.coordinates,
            scale: f.properties.scale
        }));
    } else if (Array.isArray(jsonContent)) {
        rawList = jsonContent.map((item: any) => ({
            id: item.id,
            objectType: item.objectType,
            position: [item.longitude, item.latitude],
            scale: item.scale
        }));
    } else {
        throw new Error("Unsupported file format");
    }

    // Normalize and Return
    return rawList.map(item => {
        const finalType = sanitizeType(item.objectType);
        
        return {
            id: item.id || crypto.randomUUID(),
            objectType: finalType,
            position: item.position,
            scale: getScale(item.scale, finalType),
        };
    });
};