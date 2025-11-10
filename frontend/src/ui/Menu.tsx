import styled from "styled-components";

type Props = {
  open: boolean;
  onClose?: () => void;
  id?: string;
  showBuildings: boolean;
  showTrees: boolean;
  onToggleBuildings: (v: boolean) => void;
  onToggleTrees: (v: boolean) => void;
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

export default function Menu({ open, id, showBuildings, showTrees, onToggleBuildings, onToggleTrees }: Props) {
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

      <label style={{ display: "flex", alignItems: "center", gap: ".75rem", color: "#0d0c1d" }}>
        <input
          type="checkbox"
          checked={showTrees}
          onChange={(e) => onToggleTrees(e.target.checked)}
        />
        Show trees
      </label>
      {/* ...other links/items */}
    </StyledMenu>
  );
}

