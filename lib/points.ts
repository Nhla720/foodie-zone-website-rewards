// Single place to change the earning rule: 25% of the amount spent, as whole points (rounded down).
// R100 = 25 points, R200 = 50 points, R39.99 = 9 points.
export const POINTS_RATE = 0.25;
// Work in cents and integer maths so rounding is exact (no floating-point surprises).
export const pointsForCents = (cents:number) => Math.floor((cents*25)/10000);
