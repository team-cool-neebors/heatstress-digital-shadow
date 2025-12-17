import type { ObjectType } from "../../App";
import { BuildingIcon } from "../icons/BuildingIcon";
import { TreeIcon } from "../icons/TreeIcon";
import CheckboxItem from "./items/CheckboxItem";
import ObjectItem from "./items/ObjectItem";

type HeatStressMeasuresProps = {
  showObjects: boolean;
  onToggleObjects: (v: boolean) => void;
  selectedObjectType: string | null;
  onSelectObjectType: (type: ObjectType) => void;
};

export function HeatStressMeasuresPanel({ 
  showObjects,
  onToggleObjects,
  selectedObjectType,
  onSelectObjectType,
}: HeatStressMeasuresProps) {
  const disabled = !showObjects;
  const saveDisabled = !showObjects || !selectedObjectType;
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
          icon={<TreeIcon />}
          disabled={disabled}
          active={selectedObjectType === "tree"}
          onClick={() => onSelectObjectType("tree")}
        />

        <ObjectItem
          label="Bushes"
          icon={<TreeIcon />} // replace later
          disabled={disabled}
          active={selectedObjectType === "bush"}
          onClick={() => onSelectObjectType("bush")}
        />

        <ObjectItem
          label="Pond"
          icon={<BuildingIcon />} // replace later
          disabled={disabled}
          active={selectedObjectType === "pond"}
          onClick={() => onSelectObjectType("pond")}
        />

        <ObjectItem
          label="Fountain"
          icon={<BuildingIcon />} // replace later
          disabled={disabled}
          active={selectedObjectType === "fountain"}
          onClick={() => onSelectObjectType("fountain")}
        />
      </div>
      </CheckboxItem>
      <button style={{ marginTop: "1.5rem" }} disabled={saveDisabled}>Save</button>
    </>
  );
}
