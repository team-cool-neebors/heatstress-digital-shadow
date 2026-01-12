interface FeatureInfo {
  band?: number | null;
  lon: number;
  lat: number;
}

interface FeatureInfoCardProps {
  info: FeatureInfo;
}

export const FeatureInfoCard = ({ info }: FeatureInfoCardProps) => (
  <div style={{
    padding: "12px 20px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    border: "1px solid rgba(0,0,0,0.15)",
    fontSize: "13px",
    color: "#000000",
    pointerEvents: "auto",
    display: "flex",
    gap: "16px",
    alignItems: "center"
  }}>
    <div style={{ display: "flex", gap: "6px" }}>
      <strong style={{ color: "#000000" }}>PET Index:</strong> 
      <span style={{ color: "#000000", fontWeight: 600 }}>
        {info.band != null ? `${info.band.toFixed(2)}°C` : "n/a"}
      </span>
    </div>
    
    <div style={{ 
      color: "#333333", 
      fontSize: "11px", 
      borderLeft: "1px solid #ddd", 
      paddingLeft: "16px",
      display: "flex",
      gap: "4px"
    }}>
      <strong style={{ color: "#000000" }}>Coords:</strong> 
      <span>{info.lon.toFixed(4)}, {info.lat.toFixed(4)}</span>
    </div>
  </div>
);