export function getTravellerLevelProgress(totalKg) {
  if (totalKg >= 30) {
    return {
      level: 2,
      title: "Level 2",
      currentKg: totalKg,
      currentLabel: `${totalKg.toFixed(1)} kg carried`,
      nextLabel: "Top milestone reached",
      progressPct: 100,
    };
  }

  if (totalKg >= 20) {
    return {
      level: 1,
      title: "Level 1",
      currentKg: totalKg,
      currentLabel: `${totalKg.toFixed(1)} / 30 kg`,
      nextLabel: `${(30 - totalKg).toFixed(1)} kg to Level 2`,
      progressPct: Math.max(0, Math.min(((totalKg - 20) / 10) * 100, 100)),
    };
  }

  return {
    level: 0,
    title: "Starter",
    currentKg: totalKg,
    currentLabel: `${totalKg.toFixed(1)} / 20 kg`,
    nextLabel: `${(20 - totalKg).toFixed(1)} kg to Level 1`,
    progressPct: Math.max(0, Math.min((totalKg / 20) * 100, 100)),
  };
}
