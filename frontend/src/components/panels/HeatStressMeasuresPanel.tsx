import type { ObjectType } from "../../App";
import CheckboxItem from "./items/CheckboxItem";
import ObjectItem from "./items/ObjectItem";
import Fountain from "../icons/Fountain.png";
import Bush from "../icons/Bush.png";
import Pond from "../icons/Pond.png";
import Tree from "../icons/Tree.png";

type HeatStressMeasuresProps = {
  showObjects: boolean;
  onToggleObjects: (v: boolean) => void;
  selectedObjectType: string | null;
  onSelectObjectType: (type: ObjectType | null) => void;
};

export function HeatStressMeasuresPanel({
  showObjects,
  onToggleObjects,
  selectedObjectType,
  onSelectObjectType,
}: HeatStressMeasuresProps) {
  const disabled = !showObjects;
  const handleObjectClick = (type: ObjectType) => {
    if (selectedObjectType === type) {
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
          <ObjectItem
            label="Trees"
            icon={<img
              src={Tree}
              alt="Fountain"
              style={{ width: 36, height: 36 }}
            />}
            disabled={disabled}
            active={selectedObjectType === "tree"}
            onClick={() => handleObjectClick("tree")}
          />

          <ObjectItem
            label="Bushes"
            icon={<img
              src={Bush}
              alt="Fountain"
              style={{ width: 36, height: 36 }}
            />}
            disabled={disabled}
            active={selectedObjectType === "bush"}
            onClick={() => handleObjectClick("bush")}
          />

          <ObjectItem
            label="Pond"
            icon={<img
              src={Pond}
              alt="Fountain"
              style={{ width: 36, height: 36 }}
            />}
            disabled={disabled}
            active={selectedObjectType === "pond"}
            onClick={() => handleObjectClick("pond")}
          />

          <ObjectItem
            label="Fountain"
            icon={<img
              src={Fountain}
              alt="Fountain"
              style={{ width: 36, height: 36 }}
            />}
            disabled={disabled}
            active={selectedObjectType === "fountain"}
            onClick={() => handleObjectClick("fountain")}
          />
        </div>
      </CheckboxItem>

      {/* <button
            onClick={saveObjects}
            disabled={!hasUnsavedChanges}
            style={{ padding: "8px 15px" }}
          >
            Save Objects
          </button>

          <button
            onClick={discardChanges}
            disabled={!hasUnsavedChanges}
            style={{ padding: "8px 15px" }}
          >
            Discard Changes
          </button> */}

      <div style={{
        backgroundColor: "#f1e9e9ff",
        paddingLeft: 10,
        fontStyle: "italic"
      }}>
        <h4>Help</h4>
        <p>Remove placed objects by pressing on them.</p>
        <p>"Discard changes" will delete all changes not saved.</p>
        <p>"Save" will make the changes definitive and will render the pet map to see the effect??</p>
      </div>
    </>
  );
}
