import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesComponent } from './employees.component';
import { EmployeesStore } from '../../core/state/employees.store';
import { Employee } from '../../core/models/employee.model';
import { Gender } from '../../core/enums/gender.enum';

const MOCK_EMPLOYEES: Employee[] = [
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

describe('EmployeesComponent', () => {
  let component: EmployeesComponent;
  let fixture: ComponentFixture<EmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesComponent],
      providers: [EmployeesStore],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose "Dodaj pracownika" title when no employee is selected', () => {
    expect(component.selectedEmployee()).toBeNull();
    expect(component.modalConfig().title).toBe('Dodaj pracownika');
  });

  it('should open modal for adding a new employee', () => {
    component.openEmployeeDetails();

    expect(component.modalOpen()).toBeTrue();
    expect(component.employeesStore.activeEmployee()).toBeNull();
  });

  it('should open modal for editing an existing employee and switch title', () => {
    const employee = component.employeesStore.employees()[0];

    component.openEmployeeDetails(employee);

    expect(component.modalOpen()).toBeTrue();
    expect(component.employeesStore.activeEmployee()).toEqual(employee);
    expect(component.modalConfig().title).toBe('Edytuj pracownika');
  });

  it('should close modal and reset active employee', () => {
    const employee = component.employeesStore.employees()[0];
    component.openEmployeeDetails(employee);

    component.closeEmployeeDetails();

    expect(component.modalOpen()).toBeFalse();
    expect(component.employeesStore.activeEmployee()).toBeNull();
  });

  it('should remove employee by id', () => {
    const [firstEmployee] = component.employeesStore.employees();
    const initialCount = component.employeesStore.employees().length;

    component.deleteEmployee(firstEmployee.id);

    expect(component.employeesStore.employees().length).toBe(initialCount - 1);
    expect(
      component.employeesStore
        .employees()
        .some((employee) => employee.id === firstEmployee.id)
    ).toBeFalse();
  });

  it('should sort employees by first name and toggle direction', () => {
    expect(component.sortedEmployees()).toEqual(
      component.employeesStore.employees()
    );

    component.sortBy('firstName');
    expect(component.sortedEmployees()[0].firstName).toBe('Anna');

    component.sortBy('firstName');
    expect(component.sortedEmployees()[0].firstName).toBe('Tomasz');
  });

  it('should reset sort direction when sorting by a different column', () => {
    component.sortBy('firstName');
    component.sortBy('firstName'); // descending

    component.sortBy('lastName');

    expect(component.sortIcon('lastName')).toBe('fa-sort-up');
    expect(component.sortIcon('firstName')).toBe('fa-sort');
  });

  it('should expose proper icon for sort direction', () => {
    expect(component.sortIcon('firstName')).toBe('fa-sort');

    component.sortBy('firstName');
    expect(component.sortIcon('firstName')).toBe('fa-sort-up');

    component.sortBy('firstName');
    expect(component.sortIcon('firstName')).toBe('fa-sort-down');
  });

  it('should return sorted employees array identical to expected order when sorting by first name', () => {
    const expected = [...MOCK_EMPLOYEES].sort((a, b) =>
      a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' })
    );

    component.sortBy('firstName');

    expect(component.sortedEmployees()).toEqual(expected);
  });
});
