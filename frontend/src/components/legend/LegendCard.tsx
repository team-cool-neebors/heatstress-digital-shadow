import type { LegendPayload } from "../../features/wms-overlay/useWMSLegend";

type LegendCardProps = {
  legend: LegendPayload;
  title?: string;
};

function parseRgba(color: string): string {
  const parts = color.split(",").map((part) => Number(part.trim()));
  if (parts.length < 3 || parts.some((value) => Number.isNaN(value))) {
    return color;
  }

  const [r, g, b, a = 255] = parts;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

function formatValue(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return value.toFixed(2);
}

export const LegendCard = ({ legend, title = "Legend" }: LegendCardProps) => {
  const items = legend.color_ramp.items ?? [];
  const sortedItems = [...items].sort((a, b) => a.value - b.value);
  const gradientColors = sortedItems
    .slice()
    .reverse()
    .map((item) => parseRgba(item.color))
    .join(", ");

  const minValue = legend.renderer.classification_min;
  const maxValue = legend.renderer.classification_max;
  const midValue = (minValue + maxValue) / 2;

  return (
    <div
      style={{
        padding: "12px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        border: "1px solid rgba(0,0,0,0.15)",
        width: "140px",
        pointerEvents: "auto",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ fontSize: "13px", fontWeight: 700, textAlign: "center" }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: "10px" }}>
        <div
          style={{
            width: "20px",
            height: "120px",
            borderRadius: "8px",
            background: gradientColors
              ? `linear-gradient(to bottom, ${gradientColors})`
              : "#e5e5e5",
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#111111",
          }}
        >
          <div>{formatValue(maxValue)}</div>
          <div>{formatValue(midValue)}</div>
          <div>{formatValue(minValue)}</div>
        </div>
      </div>
    </div>
  );
};
