export default function SeatSelector({ max, value, onChange }) {
  return (
    <label className="field">
      Seats
      <input
        type="number"
        min="1"
        max={Math.max(1, max)}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        required
      />
      <small className="muted">Available: {max}</small>
    </label>
  );
}
