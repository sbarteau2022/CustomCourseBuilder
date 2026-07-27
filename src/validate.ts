/**
 * Runtime validation of a Course beyond what the type system enforces:
 * referential integrity, pacing sanity, and the first-class-citizen
 * invariants (ethics spine present, non-empty tier readings everywhere).
 *
 * Run directly: node --experimental-strip-types src/validate.ts
 */
import type { Course } from "./types/course.ts";

export function validateCourse(course: Course): string[] {
  const errors: string[] = [];
  const unitIds = new Set<string>();

  for (const unit of course.units) {
    if (unitIds.has(unit.id)) errors.push(`duplicate unit id: ${unit.id}`);
    unitIds.add(unit.id);
  }

  const trackIds = new Set(course.tracks.map((t) => t.id));
  const phaseUnitIds = new Set<string>();

  for (const phase of course.phases) {
    const [start, end] = phase.months;
    if (start < 1 || end > course.durationMonths || start > end) {
      errors.push(`phase ${phase.id}: month window [${start}, ${end}] is outside the course`);
    }
    for (const id of phase.unitIds) {
      if (!unitIds.has(id)) errors.push(`phase ${phase.id}: unknown unit ${id}`);
      if (phaseUnitIds.has(id)) errors.push(`unit ${id} appears in more than one phase`);
      phaseUnitIds.add(id);
    }
  }

  for (const unit of course.units) {
    if (!phaseUnitIds.has(unit.id)) errors.push(`unit ${unit.id} is not scheduled in any phase`);
    if (!trackIds.has(unit.track)) errors.push(`unit ${unit.id}: unknown track ${unit.track}`);
    for (const prereq of unit.prerequisites) {
      if (!unitIds.has(prereq)) errors.push(`unit ${unit.id}: unknown prerequisite ${prereq}`);
    }
    if (unit.credentials.length === 0) {
      errors.push(`unit ${unit.id}: no external credentials listed`);
    }

    const { minHoursPerWeek: min, targetHoursPerWeek: target, maxHoursPerWeek: max, targetWeeks } =
      unit.adaptation.pacing;
    if (!(min > 0 && min <= target && target <= max)) {
      errors.push(`unit ${unit.id}: pacing envelope must satisfy 0 < min <= target <= max`);
    }
    if (targetWeeks <= 0) errors.push(`unit ${unit.id}: targetWeeks must be positive`);
    if (unit.adaptation.watchFor.length === 0) {
      errors.push(`unit ${unit.id}: adaptation contract watches for no signals`);
    }

    // Ethics is first-class: an empty or placeholder tier reading is a failure.
    for (const [tier, text] of Object.entries(unit.tiers)) {
      if (text.trim().length < 40) {
        errors.push(`unit ${unit.id}: tier reading "${tier}" is empty or too thin to mean anything`);
      }
    }
    for (const [pillar, text] of Object.entries(unit.pillars)) {
      if (text.trim().length < 20) {
        errors.push(`unit ${unit.id}: pillar "${pillar}" is empty or too thin`);
      }
    }
  }

  if (!course.spines.some((s) => s.id === "ethics")) {
    errors.push(`course ${course.id}: missing the mandatory ethics spine`);
  }

  return errors;
}

const isMain = process.argv[1]?.endsWith("validate.ts");
if (isMain) {
  const { aiEngineerStack } = await import("../courses/ai-engineer-stack/course.ts");
  const errors = validateCourse(aiEngineerStack);
  if (errors.length > 0) {
    console.error(`${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(
    `${aiEngineerStack.id} valid: ${aiEngineerStack.units.length} units, ` +
      `${aiEngineerStack.phases.length} phases, ${aiEngineerStack.tracks.length} tracks, ` +
      `${aiEngineerStack.units.reduce((n, u) => n + u.credentials.length, 0)} external credentials`,
  );
}
