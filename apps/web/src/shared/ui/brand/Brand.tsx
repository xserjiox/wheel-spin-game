export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <button className="brand brand-button" type="button" onClick={onClick}>
      <span className="brand-mark" aria-hidden="true">
        ✦
      </span>
      <span>Wheel Spin</span>
    </button>
  );
}
