import type { MeasureType } from "../../features/objects/lib/objectLayer";
import CheckboxItem from "./items/CheckboxItem";
import ObjectItem from "./items/ObjectItem";

type HeatStressMeasuresProps = {
  showObjects: boolean;
  onToggleObjects: (v: boolean) => void;
  objectTypes: MeasureType[];
  selectedObjectType: string | null;
  onSelectObjectType: (type: MeasureType | null) => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

export function HeatStressMeasuresPanel({
  showObjects,
  onToggleObjects,
  objectTypes,
  selectedObjectType,
  onSelectObjectType,
  hasUnsavedChanges,
  onSave,
  onDiscard,
}: HeatStressMeasuresProps) {
  const disabled = !showObjects;
  const disabledButtons = !hasUnsavedChanges || !showObjects;
  const handleObjectClick = (type: MeasureType) => {
    if (selectedObjectType === type.name) {
      onSelectObjectType(null);
    } else {
      onSelectObjectType(type);
    }
  };
  return (
    <>
      <h3>Heat Stress Measures</h3>
      <CheckboxItem
        label="Objects View"
        checked={showObjects}
        onChange={onToggleObjects}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "1rem",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {objectTypes.map((type) => (
            <ObjectItem
              key={type.id}
              label={type.name}
              icon={<img
                src={type.icon}
                alt={type.name}
                style={{ width: 36, height: 36 }}
              />}
              disabled={disabled}
              active={selectedObjectType === type.name}
              onClick={() => handleObjectClick(type)}
            />
          ))}
        </div>
      </CheckboxItem>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={onDiscard}
          disabled={disabledButtons}
          style={{ padding: "8px 15px", cursor: disabledButtons ? "not-allowed" : "pointer", border: "solid 1px #d1d1d1ff" }}
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={disabledButtons}
          style={{ padding: "8px 15px", cursor: disabledButtons ? "not-allowed" : "pointer", border: "solid 1px #d1d1d1ff" }}
        >
          Save
        </button>
      </div>

      <div style={{
        backgroundColor: "#f1e9e9ff",
        paddingLeft: 10,
        fontStyle: "italic"
      }}>
        <h4>Help: About objects</h4>
        <p>Remove placed objects by pressing on them.</p>
        <p>"Discard" will delete all not saved changes.</p>
        <p>"Save" will make the changes definitive and will re-calculate the PET map.</p>
      </div>
    </>
  );
}
