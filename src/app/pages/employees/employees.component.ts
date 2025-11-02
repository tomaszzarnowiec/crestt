import { CommonModule, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { EmployeesStore } from '../../core/state/employees.store';
import { Employee } from '../../core/models/employee.model';
import {
  ModalComponent,
  ModalConfig,
} from '../../shared/components/modal/modal.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';

const enum ModalTitles {
  AddEmployee = 'Dodaj pracownika',
  EditEmployee = 'Edytuj pracownika',
}

type SortField = 'id' | 'evidenceNumber' | 'firstName' | 'lastName' | 'gender';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, NgClass, ModalComponent, EmployeeDetailsComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
  providers: [EmployeesStore],
})
export class EmployeesComponent {
  readonly employeesStore = inject(EmployeesStore);
  readonly modalOpen = signal(false);

  private readonly sortState = computed<{
    field: SortField;
    direction: SortDirection;
  } | null>(() => this.employeesStore.sorting());

  readonly selectedEmployee = computed(() =>
    this.employeesStore.activeEmployee()
  );

  readonly sortedEmployees = computed(() => {
    const employees = this.employeesStore.employees();
    const sort = this.sortState();

    if (!sort) {
      return employees;
    }

    const sorted = [...employees].sort((a, b) => {
      const valueA = a[sort.field];
      const valueB = b[sort.field];

      if (valueA == null || valueB == null) {
        return 0;
      }

      const compare =
        typeof valueA === 'string' && typeof valueB === 'string'
          ? valueA.localeCompare(valueB, undefined, { sensitivity: 'base' })
          : Number(valueA) - Number(valueB);

      return sort.direction === 'asc' ? compare : -compare;
    });

    return sorted;
  });

  readonly modalConfig = computed<ModalConfig>(() => ({
    title: this.selectedEmployee()
      ? ModalTitles.EditEmployee
      : ModalTitles.AddEmployee,
    actions: {
      onClose: () => this.closeEmployeeDetails(),
      onSave: () => this.closeEmployeeDetails(),
    },
  }));

  openEmployeeDetails(employee?: Employee) {
    this.employeesStore.setActiveEmployee(employee ?? null);
    this.modalOpen.set(true);
  }

  closeEmployeeDetails() {
    this.modalOpen.set(false);
    this.employeesStore.setActiveEmployee(null);
  }

  deleteEmployee(employeeId: number) {
    this.employeesStore.removeEmployee(employeeId);
  }

  sortBy(field: SortField) {
    this.employeesStore.setSorting(
      field,
      this.sortState()?.direction === 'asc' ? 'desc' : 'asc'
    );
  }

  sortIcon(field: SortField): string {
    const current = this.sortState();

    if (!current || current.field !== field) {
      return 'fa-sort';
    }

    return current.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
