import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EmployeesComponent } from './pages/employees/employees.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'employees',
    component: EmployeesComponent,
  },
  {
    path: 'employees/new',
    component: EmployeesComponent,
  },
  {
    path: 'employees/:employeeId',
    component: EmployeesComponent,
  },
];
