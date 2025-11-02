import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Employee } from '../models/employee.model';
import { Gender } from '../enums/gender.enum';

const MOCKED_EMPLOYEES: Employee[] = [
  {
    id: 1,
    evidenceNumber: '00000001',
    firstName: 'Jan',
    lastName: 'Kowalski',
    gender: Gender.Male,
  },
  {
    id: 2,
    evidenceNumber: '00000002',
    firstName: 'Anna',
    lastName: 'Nowak',
    gender: Gender.Female,
  },
  {
    id: 3,
    evidenceNumber: '00000003',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    gender: Gender.Male,
  },
  {
    id: 4,
    evidenceNumber: '00000004',
    firstName: 'Katarzyna',
    lastName: 'Wójcik',
    gender: Gender.Female,
  },
  {
    id: 5,
    evidenceNumber: '00000005',
    firstName: 'Tomasz',
    lastName: 'Żarnowiec',
    gender: Gender.Male,
  },
];

export const EmployeesStore = signalStore(
  withState({
    employees: MOCKED_EMPLOYEES as Employee[],
    sorting: null as {
      field: keyof Employee;
      direction: 'asc' | 'desc';
    } | null,
    activeEmployee: null as Employee | null,
  }),
  withMethods((store) => ({
    addEmployee: (employee: Employee) => {
      console.log('add employee', employee);
      patchState(store, { employees: [...store.employees(), employee] });
    },
    removeEmployee: (employeeId: number) => {
      patchState(store, {
        employees: store.employees().filter((w) => w.id !== employeeId),
      });
    },
    updateEmployee: (employee: Employee) => {
      console.log('update store');

      patchState(store, {
        employees: store
          .employees()
          .map((emp) => (emp.id === employee.id ? employee : emp)),
      });
    },
    setActiveEmployee: (employee: Employee | null) => {
      patchState(store, { activeEmployee: employee });
    },
    setSorting: (field: keyof Employee, direction: 'asc' | 'desc') => {
      patchState(store, { sorting: { field, direction } });
    },
  }))
);
