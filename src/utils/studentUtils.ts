export const STAGES = [
  'أولى ابتدائي',
  'تانية ابتدائي',
  'تالتة ابتدائي',
  'رابعة ابتدائي',
  'خامسة ابتدائي',
  'سادسة ابتدائي',
] as const;

export type NormalizedGender = 'boy' | 'girl' | 'unknown';

export interface StudentLike {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  stage?: string;
  gender?: string;
  street?: string;
  school?: string;
}

export interface FilterOptions {
  searchQuery?: string;
  genderFilter?: string;
  stageFilter?: string;
  streetFilter?: string;
}

export function normalizeGender(gender: string | undefined): NormalizedGender {
  const value = (gender || '').trim().toLowerCase();
  if (['boy', 'male', 'm', 'ولد', 'بنين', 'ذكر'].includes(value)) return 'boy';
  if (['girl', 'female', 'f', 'بنت', 'بنات', 'أنثى', 'انثى'].includes(value)) return 'girl';
  return 'unknown';
}

export function isBoy(gender: string | undefined): boolean {
  return normalizeGender(gender) === 'boy';
}

export function isGirl(gender: string | undefined): boolean {
  return normalizeGender(gender) === 'girl';
}

export function genderMatchesFilter(gender: string | undefined, filter: string): boolean {
  if (filter === 'All') return true;
  const normalized = normalizeGender(gender);
  if (filter === 'Boy') return normalized === 'boy';
  if (filter === 'Girl') return normalized === 'girl';
  return normalized === filter.toLowerCase();
}

export function filterStudents<T extends StudentLike>(
  students: T[],
  { searchQuery = '', genderFilter = 'All', stageFilter = 'All', streetFilter = 'All' }: FilterOptions
): T[] {
  const query = searchQuery.trim().toLowerCase();

  return students.filter((student) => {
    const fullName = `${student.firstName || ''} ${student.secondName || ''} ${student.thirdName || ''}`
      .trim()
      .toLowerCase();
    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      (student.school || '').toLowerCase().includes(query) ||
      (student.street || '').toLowerCase().includes(query);

    const matchesGender = genderMatchesFilter(student.gender, genderFilter);

    const studentStage = (student.stage || '').trim();
    const matchesStage =
      stageFilter === 'All' || studentStage.toLowerCase() === stageFilter.trim().toLowerCase();

    const studentStreet = (student.street || '').trim();
    const matchesStreet =
      streetFilter === 'All' || studentStreet === streetFilter.trim();

    return matchesSearch && matchesGender && matchesStage && matchesStreet;
  });
}

export function getOrderedStages(students: StudentLike[]): string[] {
  const fromData = Array.from(new Set(students.map((s) => (s.stage || '').trim()).filter(Boolean)));
  const ordered = STAGES.filter((stage) => fromData.includes(stage));
  const extras = fromData.filter((stage) => !STAGES.includes(stage as (typeof STAGES)[number]));
  return [...ordered, ...extras];
}

export function getGenderLabel(gender: string | undefined): string {
  return isBoy(gender) ? 'ولد' : isGirl(gender) ? 'بنت' : '—';
}

export type StagePromotionResult =
  | { action: 'promote'; nextStage: string }
  | { action: 'archive' }
  | { action: 'skip' };

/** Next stage for end-of-year promotion; sixth grade → archive (graduation). */
export function getStagePromotion(currentStage: string): StagePromotionResult {
  const trimmed = (currentStage || '').trim();
  const index = STAGES.findIndex((s) => s === trimmed);
  if (index === -1) return { action: 'skip' };
  if (index === STAGES.length - 1) return { action: 'archive' };
  return { action: 'promote', nextStage: STAGES[index + 1] };
}
