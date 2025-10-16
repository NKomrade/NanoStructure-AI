interface Scaler {
  mean: number[];
  scale: number[];
}

// Function to scale the input data
export function scaleInput(input: number[], scalerX: Scaler): number[] {
  return input.map((value, i) => (value - scalerX.mean[i]) / scalerX.scale[i]);
}

// Function to unscale the output data
export function unscaleOutput(output: number[], scalerY: Scaler): number[] {
  return output.map((value, i) => value * scalerY.scale[i] + scalerY.mean[i]);
}
