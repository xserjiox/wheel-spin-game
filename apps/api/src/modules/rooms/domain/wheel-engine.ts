export function calculateFinalRotation(input: {
  optionCount: number;
  winnerIndex: number;
  currentRotation: number;
  durationMs: number;
}): number {
  const segmentDegrees = 360 / input.optionCount;
  const targetMod = (((-(input.winnerIndex + 0.5) * segmentDegrees) % 360) + 360) % 360;
  const currentMod = ((input.currentRotation % 360) + 360) % 360;
  const alignment = (targetMod - currentMod + 360) % 360;
  const turns = Math.max(5, Math.ceil((input.durationMs / 1000) * 0.65));
  return input.currentRotation + turns * 360 + alignment;
}
