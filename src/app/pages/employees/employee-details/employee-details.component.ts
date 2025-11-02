import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../core/models/employee.model';
import { Gender } from '../../../core/enums/gender.enum';
import { EmployeesStore } from '../../../core/state/employees.store';
import { EmployeesService } from '../../../core/services/employees.service';

export type EmployeeFormValue = Omit<Employee, 'id' | 'evidenceNumber'> &
  Partial<Pick<Employee, 'id' | 'evidenceNumber'>>;

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss',
})
export class EmployeeDetailsComponent {
  private readonly employeesStore = inject(EmployeesStore);
  private readonly employeesService = inject(EmployeesService);
  private readonly fb = inject(FormBuilder);

  private readonly activeEmployee = computed(() =>
    this.employeesStore.activeEmployee()
  );

  readonly saved = output<EmployeeFormValue>();

  readonly employee = input<Employee | null>(null);

  readonly form = this.fb.group({
    id: this.fb.control<number | null>(null, { nonNullable: false }),
    evidenceNumber: this.fb.control<string | null>(null, {
      nonNullable: false,
    }),
    firstName: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ],
      nonNullable: true,
    }),
    lastName: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ],
      nonNullable: true,
    }),
    gender: this.fb.control<Gender>(Gender.Male, {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  readonly genders = Object.values(Gender);

  constructor() {
    effect(() => {
      const employee = this.employee();

      if (employee) {
        this.form.reset({
          id: employee.id,
          evidenceNumber: employee.evidenceNumber,
          firstName: employee.firstName,
          lastName: employee.lastName,
          gender: employee.gender,
        });
      } else {
        this.form.reset({
          id: null,
          evidenceNumber: null,
          firstName: '',
          lastName: '',
          gender: Gender.Male,
        });
      }

      this.form.get('evidenceNumber')?.disable({ emitEvent: false });
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, evidenceNumber, firstName, lastName, gender } =
      this.form.getRawValue();

    this.saveEmployee({
      id: id ?? undefined,
      evidenceNumber: evidenceNumber ?? undefined,
      firstName,
      lastName,
      gender,
    });
  }

  private saveEmployee(formValue: EmployeeFormValue) {
    if (formValue.id) {
      const updatedEmployee = this.buildUpdatedEmployee(formValue);
      if (updatedEmployee) {
        this.employeesStore.updateEmployee(updatedEmployee);
      }
    } else {
      const newEmployee = this.buildNewEmployee(formValue);
      this.employeesStore.addEmployee(newEmployee);
    }

    this.saved.emit(formValue);
  }

  private buildUpdatedEmployee(formValue: EmployeeFormValue): Employee | null {
    if (!formValue.id || !this.activeEmployee()) {
      return null;
    }

    return {
      ...(this.activeEmployee() as Employee),
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      gender: formValue.gender,
    };
  }

  private buildNewEmployee(formValue: EmployeeFormValue): Employee {
    return {
      id: this.getNextEmployeeId(),
      evidenceNumber: this.employeesService.generateEmployeeEvidenceNumber(),
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      gender: formValue.gender,
    };
  }

  private getNextEmployeeId(): number {
    const employees = this.employeesStore.employees();
    if (!employees.length) {
      return 1;
    }

    return Math.max(...employees.map((employee) => employee.id)) + 1;
  }
}
