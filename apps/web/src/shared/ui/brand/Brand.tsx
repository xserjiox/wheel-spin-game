export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <button className="brand brand-button" type="button" onClick={onClick}>
      <span className="brand-logo-mark" aria-hidden="true">
        <img src="/gatherwheel-logo.png" alt="" width="128" height="128" />
      </span>
      <span>GatherWheel</span>
    </button>
  );
}
