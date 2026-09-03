import type { Option } from "./types";

export const DEFAULT_OPTION_WEIGHT = 1;
export const MIN_OPTION_WEIGHT = 1;
export const MIN_OPTION_CHANCE = 1;

export function getOptionWeight(option: Pick<Option, "weight">): number {
  return Number.isFinite(option.weight) && (option.weight ?? 0) >= MIN_OPTION_WEIGHT
    ? option.weight!
    : DEFAULT_OPTION_WEIGHT;
}

export function getTotalOptionWeight(options: Option[]): number {
  return options.reduce((total, option) => total + getOptionWeight(option), 0);
}

export function getOptionProbability(option: Option, options: Option[]): number {
  const totalWeight = getTotalOptionWeight(options);
  return totalWeight > 0 ? (getOptionWeight(option) / totalWeight) * 100 : 0;
}

export function getOptionChanceMaximum(options: Option[]): number {
  const activeCount = options.filter((option) => !option.excluded).length;
  return Math.max(MIN_OPTION_CHANCE, 100 - (activeCount - 1) * MIN_OPTION_CHANCE);
}

export type WheelSegment = {
  option: Option;
  index: number;
  start: number;
  end: number;
  arc: number;
};

export function getWheelSegments(options: Option[]): WheelSegment[] {
  const totalWeight = getTotalOptionWeight(options);
  let cursor = -Math.PI / 2;

  return options.map((option, index) => {
    const start = cursor;
    const arc = (getOptionWeight(option) / totalWeight) * Math.PI * 2;
    cursor += arc;
    return { option, index, start, end: cursor, arc };
  });
}

export function getOptionIndexAtAngle(options: Option[], angleFromTop: number): number {
  if (options.length === 0) return -1;
  const fullTurn = Math.PI * 2;
  const normalizedAngle = ((angleFromTop % fullTurn) + fullTurn) % fullTurn;
  const totalWeight = getTotalOptionWeight(options);
  const targetWeight = (normalizedAngle / fullTurn) * totalWeight;
  const boundaryTolerance = totalWeight * 1e-12;
  let cursor = 0;

  for (let index = 0; index < options.length; index += 1) {
    cursor += getOptionWeight(options[index]);
    if (targetWeight < cursor - boundaryTolerance) return index;
  }

  return options.length - 1;
}
