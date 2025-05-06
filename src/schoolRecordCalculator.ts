// schoolRecordCalculator.ts

/**
 * Custom error classes for different error scenarios
 */
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export class CalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalculationError';
  }
}

/**
 * Enum for grade types
 */
export enum GradeType {
  NINE = '9',
  FIVE = '5',
}

/**
 * Interface for subject information
 */
export interface Subject {
  name: string;
  unit: number;
  rank: number;
  sameRank: number;
  completer: number;

  /**
   * Validates the subject data
   * @throws {InvalidInputError} if the subject data is invalid
   */
  validate(): void;
}

interface GradeCalculator {
  calculateGrade(rank: number, sameRank: number, completer: number): number;
  getPercentileRanges(): string[];
}

// 등급 계산을 위한 상수 정의
const GRADE_9_RANGES = [
  { maxPercent: 4, grade: 1 },
  { maxPercent: 11, grade: 2 },
  { maxPercent: 23, grade: 3 },
  { maxPercent: 40, grade: 4 },
  { maxPercent: 60, grade: 5 },
  { maxPercent: 77, grade: 6 },
  { maxPercent: 89, grade: 7 },
  { maxPercent: 96, grade: 8 },
  { maxPercent: 100, grade: 9 },
];

const GRADE_5_RANGES = [
  { maxPercent: 10, grade: 1 },
  { maxPercent: 34, grade: 2 },
  { maxPercent: 66, grade: 3 },
  { maxPercent: 90, grade: 4 },
  { maxPercent: 100, grade: 5 },
];

// 기본 등급 계산기 클래스
export abstract class BaseGradeCalculator implements GradeCalculator {
  protected abstract readonly ranges: typeof GRADE_9_RANGES | typeof GRADE_5_RANGES;
  protected abstract readonly percentileRanges: string[];

  calculateGrade(rank: number, sameRank: number, completer: number): number {
    this.validateInput(rank, sameRank, completer);
    const percent = this.calculatePercentile(rank, sameRank, completer);
    return this.getGradeFromPercent(percent);
  }

  getPercentileRanges(): string[] {
    return this.percentileRanges;
  }

  protected validateInput(rank: number, sameRank: number, completer: number): void {
    if (completer <= 0) {
      throw new InvalidInputError('수강자 수는 0보다 커야 합니다.');
    }
    if (rank <= 0) {
      throw new InvalidInputError('석차는 0보다 커야 합니다.');
    }
    if (sameRank <= 0) {
      throw new InvalidInputError('동석차는 0보다 커야 합니다.');
    }
    if (rank > completer) {
      throw new InvalidInputError('석차는 수강자 수보다 클 수 없습니다.');
    }
    if (sameRank > completer - rank + 1) {
      throw new InvalidInputError('동석차는 남은 수강자 수보다 클 수 없습니다.');
    }
  }

  protected calculatePercentile(rank: number, sameRank: number, completer: number): number {
    return ((rank + sameRank - 1) / completer) * 100;
  }

  protected getGradeFromPercent(percent: number): number {
    for (const range of this.ranges) {
      if (percent <= range.maxPercent) {
        return range.grade;
      }
    }
    return this.ranges[this.ranges.length - 1].grade; // 마지막 등급 반환
  }
}

class Grade9Calculator extends BaseGradeCalculator {
  protected readonly ranges = GRADE_9_RANGES;
  protected readonly percentileRanges = [
    '상위 4%이내', // 1등급
    '4%~11%구간', // 2등급
    '11%~23%구간', // 3등급
    '23%~40%구간', // 4등급
    '40%~60%구간', // 5등급
    '60%~77%구간', // 6등급
    '77%~89%구간', // 7등급
    '89%~96%구간', // 8등급
    '96%~100%구간', // 9등급
  ];
}

class Grade5Calculator extends BaseGradeCalculator {
  protected readonly ranges = GRADE_5_RANGES;
  protected readonly percentileRanges = [
    '상위 10%이내', // 1등급
    '10%~34%구간', // 2등급
    '34%~66%구간', // 3등급
    '66%~90%구간', // 4등급
    '90%~100%구간', // 5등급
  ];
}

export class SchoolRecordCalculator {
  private calculator: GradeCalculator;

  /**
   * Creates a new SchoolRecordCalculator instance
   * @param gradeType - The type of grade system to use ('9' or '5')
   * @throws {InvalidInputError} if the grade type is invalid
   */
  constructor(gradeType: GradeType) {
    if (gradeType !== GradeType.NINE && gradeType !== GradeType.FIVE) {
      throw new InvalidInputError('Invalid grade type. Must be either "9" or "5"');
    }
    this.calculator =
      gradeType === GradeType.NINE ? new Grade9Calculator() : new Grade5Calculator();
  }

  /**
   * Calculates the grade for a single subject
   * @param subject - The subject information
   * @returns The calculated grade
   * @throws {InvalidInputError} if the subject data is invalid
   * @throws {CalculationError} if the grade calculation fails
   */
  calculateSubjectGrade(subject: Subject): number {
    try {
      if (typeof subject.validate !== 'function') {
        throw new InvalidInputError('Subject must have a valid validate method');
      }
      subject.validate();

      if (typeof this.calculator.calculateGrade !== 'function') {
        throw new CalculationError('Calculator must have a valid calculateGrade method');
      }
      return this.calculator.calculateGrade(subject.rank, subject.sameRank, subject.completer);
    } catch (error: unknown) {
      if (error instanceof InvalidInputError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new CalculationError(
        `Failed to calculate grade for subject "${subject.name}": ${errorMessage}`
      );
    }
  }

  /**
   * Calculates the average grade for multiple subjects
   * @param subjects - Array of subject information
   * @returns The average grade (rounded to 2 decimal places)
   * @throws {CalculationError} if no valid grades can be calculated
   */
  calculateAverageGrade(subjects: Subject[]): { average: number; invalidSubjects: string[] } {
    if (subjects.length === 0) {
      throw new CalculationError('No subjects provided');
    }

    let sum = 0;
    let count = 0;
    const invalidSubjects: string[] = [];

    for (const subject of subjects) {
      try {
        subject.validate();
        const grade = this.calculator.calculateGrade(
          subject.rank,
          subject.sameRank,
          subject.completer
        );
        sum += grade;
        count++;
      } catch (error: unknown) {
        if (error instanceof Error) {
          invalidSubjects.push(`${subject.name}: ${error.message}`);
        } else if (typeof error === 'string') {
          invalidSubjects.push(`${subject.name}: ${error}`);
        } else {
          invalidSubjects.push(`${subject.name}: Unknown error`);
        }
      }
    }

    if (count === 0) {
      throw new CalculationError('No valid grades could be calculated');
    }

    return {
      average: Math.round((sum / count) * 100) / 100,
      invalidSubjects,
    };
  }

  /**
   * Returns the percentile ranges for each grade
   * @returns Array of percentile range descriptions
   */
  getPercentileRanges(): string[] {
    if (typeof this.calculator.getPercentileRanges !== 'function') {
      throw new CalculationError('Calculator must have a valid getPercentileRanges method');
    }
    return this.calculator.getPercentileRanges();
  }
}
