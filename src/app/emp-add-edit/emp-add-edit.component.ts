import { Component, Injectable, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup,FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { EmployeeService } from '../services/employee.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipEditedEvent, MatChipsModule} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {AsyncPipe} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Inject } from '@angular/core';

interface Fruit {
  name: string;
}

/**
 * @title Chips with input
 */

@Component({
  selector: 'app-emp-add-edit',
  templateUrl: './emp-add-edit.component.html',
  styleUrls: ['./emp-add-edit.component.scss'],
})
@Injectable()
export class EmpAddEditComponent implements OnInit {
  empForm: FormGroup;
  // addOnBlur: boolean = true;
  education: string[] = [
    'Matric',
    'Diploma',
    'Intermediate',
    'Graduate',
    'Post Graduate',
  ];
  terms: any;
  fruits: any[] = [];

  constructor(
    private announcer: LiveAnnouncer,
    @Inject(EmployeeService) private someService: EmployeeService,
    private _fb: FormBuilder,
    private _empService: EmployeeService,
    private _dialogRef: MatDialogRef<EmpAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    this.empForm = this._fb.group({
      file: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],
      gender: ['', [Validators.required,this.noRepeatingDigits(),this.containsConsecutiveZeros()]],
      education: ['',Validators.required],
      company: ['',Validators.required],
      experience: ['', Validators.required],
      package: ['', Validators.required],
      is_terms_policy: [0,this.checkboxRequired()],
    });
  }

  Items = ['pizzz', 'Pasta', 'Maggie']

  getcontrol(name: any): AbstractControl | null {
    return this.empForm.get(name);
  }
  ngOnInit(): void {
    this.empForm.patchValue(this.data);
  }
  /////////////////
  
  //////////////////////
  
  containsConsecutiveZeros(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value as string;
      if (value && /000000/.test(value)) {
        return { containsConsecutiveZeros: true };
      }
      return null;
    };
  }
  noRepeatingDigits(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value as string;
      if (value && value.length === 10) {
        // Check for repeating digits
        const repeatingDigits = /(.)\1{5,}/.test(value);
        if (repeatingDigits) {
          return { repeatingDigits: true };
        }
      }
      return null;
    };
  }

  keyPressNumbers(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  checkboxRequired(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const checked = control.value;
      return checked ? null : { checkboxRequired: 1 };
    };
  }
  checkTerms(evt: any) {
    console.log(evt.target.checked);
    this.terms = evt.target.checked;
}

url="./assets/images/download (1).jpg"
onselectFile(e:any){
  if(e.target.files){
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload=(event:any)=>
    this.url=event.target.result;
  }
}
ValidateAlpha(event: any) {
  var keyCode = (event.which) ? event.which : event.keyCode

  if ((keyCode < 65 || keyCode > 90) && (keyCode < 97 || keyCode > 123) && keyCode != 32)
    return false;
  return true;

}
  onFormSubmit() {
    if (this.empForm.valid) {
      if (this.data) {
        this._empService
          .updateEmployee(this.data.id, this.empForm.value)
          .subscribe({
            next: (val: any) => {
              this._coreService.openSnackBar('Employee detail updated!');
              this._dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this._empService.addEmployee(this.empForm.value).subscribe({
          next: (val: any) => {
            this._coreService.openSnackBar('Employee added successfully');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }
  
////////////////
// fruits: Fruit[] = [{ name: 'Lemon' }, { name: 'Lime' }, { name: 'Apple' }];
  // readonly separatorKeysCodes = [ENTER, COMMA] as const;

  separatorKeysCodes = [ENTER, COMMA];
  addOnBlur = true;

  add(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.fruits.push({ name: value });
    }
    event.chipInput?.clear();
  }

  remove(fruit: any) {
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits.splice(index, 1);
      this.announcer.announce(`Removed ${fruit.name}`);
    }
  }

  edit(fruit: any, event: any)  {
    const value = event.chip.value.trim();
    if (!value) {
      this.remove(fruit);
      return;
    }
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits[index].name = value;
    }
  }

  ///////////////////
}
