export const FeatureInfoCard = ({ info }: { info: any }) => (
  <div style={{
    padding: "12px 20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: "13px",
    color: "#333",
    pointerEvents: "auto",
    display: "flex",
    gap: "16px"
  }}>
    <div><strong>PET:</strong> {info.band != null ? info.band.toFixed(2) : "n/a"}°C</div>
    <div style={{ color: "#888" }}>{info.lon.toFixed(4)}, {info.lat.toFixed(4)}</div>
  </div>
);