// schoolRecordCalculator.ts

interface Subject {
  name: string;
  unit: number;
  rank: number;
  sameRank: number;
  completer: number;
}

interface GradeCalculator {
  calculateGrade(rank: number, sameRank: number, completer: number): number | '-';
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
  { maxPercent: 100, grade: 9 }
];

const GRADE_5_RANGES = [
  { maxPercent: 10, grade: 1 },
  { maxPercent: 34, grade: 2 },
  { maxPercent: 66, grade: 3 },
  { maxPercent: 90, grade: 4 },
  { maxPercent: 100, grade: 5 }
];

// 기본 등급 계산기 클래스
abstract class BaseGradeCalculator implements GradeCalculator {
  protected abstract readonly ranges: typeof GRADE_9_RANGES | typeof GRADE_5_RANGES;
  protected abstract readonly percentileRanges: string[];

  calculateGrade(rank: number, sameRank: number, completer: number): number | '-' {
    if (!this.isValidInput(rank, sameRank, completer)) return '-';
    
    const percent = this.calculatePercentile(rank, sameRank, completer);
    return this.getGradeFromPercent(percent);
  }

  getPercentileRanges(): string[] {
    return this.percentileRanges;
  }

  protected isValidInput(rank: number, sameRank: number, completer: number): boolean {
    return completer > 0 && rank > 0 && sameRank > 0 && rank <= completer;
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
    return 9; // 기본값으로 최저 등급 반환
  }
}

class Grade9Calculator extends BaseGradeCalculator {
  protected readonly ranges = GRADE_9_RANGES;
  protected readonly percentileRanges = [
    '상위 4%이내',    // 1등급
    '4%~11%구간',    // 2등급
    '11%~23%구간',   // 3등급
    '23%~40%구간',   // 4등급
    '40%~60%구간',   // 5등급
    '60%~77%구간',   // 6등급
    '77%~89%구간',   // 7등급
    '89%~96%구간',   // 8등급
    '96%~100%구간',  // 9등급
  ];
}

class Grade5Calculator extends BaseGradeCalculator {
  protected readonly ranges = GRADE_5_RANGES;
  protected readonly percentileRanges = [
    '상위 10%이내',   // 1등급
    '10%~34%구간',   // 2등급
    '34%~66%구간',   // 3등급
    '66%~90%구간',   // 4등급
    '90%~100%구간',  // 5등급
  ];
}

export class SchoolRecordCalculator {
  private calculator: GradeCalculator;

  constructor(gradeType: '9' | '5') {
    this.calculator = gradeType === '9' ? new Grade9Calculator() : new Grade5Calculator();
  }

  calculateSubjectGrade(subject: Subject): number | '-' {
    return this.calculator.calculateGrade(subject.rank, subject.sameRank, subject.completer);
  }

  calculateAverageGrade(subjects: Subject[]): number | '-' {
    const validGrades = subjects
      .map(subject => this.calculateSubjectGrade(subject))
      .filter((grade): grade is number => grade !== '-');

    if (validGrades.length === 0) return '-';

    const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
    return Math.round((sum / validGrades.length) * 100) / 100;
  }

  getPercentileRanges(): string[] {
    return this.calculator.getPercentileRanges();
  }
}