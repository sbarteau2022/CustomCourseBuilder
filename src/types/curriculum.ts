/**
 * The curriculum layer — first-party courses we author and teach
 * ourselves, as opposed to the Course schema in course.ts, which maps a
 * program over external credentials.
 *
 * A Curriculum is a weighted, prerequisite-ordered set of CourseSpecs.
 * Each CourseSpec carries its assessment weighting and a module list;
 * each module is a DISPATCHABLE WORK PACKET — the unit of parallel
 * material design. The full teaching detail lives in one syllabus
 * markdown per course (curriculum/<id>/syllabi/<code>.md); the typed
 * manifest is the contract those documents and the dispatch process are
 * validated against.
 *
 * House rules carry over from the course schema: every course states its
 * three-tier ethics reading practice and its adaptation envelope. The
 * validator enforces both, plus: program weights sum to 100, assessment
 * weights sum to 100 per course, the prerequisite graph is acyclic, and
 * every course has its syllabus file.
 */

export type CourseTier = "foundation" | "core" | "specialization" | "capstone";

export interface AssessmentWeight {
  /** e.g. "labs", "projects", "judgment-trail", "sealed-readings", "capstone-defense" */
  kind: string;
  /** Percent of the course grade. Sums to 100 within a course. */
  percent: number;
  note: string;
}

/**
 * One module = one dispatchable work packet for a material-design agent.
 * The syllabus file carries the full lesson-level detail; the standard
 * deliverables every packet owes are defined once in Curriculum.dispatch.
 */
export interface ModulePacket {
  /** Stable packet id, e.g. "AIE-201-M03". */
  id: string;
  title: string;
  /** Estimated learner hours for the module (lessons + labs + assessment). */
  hours: number;
}

/**
 * How stale the course's content is expected to get — the staleness-
 * resistance architecture. Durable content is fundamentals that outlast
 * any tool; swappable content is the current-tools surface that must be
 * refreshable without touching the durable core. Every course declares
 * where it sits so the material stays alive for years, not months.
 */
export type Durability = "durable" | "mixed" | "swappable";

export interface CourseSpec {
  /** e.g. "AIE-201" */
  code: string;
  title: string;
  tier: CourseTier;
  /** Percent of the whole program. All courses sum to 100. */
  weightPercent: number;
  /** Estimated total learner hours. */
  hours: number;
  /** Course codes that must be completed (or co-taken where marked) first. */
  prerequisites: string[];
  /** Courses designed to run concurrently with this one. */
  corequisites: string[];
  /** What a learner can DO after this course — observable, assessable. */
  outcomes: string[];
  /** The course's own bar: what distinguishes it from every competitor. */
  outpaces: string;
  /**
   * How the descend → build → re-ascend spine applies to THIS subject:
   * what substrate the learner descends to, what they build there by
   * hand, and what they re-ascend to command. Every course has one —
   * the philosophy is not decoration reserved for the coding courses.
   */
  descentArc: string;
  durability: Durability;
  assessmentWeights: AssessmentWeight[];
  modules: ModulePacket[];
  /** The three-tier ethics practice specific to this course's subject. */
  ethicsThread: string;
  /** Pacing envelope for Elle's witnessing, hrs/week min-max. */
  paceHoursPerWeek: [min: number, max: number];
}

/** A named organizing principle of the whole curriculum — the soul. */
export interface Principle {
  name: string;
  /** The one-line statement of the principle. */
  statement: string;
  /** How it shows up as concrete practice in every course. */
  practice: string;
}

export interface Curriculum {
  id: string;
  title: string;
  version: string;
  thesis: string;
  /**
   * The philosophy every course is built on — not inherited from how the
   * subjects have conventionally been taught. Material-design agents build
   * to these, not to textbook convention.
   */
  philosophy: Principle[];
  /** Total program hours at target pace. */
  totalHours: number;
  courses: CourseSpec[];
  /** How material-design work is dispatched — the Cowork contract. */
  dispatch: {
    packetContract: string[];
    qualityGates: string[];
  };
}
