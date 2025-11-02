import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(() => {
    service = new EmployeesService();
  });

  it('should pad generated numbers to 8 characters with leading zeros', () => {
    spyOn(Date, 'now').and.returnValue(1_234);

    const result = service.generateEmployeeEvidenceNumber();

    expect(result.length).toBe(8);
    expect(result).toMatch(/^\d{8}$/);
  });

  it('should wrap around modulo 100000 to ensure only last 5 digits are used', () => {
    spyOn(Date, 'now').and.returnValues(100_000, 100_001);

    const first = service.generateEmployeeEvidenceNumber();
    const second = service.generateEmployeeEvidenceNumber();

    expect(first).toBe('00000000');
    expect(second).toBe('00000001');
  });

  it('should produce different values for different timestamps', () => {
    const times = [10, 20, 30, 40, 50].map((offset) => 1700000000000 + offset);
    spyOn(Date, 'now').and.returnValues(...times);

    const numbers = times.map(() => service.generateEmployeeEvidenceNumber());

    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
