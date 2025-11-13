import styled from "styled-components";

type Props = {
  open: boolean;
  onClose?: () => void;
  id?: string;
  showBuildings: boolean;
  onToggleBuildings: (v: boolean) => void;
};

const StyledMenu = styled.nav<{ open: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100dvh;
  background: #ffffffff;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  

  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-100%)")};
  transition: transform 0.3s ease-in-out;
  z-index: 1000; /* below burger button but above map */

  @media (max-width: 576px) {
    width: 100%;
  }

  a {
    font-size: 2rem;
    text-transform: uppercase;
    padding: 1rem 0;
    font-weight: bold;
    letter-spacing: 0.2rem;
    color: #0d0c1d;
    text-decoration: none;
    transition: color 0.2s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: #343078;
    }
  }
`;


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


export default function Menu({ open, id, showBuildings, onToggleBuildings }: Props) {
  return (
    <StyledMenu id={id} open={open} aria-hidden={!open}>
      <label style={{ display: "flex", alignItems: "center", gap: ".75rem", color: "#0d0c1d" }}>
        <input
          type="checkbox"
          checked={showBuildings}
          onChange={(e) => onToggleBuildings(e.target.checked)}
        />
        Show buildings
      </label>

      <FileUploadWrapper>
        <label htmlFor="fileUpload">
          Upload a map file with extensions x,y,z:
        </label>
        <input
          id="fileUpload"
          type="file"
          accept=".ppt,.pptx"
          onChange={(e) => {
            const file = e.target.files[0];
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

      {/* ...other links/items */}
    </StyledMenu>
  );
}

