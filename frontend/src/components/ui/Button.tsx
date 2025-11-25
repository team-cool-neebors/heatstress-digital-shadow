import styles from "../../styles/ui/Button.module.css";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
};

export default function Button({
  label,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
