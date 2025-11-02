import { Gender } from '../enums/gender.enum';

export interface Employee {
  id: number;
  evidenceNumber: string;
  firstName: string;
  lastName: string;
  gender: Gender;
}
