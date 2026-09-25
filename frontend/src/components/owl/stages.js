export function stageFor(solved) {
  const steps = [["egg", 0], ["chick", 10], ["young", 50], ["wise", 150], ["legend", 400]];
  let name = "egg";
  for (const [stage, need] of steps) {
    if (solved >= need) name = stage;
  }
  return name;
}
