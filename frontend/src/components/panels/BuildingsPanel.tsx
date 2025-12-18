import CheckboxItem from "./items/CheckboxItem";

type BuildingsPanelProps = {
  showBuildings: boolean;
  onToggleBuildings: (value: boolean) => void;
};

export function BuildingsPanel({ showBuildings, onToggleBuildings }: BuildingsPanelProps) {
  return (
    <>
      <div className="panel">
        <div className="panelHeader">
          <h3 className="panelTitle">3DBAG Buildings</h3>
        </div>

        <div className="panelBody">
          <CheckboxItem
            label="Display buildings"
            checked={showBuildings}
            onChange={onToggleBuildings}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: "#f1e9e9ff",
        paddingLeft: 10,
        fontStyle: "italic"
      }}>
        <h4>Help: About buildings</h4>
          <p>
            When buildings are enabled, you can click on a building on the map
            to see information about it.
          </p>
          <p>
            This includes details such as the construction year and the type of building.
          </p>
      </div>
    </>
  );
}
