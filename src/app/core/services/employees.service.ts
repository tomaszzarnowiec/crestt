import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  generateEmployeeEvidenceNumber(): string {
    const sequence = Date.now() % 100_000;
    return sequence.toString().padStart(8, '0');
  }
}
