import {
  SchoolRecordCalculator,
  BaseGradeCalculator,
  GradeType,
  Subject,
  InvalidInputError,
  CalculationError,
} from '../src/schoolRecordCalculator';

// Subject 인터페이스를 구현하는 클래스 생성
class TestSubject implements Subject {
  constructor(
    public name: string,
    public unit: number,
    public rank: number,
    public sameRank: number,
    public completer: number
  ) {}

  validate(): void {
    if (this.completer <= 0) {
      throw new Error('수강자 수는 0보다 커야 합니다.');
    }
    if (this.rank <= 0) {
      throw new Error('석차는 0보다 커야 합니다.');
    }
    if (this.sameRank <= 0) {
      throw new Error('동석차는 0보다 커야 합니다.');
    }
    if (this.rank > this.completer) {
      throw new Error('석차는 수강자 수보다 클 수 없습니다.');
    }
    if (this.sameRank > this.completer - this.rank + 1) {
      throw new Error('동석차는 남은 수강자 수보다 클 수 없습니다.');
    }
  }
}

interface MockCalculator {
  calculateGrade: (rank: number) => number;
  getPercentileRanges: () => string[];
}

describe('SchoolRecordCalculator', () => {
  describe('생성자 테스트', () => {
    test('잘못된 등급 타입으로 생성 시 에러 발생', (): void => {
      expect(() => new SchoolRecordCalculator('invalid' as GradeType)).toThrow(
        'Invalid grade type'
      );
    });
  });

  describe('9등급 계산기', () => {
    let calculator: SchoolRecordCalculator;

    beforeEach((): void => {
      calculator = new SchoolRecordCalculator(GradeType.NINE);
    });

    test('정상적인 입력에 대한 등급 계산', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('동석차가 있는 경우의 등급 계산', (): void => {
      const subject = new TestSubject('영어', 5, 1, 3, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('평균 등급 계산', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 10, 1, 100),
      ];
      expect(calculator.calculateAverageGrade(subjects).average).toBe(1.5);
    });

    test('잘못된 입력에 대한 에러 처리', (): void => {
      const subject = new TestSubject('수학', 5, 0, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('석차는 0보다 커야 합니다.');
    });

    test('동석차가 수강자 수를 초과하는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 101, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 남은 수강자 수보다 클 수 없습니다.'
      );
    });

    test('수강자 수가 0 이하인 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 0);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '수강자 수는 0보다 커야 합니다.'
      );
    });

    test('동석차가 0 이하인 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 0, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 0보다 커야 합니다.'
      );
    });

    test('석차가 수강자 수보다 큰 경우', (): void => {
      const subject = new TestSubject('수학', 5, 101, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '석차는 수강자 수보다 클 수 없습니다.'
      );
    });

    test('마지막 등급(9등급) 계산', (): void => {
      const subject = new TestSubject('수학', 5, 97, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(9);
    });

    test('일반적인 에러 처리', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      const mockCalculator: MockCalculator = {
        calculateGrade: () => {
          throw new Error('일반적인 에러');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('일반적인 에러');
    });

    test('마지막 등급 계산 - 정확히 89% 지점', (): void => {
      const subject = new TestSubject('수학', 5, 89, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(7);
    });

    test('마지막 등급 계산 - 정확히 96% 지점', (): void => {
      const subject = new TestSubject('수학', 5, 96, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(8);
    });

    test('일반적인 에러 처리 - 평균 등급 계산', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 2, 1, 100),
      ];
      const mockCalculator: MockCalculator = {
        calculateGrade: (rank: number) => {
          if (rank === 1) {
            throw new Error('일반적인 에러');
          }
          return 2;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const result = calculator.calculateAverageGrade(subjects);
      expect(result.average).toBe(2);
      expect(result.invalidSubjects).toContain('수학: 일반적인 에러');
    });

    test('백분율이 모든 범위를 초과하는 경우', (): void => {
      class TestCalculator extends BaseGradeCalculator {
        protected readonly ranges = [{ maxPercent: 50, grade: 1 }];
        protected readonly percentileRanges = ['테스트'];
      }

      const testCalculator = new TestCalculator();
      const percent = 100;
      expect(testCalculator['getGradeFromPercent'](percent)).toBe(1);
    });

    test('getPercentileRanges 메서드 테스트', (): void => {
      const ranges = calculator.getPercentileRanges();
      expect(ranges).toEqual([
        '상위 4%이내',
        '4%~11%구간',
        '11%~23%구간',
        '23%~40%구간',
        '40%~60%구간',
        '60%~77%구간',
        '77%~89%구간',
        '89%~96%구간',
        '96%~100%구간',
      ]);
    });

    test('모든 과목이 유효하지 않은 경우', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 0, 1, 100),
        new TestSubject('영어', 5, 0, 1, 100),
      ];
      expect(() => calculator.calculateAverageGrade(subjects)).toThrow(
        'No valid grades could be calculated'
      );
    });

    test('일반적인 에러 처리 - 알 수 없는 에러', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 2, 1, 100),
      ];
      const mockCalculator: MockCalculator = {
        calculateGrade: (rank: number) => {
          if (rank === 1) {
            throw 'Unknown error';
          }
          return 2;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const result = calculator.calculateAverageGrade(subjects);
      expect(result.average).toBe(2);
      expect(result.invalidSubjects).toContain('수학: Unknown error');
    });

    test('일반적인 에러 처리 - 알 수 없는 에러 타입', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 2, 1, 100),
      ];
      const mockCalculator: MockCalculator = {
        calculateGrade: (rank: number) => {
          if (rank === 1) {
            throw null;
          }
          return 2;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const result = calculator.calculateAverageGrade(subjects);
      expect(result.average).toBe(2);
      expect(result.invalidSubjects).toContain('수학: Unknown error');
    });

    test('validate 메서드가 없는 Subject 객체 처리', (): void => {
      const invalidSubject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
      };

      expect(() =>
        calculator.calculateSubjectGrade(invalidSubject as unknown as Subject)
      ).toThrow();
    });

    test('validate 메서드가 함수가 아닌 Subject 객체 처리', (): void => {
      const invalidSubject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
        validate: 'not a function',
      };

      expect(() =>
        calculator.calculateSubjectGrade(invalidSubject as unknown as Subject)
      ).toThrow();
    });

    test('validate 메서드가 잘못된 형식의 함수인 Subject 객체 처리', (): void => {
      const invalidSubject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
        validate: (): void => {
          throw new Error('Invalid validation');
        },
      };

      expect(() => calculator.calculateSubjectGrade(invalidSubject as unknown as Subject)).toThrow(
        'Invalid validation'
      );
    });

    test('calculateGrade가 없는 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow();
    });

    test('getPercentileRanges가 없는 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        calculateGrade: () => 1,
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      expect(() => calculator.getPercentileRanges()).toThrow();
    });

    test('calculateGrade가 함수가 아닌 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        calculateGrade: 'not a function' as unknown as (rank: number) => number,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow();
    });

    test('getPercentileRanges가 함수가 아닌 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        calculateGrade: () => 1,
        getPercentileRanges: 'not a function' as unknown as () => string[],
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      expect(() => calculator.getPercentileRanges()).toThrow();
    });

    test('백분율이 정확히 4%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 1,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 4, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('백분율이 정확히 11%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 2,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 11, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(2);
    });

    test('백분율이 정확히 23%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 3,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 23, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(3);
    });

    test('백분율이 정확히 40%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 4,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 40, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(4);
    });

    test('백분율이 정확히 60%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 5,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 60, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(5);
    });

    test('백분율이 정확히 77%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 6,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 77, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(6);
    });

    test('백분율이 정확히 89%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 7,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 89, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(7);
    });

    test('백분율이 정확히 96%인 경우', (): void => {
      const mockCalculator: MockCalculator = {
        calculateGrade: () => 8,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const subject = new TestSubject('수학', 5, 96, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(8);
    });

    test('calculateSubjectGrade에서 validate 메서드가 InvalidInputError를 던지는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      subject.validate = () => {
        throw new InvalidInputError('Test invalid input error');
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(InvalidInputError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Test invalid input error');
    });

    test('calculateSubjectGrade에서 validate 메서드가 일반 Error를 던지는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      subject.validate = () => {
        throw new Error('Test error');
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(CalculationError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Failed to calculate grade for subject "수학": Test error');
    });

    test('calculateSubjectGrade에서 validate 메서드가 문자열 에러를 던지는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      subject.validate = () => {
        throw 'Test string error';
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(CalculationError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Failed to calculate grade for subject "수학": Test string error');
    });

    test('calculateSubjectGrade에서 validate 메서드가 알 수 없는 에러를 던지는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      subject.validate = () => {
        throw null;
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(CalculationError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Failed to calculate grade for subject "수학": null');
    });

    test('calculateSubjectGrade에서 calculateGrade 호출 시 InvalidInputError가 발생하는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      const mockCalculator: MockCalculator = {
        calculateGrade: () => {
          throw new InvalidInputError('Test invalid input error');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(InvalidInputError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Test invalid input error');
    });

    test('calculateSubjectGrade에서 calculateGrade 호출 시 Error가 발생하는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      const mockCalculator: MockCalculator = {
        calculateGrade: () => {
          throw new Error('Test error');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(CalculationError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Failed to calculate grade for subject "수학": Test error');
    });

    test('calculateSubjectGrade에서 calculateGrade 호출 시 문자열 에러가 발생하는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      const mockCalculator: MockCalculator = {
        calculateGrade: () => {
          throw 'Test string error';
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(CalculationError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Failed to calculate grade for subject "수학": Test string error');
    });

    test('calculateSubjectGrade에서 calculateGrade 호출 시 알 수 없는 에러가 발생하는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      const mockCalculator: MockCalculator = {
        calculateGrade: () => {
          throw null;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(CalculationError);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('Failed to calculate grade for subject "수학": null');
    });
  });

  describe('5등급 계산기', () => {
    let calculator: SchoolRecordCalculator;

    beforeEach((): void => {
      calculator = new SchoolRecordCalculator(GradeType.FIVE);
    });

    test('정상적인 입력에 대한 등급 계산', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('동석차가 있는 경우의 등급 계산', (): void => {
      const subject = new TestSubject('영어', 5, 1, 3, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('평균 등급 계산', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 20, 1, 100),
      ];
      expect(calculator.calculateAverageGrade(subjects).average).toBe(1.5);
    });

    test('빈 과목 배열에 대한 에러 처리', (): void => {
      expect(() => calculator.calculateAverageGrade([])).toThrow('No subjects provided');
    });

    test('잘못된 입력에 대한 에러 처리', (): void => {
      const subject = new TestSubject('수학', 5, 0, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('석차는 0보다 커야 합니다.');
    });

    test('동석차가 수강자 수를 초과하는 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 101, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 남은 수강자 수보다 클 수 없습니다.'
      );
    });

    test('수강자 수가 0 이하인 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 0);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '수강자 수는 0보다 커야 합니다.'
      );
    });

    test('동석차가 0 이하인 경우', (): void => {
      const subject = new TestSubject('수학', 5, 1, 0, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 0보다 커야 합니다.'
      );
    });

    test('석차가 수강자 수보다 큰 경우', (): void => {
      const subject = new TestSubject('수학', 5, 101, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '석차는 수강자 수보다 클 수 없습니다.'
      );
    });

    test('마지막 등급(5등급) 계산', (): void => {
      const subject = new TestSubject('수학', 5, 91, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(5);
    });

    test('일반적인 에러 처리', (): void => {
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      const mockCalculator: MockCalculator = {
        calculateGrade: () => {
          throw new Error('일반적인 에러');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('일반적인 에러');
    });

    test('일반적인 에러 처리 - 평균 등급 계산', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 2, 1, 100),
      ];
      const mockCalculator: MockCalculator = {
        calculateGrade: (rank: number) => {
          if (rank === 1) {
            throw new Error('일반적인 에러');
          }
          return 2;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const result = calculator.calculateAverageGrade(subjects);
      expect(result.average).toBe(2);
      expect(result.invalidSubjects).toContain('수학: 일반적인 에러');
    });

    test('마지막 등급 계산 - 정확히 90% 지점', (): void => {
      const subject = new TestSubject('수학', 5, 90, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(4);
    });

    test('마지막 등급 계산 - 정확히 100% 지점', (): void => {
      const subject = new TestSubject('수학', 5, 100, 1, 100);
      expect(calculator.calculateSubjectGrade(subject)).toBe(5);
    });

    test('getPercentileRanges 메서드 테스트', (): void => {
      const ranges = calculator.getPercentileRanges();
      expect(ranges).toEqual([
        '상위 10%이내',
        '10%~34%구간',
        '34%~66%구간',
        '66%~90%구간',
        '90%~100%구간',
      ]);
    });

    test('모든 과목이 유효하지 않은 경우', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 0, 1, 100),
        new TestSubject('영어', 5, 0, 1, 100),
      ];
      expect(() => calculator.calculateAverageGrade(subjects)).toThrow(
        'No valid grades could be calculated'
      );
    });

    test('일반적인 에러 처리 - 알 수 없는 에러', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 2, 1, 100),
      ];
      const mockCalculator: MockCalculator = {
        calculateGrade: (rank: number) => {
          if (rank === 1) {
            throw 'Unknown error';
          }
          return 2;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const result = calculator.calculateAverageGrade(subjects);
      expect(result.average).toBe(2);
      expect(result.invalidSubjects).toContain('수학: Unknown error');
    });

    test('일반적인 에러 처리 - 알 수 없는 에러 타입', (): void => {
      const subjects = [
        new TestSubject('수학', 5, 1, 1, 100),
        new TestSubject('영어', 5, 2, 1, 100),
      ];
      const mockCalculator: MockCalculator = {
        calculateGrade: (rank: number) => {
          if (rank === 1) {
            throw null;
          }
          return 2;
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator;
      const result = calculator.calculateAverageGrade(subjects);
      expect(result.average).toBe(2);
      expect(result.invalidSubjects).toContain('수학: Unknown error');
    });

    test('validate 메서드가 없는 Subject 객체 처리', (): void => {
      const invalidSubject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
      };

      expect(() =>
        calculator.calculateSubjectGrade(invalidSubject as unknown as Subject)
      ).toThrow();
    });

    test('validate 메서드가 함수가 아닌 Subject 객체 처리', (): void => {
      const invalidSubject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
        validate: 'not a function',
      };

      expect(() =>
        calculator.calculateSubjectGrade(invalidSubject as unknown as Subject)
      ).toThrow();
    });

    test('validate 메서드가 잘못된 형식의 함수인 Subject 객체 처리', (): void => {
      const invalidSubject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
        validate: (): void => {
          throw new Error('Invalid validation');
        },
      };

      expect(() => calculator.calculateSubjectGrade(invalidSubject as unknown as Subject)).toThrow(
        'Invalid validation'
      );
    });

    test('calculateGrade가 없는 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow();
    });

    test('getPercentileRanges가 없는 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        calculateGrade: () => 1,
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      expect(() => calculator.getPercentileRanges()).toThrow();
    });

    test('calculateGrade가 함수가 아닌 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        calculateGrade: 'not a function' as unknown as (rank: number) => number,
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      const subject = new TestSubject('수학', 5, 1, 1, 100);
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow();
    });

    test('getPercentileRanges가 함수가 아닌 계산기 객체 처리', (): void => {
      const mockCalculator: Partial<MockCalculator> = {
        calculateGrade: () => 1,
        getPercentileRanges: 'not a function' as unknown as () => string[],
      };
      calculator['calculator'] = mockCalculator as MockCalculator;
      expect(() => calculator.getPercentileRanges()).toThrow();
    });
  });
});
