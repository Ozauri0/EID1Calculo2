/**
 * Calculates the power at a given time t based on the model P(t) = k * t * e^(-a * t)
 * @param t Time in hours
 * @param k Constant k
 * @param a Constant a
 * @returns Power in Watts
 */
export function calculatePower(t: number, k: number, a: number): number {
    return k * t * Math.exp(-a * t);
}

/**
 * Calculates the indefinite integral value at time t: E(t) = (-k/a) * e^(-a * t) * (t + 1/a)
 * Note: This is the antiderivative. To get energy over [0, T], use calculateIntervalEnergy.
 * @param t Time in hours
 * @param k Constant k
 * @param a Constant a
 * @returns Energy value (part of the integral calculation)
 */
export function calculateEnergy(t: number, k: number, a: number): number {
    return (-k / a) * Math.exp(-a * t) * (t + 1 / a);
}

/**
 * Calculates the total energy consumed in the interval [0, T]
 * Formula: E(T) - E(0)
 * @param T Total cycle time in hours
 * @param k Constant k
 * @param a Constant a
 * @returns Total Energy in Watt-hours (Wh)
 */
export function calculateIntervalEnergy(T: number, k: number, a: number): number {
    const energyAtT = calculateEnergy(T, k, a);
    const energyAt0 = calculateEnergy(0, k, a);
    return energyAtT - energyAt0;
}

/**
 * Finds the peak power and the time it occurs.
 * Peak occurs at t = 1/a.
 * @param k Constant k
 * @param a Constant a
 * @returns Object containing time of peak and peak power.
 */
export function findPeak(k: number, a: number): { time: number; power: number } {
    const time = 1 / a;
    const power = calculatePower(time, k, a);
    return { time, power };
}
