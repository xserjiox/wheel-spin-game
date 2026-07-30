export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <button className="brand brand-button" type="button" onClick={onClick}>
      <span className="brand-logo-mark" aria-hidden="true">
        <img src="/wheel-spin-logo.png" alt="" />
      </span>
      <span>Wheel Spin</span>
    </button>
  );
}
