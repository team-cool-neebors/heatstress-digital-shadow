import "./LoadingIndicator.css";

type LoadingIndicatorProps = {
  label: string,
  backgroundColor: string,
  textColor: string,
  left?: number | string;
};

export function LoadingIndicator({label, backgroundColor, textColor, left = "26rem",}: LoadingIndicatorProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: left,
        padding: "6px 70px",
        background: backgroundColor,
        color: textColor,
        borderRadius: 6,
        border: "gray solid 2px",
        fontSize: 18,
        pointerEvents: "none",
        zIndex: 10,
        fontWeight: 400
      }}
    >
      <span className="loading-dots">{label}</span>
    </div>
  );
}


