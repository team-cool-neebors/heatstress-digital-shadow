import styles from "../../styles/ui/Menu.module.css";
import MenuItem from "./ItemMenu";
import styled from "styled-components";

type Props = {
  open: boolean;
  onClose?: () => void;
  id?: string;
  showBuildings: boolean;
  onToggleBuildings: (v: boolean) => void;
};

const FileUploadWrapper = styled.div`
  margin-top: 2rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #0d0c1d; /* dark label color */
  }

  input[type="file"] {
    display: block;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    cursor: pointer;
    background: #999999ff;
    transition: background 0.2s;

    &:hover {
      background: #e8e8e8;
    }
  }
`;

export default function SideMenu({ open, id, showBuildings, onToggleBuildings }: Props) {
  return (
    <nav
      id={id}
      className={`${styles.menu} ${open ? styles.open : styles.closed}`}
      aria-hidden={!open}
    >
      <h2 className={styles.menuTitle}>Map Layers</h2>
      <div className={styles.menuItems}>
        <MenuItem
          label="3D View (Buildings)"
          checked={showBuildings}
          onChange={onToggleBuildings}
        />
        <MenuItem
          label="Heat Stress Overlay"
        />
        <MenuItem
          label="Import Your Own Map"
          toggleable={false}
        />
         <FileUploadWrapper>
        <label htmlFor="fileUpload">
          Upload a map file with extensions x,y,z:
        </label>
        <input
          id="fileUpload"
          type="file"
          accept=".ppt,.pptx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.name.endsWith(".ppt") && !file.name.endsWith(".pptx")) {
              alert("Please upload a valid PowerPoint file (.ppt or .pptx)");
              e.target.value = "";
              return;
            }
            console.log("Selected file:", file);
          }}
        />
      </FileUploadWrapper>
      </div>
    </nav>
  );
}

