// schoolRecordCalculator.ts

/**
 * Custom error class for invalid input data
 */
class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

interface Subject {
  name: string;
  unit: number;
  rank: number;
  sameRank: number;
  completer: number;
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

  constructor(gradeType: '9' | '5') {
    this.calculator = gradeType === '9' ? new Grade9Calculator() : new Grade5Calculator();
  }

  /**
   * 과목의 등급을 계산합니다.
   * @param subject 과목 정보
   * @returns 계산된 등급
   * @throws {InvalidInputError} 입력값이 유효하지 않은 경우
   */
  calculateSubjectGrade(subject: Subject): number {
    return this.calculator.calculateGrade(subject.rank, subject.sameRank, subject.completer);
  }

  /**
   * 여러 과목의 평균 등급을 계산합니다.
   * @param subjects 과목 정보 배열
   * @returns 평균 등급 (소수점 둘째자리까지 반올림)
   * @throws {Error} 유효한 등급이 없는 경우
   */
  calculateAverageGrade(subjects: Subject[]): number {
    if (subjects.length === 0) {
      throw new Error('과목 정보가 없습니다.');
    }

    let sum = 0;
    let count = 0;

    for (const subject of subjects) {
      try {
        const grade = this.calculateSubjectGrade(subject);
        sum += grade;
        count++;
      } catch (error) {
        if (error instanceof InvalidInputError) {
          console.warn(`과목 "${subject.name}"의 등급 계산 중 오류: ${error.message}`);
        } else {
          throw error;
        }
      }
    }

    if (count === 0) {
      throw new Error('유효한 등급을 계산할 수 있는 과목이 없습니다.');
    }

    return Math.round((sum / count) * 100) / 100;
  }

  /**
   * 등급별 백분위 범위를 반환합니다.
   * @returns 등급별 백분위 범위 배열
   */
  getPercentileRanges(): string[] {
    return this.calculator.getPercentileRanges();
  }
}
