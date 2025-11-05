import styled from "styled-components";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  "aria-controls"?: string;
};

const StyledBurger = styled.button<{ open: boolean }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001; /* above the map and the menu trigger */

  &:focus {
    outline: 2px solid #000000ff;
    outline-offset: 3px;
  }

  div {
    width: 2rem;
    height: 0.25rem;
    background: ${({ open }) => (open ? "#000000ff" : "#000000ff")};
    border-radius: 10px;
    transition: all 0.3s linear;
    transform-origin: 1px;

    :first-child {
      transform: ${({ open }) => (open ? "rotate(45deg)" : "rotate(0)")};
    }
    :nth-child(2) {
      opacity: ${({ open }) => (open ? "0" : "1")};
      transform: ${({ open }) => (open ? "translateX(20px)" : "translateX(0)")};
    }
    :nth-child(3) {
      transform: ${({ open }) => (open ? "rotate(-45deg)" : "rotate(0)")};
    }
  }
`;

export default function Burger({ open, setOpen, ...rest }: Props) {
  return (
    <StyledBurger
      aria-label="Toggle menu"
      aria-expanded={open}
      open={open}
      onClick={() => setOpen(!open)}
      {...rest}
    >
      <div />
      <div />
      <div />
    </StyledBurger>
  );
}
