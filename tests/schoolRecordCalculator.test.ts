import { SchoolRecordCalculator, BaseGradeCalculator } from '../src/schoolRecordCalculator';

describe('SchoolRecordCalculator', () => {
  describe('9등급 계산기', () => {
    let calculator: SchoolRecordCalculator;

    beforeEach(() => {
      calculator = new SchoolRecordCalculator('9');
    });

    test('정상적인 입력에 대한 등급 계산', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('동석차가 있는 경우의 등급 계산', () => {
      const subject = {
        name: '영어',
        unit: 5,
        rank: 1,
        sameRank: 3,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('평균 등급 계산', () => {
      const subjects = [
        {
          name: '수학',
          unit: 5,
          rank: 1,
          sameRank: 1,
          completer: 100,
        },
        {
          name: '영어',
          unit: 5,
          rank: 10,
          sameRank: 1,
          completer: 100,
        },
      ];
      expect(calculator.calculateAverageGrade(subjects)).toBe(1.5);
    });

    test('잘못된 입력에 대한 에러 처리', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 0,
        sameRank: 1,
        completer: 100,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('석차는 0보다 커야 합니다.');
    });

    test('동석차가 수강자 수를 초과하는 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 101,
        completer: 100,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 남은 수강자 수보다 클 수 없습니다.'
      );
    });

    test('수강자 수가 0 이하인 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 0,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '수강자 수는 0보다 커야 합니다.'
      );
    });

    test('동석차가 0 이하인 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 0,
        completer: 100,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 0보다 커야 합니다.'
      );
    });

    test('석차가 수강자 수보다 큰 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 101,
        sameRank: 1,
        completer: 100,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '석차는 수강자 수보다 클 수 없습니다.'
      );
    });

    test('마지막 등급(9등급) 계산', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 97,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(9);
    });

    test('일반적인 에러 처리', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
      };
      const mockCalculator = {
        calculateGrade: () => {
          throw new Error('일반적인 에러');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as any;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('일반적인 에러');
    });

    test('마지막 등급 계산 - 정확히 89% 지점', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 89,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(7);
    });

    test('마지막 등급 계산 - 정확히 96% 지점', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 96,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(8);
    });

    test('일반적인 에러 처리 - 평균 등급 계산', () => {
      const subjects = [
        {
          name: '수학',
          unit: 5,
          rank: 1,
          sameRank: 1,
          completer: 100,
        },
      ];
      const mockCalculator = {
        calculateGrade: () => {
          throw new Error('일반적인 에러');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as any;
      expect(() => calculator.calculateAverageGrade(subjects)).toThrow('일반적인 에러');
    });

    test('백분율이 모든 범위를 초과하는 경우', () => {
      class TestCalculator extends BaseGradeCalculator {
        protected readonly ranges = [
          { maxPercent: 50, grade: 1 },
        ];
        protected readonly percentileRanges = ['테스트'];
      }

      const testCalculator = new TestCalculator();
      const percent = 100;
      expect(testCalculator['getGradeFromPercent'](percent)).toBe(1);
    });
  });

  describe('5등급 계산기', () => {
    let calculator: SchoolRecordCalculator;

    beforeEach(() => {
      calculator = new SchoolRecordCalculator('5');
    });

    test('정상적인 입력에 대한 등급 계산', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('동석차가 있는 경우의 등급 계산', () => {
      const subject = {
        name: '영어',
        unit: 5,
        rank: 1,
        sameRank: 3,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(1);
    });

    test('평균 등급 계산', () => {
      const subjects = [
        {
          name: '수학',
          unit: 5,
          rank: 1,
          sameRank: 1,
          completer: 100,
        },
        {
          name: '영어',
          unit: 5,
          rank: 20,
          sameRank: 1,
          completer: 100,
        },
      ];
      expect(calculator.calculateAverageGrade(subjects)).toBe(1.5);
    });

    test('빈 과목 배열에 대한 에러 처리', () => {
      expect(() => calculator.calculateAverageGrade([])).toThrow('과목 정보가 없습니다.');
    });

    test('모든 과목이 유효하지 않은 경우', () => {
      const subjects = [
        {
          name: '수학',
          unit: 5,
          rank: 0,
          sameRank: 1,
          completer: 100,
        },
        {
          name: '영어',
          unit: 5,
          rank: 0,
          sameRank: 1,
          completer: 100,
        },
      ];
      expect(() => calculator.calculateAverageGrade(subjects)).toThrow(
        '유효한 등급을 계산할 수 있는 과목이 없습니다.'
      );
    });

    test('수강자 수가 0 이하인 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 0,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '수강자 수는 0보다 커야 합니다.'
      );
    });

    test('동석차가 0 이하인 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 0,
        completer: 100,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '동석차는 0보다 커야 합니다.'
      );
    });

    test('석차가 수강자 수보다 큰 경우', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 101,
        sameRank: 1,
        completer: 100,
      };
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow(
        '석차는 수강자 수보다 클 수 없습니다.'
      );
    });

    test('마지막 등급(5등급) 계산', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 91,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(5);
    });

    test('getPercentileRanges 메서드 테스트', () => {
      const ranges = calculator.getPercentileRanges();
      expect(ranges).toEqual([
        '상위 10%이내', // 1등급
        '10%~34%구간', // 2등급
        '34%~66%구간', // 3등급
        '66%~90%구간', // 4등급
        '90%~100%구간', // 5등급
      ]);
    });

    test('일반적인 에러 처리', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 1,
        sameRank: 1,
        completer: 100,
      };
      const mockCalculator = {
        calculateGrade: () => {
          throw new Error('일반적인 에러');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as any;
      expect(() => calculator.calculateSubjectGrade(subject)).toThrow('일반적인 에러');
    });

    test('일반적인 에러 처리 - 평균 등급 계산', () => {
      const subjects = [
        {
          name: '수학',
          unit: 5,
          rank: 1,
          sameRank: 1,
          completer: 100,
        },
      ];
      const mockCalculator = {
        calculateGrade: () => {
          throw new Error('일반적인 에러');
        },
        getPercentileRanges: () => [],
      };
      calculator['calculator'] = mockCalculator as any;
      expect(() => calculator.calculateAverageGrade(subjects)).toThrow('일반적인 에러');
    });

    test('마지막 등급 계산 - 정확히 90% 지점', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 90,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(4);
    });

    test('마지막 등급 계산 - 정확히 100% 지점', () => {
      const subject = {
        name: '수학',
        unit: 5,
        rank: 100,
        sameRank: 1,
        completer: 100,
      };
      expect(calculator.calculateSubjectGrade(subject)).toBe(5);
    });
  });
});
