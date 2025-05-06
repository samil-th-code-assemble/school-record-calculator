# School Record Calculator

학교 성적 등급 계산을 위한 TypeScript 라이브러리입니다.

## 설치

```bash
npm install school-record-calculator
```

## 사용법

### 기본 사용법

```typescript
import { SchoolRecordCalculator } from 'school-record-calculator';

// 9등급 계산기 생성
const calculator = new SchoolRecordCalculator('9');

// 과목 정보 정의
const subject = {
  name: '수학',
  unit: 5,        // 단위 수
  rank: 10,       // 석차
  sameRank: 2,    // 동석차
  completer: 100  // 이수자 수
};

// 과목 등급 계산
const grade = calculator.calculateSubjectGrade(subject);
console.log(grade); // 예: 2

// 여러 과목의 평균 등급 계산
const subjects = [
  {
    name: '수학',
    unit: 5,
    rank: 10,
    sameRank: 2,
    completer: 100
  },
  {
    name: '영어',
    unit: 5,
    rank: 15,
    sameRank: 1,
    completer: 100
  }
];

const averageGrade = calculator.calculateAverageGrade(subjects);
console.log(averageGrade); // 예: { average: 2.5, invalidSubjects: [] }

// 등급 구간 확인
const percentileRanges = calculator.getPercentileRanges();
console.log(percentileRanges);
// 9등급의 경우:
// [
//   '상위 4%이내',    // 1등급
//   '4%~11%구간',    // 2등급
//   '11%~23%구간',   // 3등급
//   '23%~40%구간',   // 4등급
//   '40%~60%구간',   // 5등급
//   '60%~77%구간',   // 6등급
//   '77%~89%구간',   // 7등급
//   '89%~96%구간',   // 8등급
//   '96%~100%구간'   // 9등급
// ]
```

### 5등급 계산기 사용

```typescript
// 5등급 계산기 생성
const calculator5 = new SchoolRecordCalculator('5');

// 과목 등급 계산
const grade5 = calculator5.calculateSubjectGrade(subject);
console.log(grade5); // 예: 2

// 등급 구간 확인
const percentileRanges5 = calculator5.getPercentileRanges();
console.log(percentileRanges5);
// [
//   '상위 10%이내',   // 1등급
//   '10%~34%구간',   // 2등급
//   '34%~66%구간',   // 3등급
//   '66%~90%구간',   // 4등급
//   '90%~100%구간'   // 5등급
// ]
```

## 인터페이스

### Subject 인터페이스

```typescript
interface Subject {
  name: string;    // 과목명
  unit: number;    // 단위 수
  rank: number;    // 석차
  sameRank: number; // 동석차
  completer: number; // 이수자 수
}

interface AverageGradeResult {
  average: number;           // 평균 등급
  invalidSubjects: string[]; // 유효하지 않은 과목 목록
}
```

## 주의사항

1. `rank`는 1부터 시작하는 석차입니다.
2. `sameRank`는 동석차 인원 수입니다.
3. `completer`는 0보다 큰 값이어야 합니다.
4. `rank`는 `completer`보다 클 수 없습니다.
5. 유효하지 않은 입력의 경우 '-'가 반환됩니다.

## 라이선스

MIT