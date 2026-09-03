import { randomInt } from "node:crypto";

const WEIGHT_SCALE = 100;
const CHANCE_SCALE = 10;
const TOTAL_CHANCE_UNITS = 100 * CHANCE_SCALE;
const MIN_CHANCE_UNITS = 1 * CHANCE_SCALE;

export type WeightedOption = {
  id: string;
  weight: number;
};

function allocateChanceUnits(
  options: WeightedOption[],
  totalUnits: number,
): Map<string, number> {
  const minimumTotal = options.length * MIN_CHANCE_UNITS;
  if (totalUnits < minimumTotal) {
    throw new RangeError("Not enough chance remains for the minimum allocation");
  }

  const weights = options.map((option) => Math.max(0, option.weight));
  const exactAllocations = Array<number>(options.length).fill(0);
  let pendingIndexes = options.map((_, index) => index);
  let availableUnits = totalUnits;

  while (pendingIndexes.length > 0) {
    const pendingWeight = pendingIndexes.reduce(
      (total, index) => total + weights[index],
      0,
    );
    if (pendingWeight === 0) {
      const equalUnits = availableUnits / pendingIndexes.length;
      pendingIndexes.forEach((index) => {
        exactAllocations[index] = equalUnits;
      });
      break;
    }

    const scale = availableUnits / pendingWeight;
    const constrainedIndexes = pendingIndexes.filter(
      (index) => weights[index] * scale < MIN_CHANCE_UNITS,
    );
    if (constrainedIndexes.length === 0) {
      pendingIndexes.forEach((index) => {
        exactAllocations[index] = weights[index] * scale;
      });
      break;
    }

    constrainedIndexes.forEach((index) => {
      exactAllocations[index] = MIN_CHANCE_UNITS;
      availableUnits -= MIN_CHANCE_UNITS;
    });
    const constrained = new Set(constrainedIndexes);
    pendingIndexes = pendingIndexes.filter((index) => !constrained.has(index));
  }

  const allocations = options.map((option, index) => {
    const units = Math.floor(exactAllocations[index]);
    return {
      id: option.id,
      index,
      units,
      remainder: exactAllocations[index] - units,
    };
  });
  let remainingUnits =
    totalUnits - allocations.reduce((total, item) => total + item.units, 0);

  allocations
    .slice()
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
    .forEach((item) => {
      if (remainingUnits <= 0) return;
      allocations[item.index].units += 1;
      remainingUnits -= 1;
    });

  return new Map(allocations.map((item) => [item.id, item.units]));
}

export function normalizeChanceWeights(options: WeightedOption[]): WeightedOption[] {
  if (options.length === 0) return [];
  const unitsById = allocateChanceUnits(options, TOTAL_CHANCE_UNITS);

  return options.map((option) => ({
    id: option.id,
    weight: unitsById.get(option.id)! / CHANCE_SCALE,
  }));
}

export function redistributeChanceWeights(
  options: WeightedOption[],
  targetId: string,
  targetChance: number,
): WeightedOption[] {
  if (options.length < 2) {
    throw new RangeError("At least two options are required");
  }

  const targetIndex = options.findIndex((option) => option.id === targetId);
  if (targetIndex === -1) throw new RangeError("Target option was not found");

  const targetUnits = Math.round(targetChance * CHANCE_SCALE);
  const otherCount = options.length - 1;
  const maximumTargetUnits = TOTAL_CHANCE_UNITS - otherCount * MIN_CHANCE_UNITS;
  if (targetUnits < MIN_CHANCE_UNITS || targetUnits > maximumTargetUnits) {
    throw new RangeError("Chance is outside the available range");
  }

  const otherOptions = options.filter((_, index) => index !== targetIndex);
  const weightsById = allocateChanceUnits(
    otherOptions,
    TOTAL_CHANCE_UNITS - targetUnits,
  );
  weightsById.set(targetId, targetUnits);

  return options.map((option) => ({
    id: option.id,
    weight: weightsById.get(option.id)! / CHANCE_SCALE,
  }));
}

function toWeightUnits(weight: number): number {
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new RangeError("Option weights must be positive finite numbers");
  }
  return Math.max(1, Math.round(weight * WEIGHT_SCALE));
}

export function selectWeightedIndex(
  weights: number[],
  pickInteger: (maxExclusive: number) => number = randomInt,
): number {
  if (weights.length === 0) throw new RangeError("At least one weight is required");
  const units = weights.map(toWeightUnits);
  const totalUnits = units.reduce((total, weight) => total + weight, 0);
  let cursor = pickInteger(totalUnits);

  for (let index = 0; index < units.length; index += 1) {
    cursor -= units[index];
    if (cursor < 0) return index;
  }

  return units.length - 1;
}

export function calculateFinalRotation(input: {
  optionWeights: number[];
  winnerIndex: number;
  currentRotation: number;
  durationMs: number;
}): number {
  if (input.winnerIndex < 0 || input.winnerIndex >= input.optionWeights.length) {
    throw new RangeError("Winner index is outside the available options");
  }
  const units = input.optionWeights.map(toWeightUnits);
  const totalUnits = units.reduce((total, weight) => total + weight, 0);
  const precedingUnits = units
    .slice(0, input.winnerIndex)
    .reduce((total, weight) => total + weight, 0);
  const winnerCenterDegrees =
    ((precedingUnits + units[input.winnerIndex] / 2) / totalUnits) * 360;
  const targetMod = ((-winnerCenterDegrees % 360) + 360) % 360;
  const currentMod = ((input.currentRotation % 360) + 360) % 360;
  const alignment = (targetMod - currentMod + 360) % 360;
  const turns = Math.max(5, Math.ceil((input.durationMs / 1000) * 0.65));
  return input.currentRotation + turns * 360 + alignment;
}
