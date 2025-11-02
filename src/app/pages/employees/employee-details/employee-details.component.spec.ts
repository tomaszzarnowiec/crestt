import { ComponentFixture, TestBed } from '@angular/core/testing';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { EmployeeDetailsComponent } from './employee-details.component';
import { EmployeesStore } from '../../../core/state/employees.store';
import { EmployeesService } from '../../../core/services/employees.service';
import { Employee } from '../../../core/models/employee.model';
import { Gender } from '../../../core/enums/gender.enum';

type EmployeesStoreClass = typeof EmployeesStore;
type EmployeesStoreInstance = InstanceType<EmployeesStoreClass>;

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
];

class EmployeesServiceStub {
  readonly generateEmployeeEvidenceNumber = jasmine
    .createSpy('generateEmployeeEvidenceNumber')
    .and.returnValue('00000006');
}

const createMockEmployeesStoreClass = (
  initialEmployees: Employee[] = MOCK_EMPLOYEES
) => {
  const spies = {
    addEmployee: jasmine.createSpy('addEmployee'),
    updateEmployee: jasmine.createSpy('updateEmployee'),
    setActiveEmployee: jasmine.createSpy('setActiveEmployee'),
    removeEmployee: jasmine.createSpy('removeEmployee'),
    setSorting: jasmine.createSpy('setSorting'),
  };

  const Store = signalStore(
    withState({
      employees: [...initialEmployees] as Employee[],
      sorting: null as {
        field: keyof Employee;
        direction: 'asc' | 'desc';
      } | null,
      activeEmployee: null as Employee | null,
    }),
    withMethods((state) => {
      const addImpl = (employee: Employee) => {
        patchState(state, { employees: [...state.employees(), employee] });
      };
      const updateImpl = (employee: Employee) => {
        patchState(state, {
          employees: state
            .employees()
            .map((item) => (item.id === employee.id ? employee : item)),
        });
      };
      const setActiveImpl = (employee: Employee | null) => {
        patchState(state, { activeEmployee: employee });
      };
      const removeImpl = (employeeId: number) => {
        patchState(state, {
          employees: state.employees().filter((emp) => emp.id !== employeeId),
        });
      };
      const setSortingImpl = (
        field: keyof Employee,
        direction: 'asc' | 'desc'
      ) => {
        patchState(state, { sorting: { field, direction } });
      };

      spies.addEmployee.and.callFake(addImpl);
      spies.updateEmployee.and.callFake(updateImpl);
      spies.setActiveEmployee.and.callFake(setActiveImpl);
      spies.removeEmployee.and.callFake(removeImpl);
      spies.setSorting.and.callFake(setSortingImpl);

      return {
        addEmployee: spies.addEmployee,
        updateEmployee: spies.updateEmployee,
        setActiveEmployee: spies.setActiveEmployee,
        removeEmployee: spies.removeEmployee,
        setSorting: spies.setSorting,
      };
    })
  );

  return { Store, spies };
};

describe('EmployeeDetailsComponent', () => {
  let component: EmployeeDetailsComponent;
  let fixture: ComponentFixture<EmployeeDetailsComponent>;
  let employeesStore: EmployeesStoreInstance;
  let employeesStoreClass: EmployeesStoreClass;
  let employeesService: EmployeesServiceStub;
  let storeSpies: ReturnType<typeof createMockEmployeesStoreClass>['spies'];
  const setEmployeeInput = (value: Employee | null) =>
    fixture.componentRef.setInput('employee', value);

  beforeEach(async () => {
    const setup = createMockEmployeesStoreClass();
    employeesStoreClass = setup.Store as EmployeesStoreClass;
    storeSpies = setup.spies;
    employeesService = new EmployeesServiceStub();

    await TestBed.configureTestingModule({
      imports: [EmployeeDetailsComponent],
      providers: [
        { provide: EmployeesStore, useClass: employeesStoreClass },
        { provide: EmployeesService, useValue: employeesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailsComponent);
    component = fixture.componentInstance;
    employeesStore = TestBed.inject(EmployeesStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate form when employee input changes', () => {
    const employee = MOCK_EMPLOYEES[0];

    employeesStore.setActiveEmployee(employee);
    setEmployeeInput(employee);
    fixture.detectChanges();

    expect(component.form.get('firstName')?.value).toBe(employee.firstName);
    expect(component.form.get('lastName')?.value).toBe(employee.lastName);
    expect(component.form.get('evidenceNumber')?.disabled).toBeTrue();
  });

  it('should update existing employee on submit', () => {
    const employee = { ...MOCK_EMPLOYEES[0] };
    const savedSpy = jasmine.createSpy('saved');
    component.saved.subscribe(savedSpy);

    employeesStore.setActiveEmployee(employee);
    setEmployeeInput(employee);
    fixture.detectChanges();

    component.form.get('lastName')?.setValue('Nowakowski');

    component.submit();

    expect(storeSpies.updateEmployee).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: employee.id, lastName: 'Nowakowski' })
    );
    expect(savedSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: employee.id, lastName: 'Nowakowski' })
    );
  });

  it('should create new employee with generated evidence number when no id is provided', () => {
    const savedSpy = jasmine.createSpy('saved');
    component.saved.subscribe(savedSpy);

    const newEmployee = {
      firstName: 'Adam',
      lastName: 'Zając',
      gender: Gender.Male,
    } as const;

    setEmployeeInput(null);
    fixture.detectChanges();

    component.form.patchValue(newEmployee);

    component.submit();

    expect(employeesService.generateEmployeeEvidenceNumber).toHaveBeenCalled();
    expect(storeSpies.addEmployee).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: jasmine.any(Number),
        evidenceNumber: '00000006',
        ...newEmployee,
      })
    );
    expect(savedSpy).toHaveBeenCalledWith(
      jasmine.objectContaining(newEmployee)
    );
  });

  it('should mark form as touched and not submit when invalid', () => {
    setEmployeeInput(null);
    fixture.detectChanges();

    component.form.reset({
      id: null,
      evidenceNumber: null,
      firstName: '',
      lastName: '',
      gender: Gender.Male,
    });

    component.submit();

    expect(component.form.invalid).toBeTrue();
    expect(storeSpies.addEmployee).not.toHaveBeenCalled();
    expect(storeSpies.updateEmployee).not.toHaveBeenCalled();
  });
});
