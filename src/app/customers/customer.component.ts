import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder,FormArray, Validators, AbstractControl, ValidatorFn} from '@angular/forms'
import { Customer } from './customer';
import { debounceTime } from 'rxjs/operators'



//cross field validation performed on a formGroup
function emailMatcher(c: AbstractControl): {[key: string]: boolean} | null {
  const emailControl = c.get('email');
  const confirmEmailControl = c.get('confirmEmail');

  if(emailControl.pristine || confirmEmailControl.pristine){
    return null;
  }

  if(emailControl.value === confirmEmailControl.value){

    return null;
  }
  
  return {'match':true};
}
//Validator function can only take one parameter
//so we create a "Factory Function" that returns a validators function
function ratingRange( min: number, max: number): ValidatorFn {

  return (c: AbstractControl) : {[key : string]: boolean} | null  => {
  
    if(c.value !== null && (isNaN(c.value) || c.value < min || c.value > max) ){
  
      //if it is invalid return control name and true to be listed in invalid 
      return {'range': true}
    }
    //if it is valid
   return null;
  }
}


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customer = new Customer();
  customerForm: FormGroup;
  emailMessage: string;
  // emailGroup: FormGroup;

  checked:boolean = true;

  get addresses():FormArray{
    return <FormArray> this.customerForm.get('addresses');
  }

  addAddress():void{
    this.addresses.push(this.buildAdresses());
  }

  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };
  constructor(private fb:FormBuilder) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName:['', [Validators.required , Validators.minLength(3)]],
      lastName:['', [Validators.required , Validators.maxLength(50)]],

      checkBox: false,
      //checkBox2: this.isChecked('sara'),
      emailGroup : this.fb.group({
      email:['', [Validators.email , Validators.required]],

      confirmEmail:['',[Validators.required]],

    }, { validator: emailMatcher } ),
      sandCatalog: true,
      phone:[''],
      notification:['email'],
      rating: ['', ratingRange(1,5)],
      addresses: this.fb.array([ this.buildAdresses( ) ])
    });
    // this.customerForm = new FormGroup({
    //   firstName: new FormControl(),      
    //   lastName: new FormControl(),
    //   email: new FormControl(),
    //   sandCatalog: new FormControl(true),
    // });

    this.customerForm.get('notification').valueChanges.subscribe( value => {
      this.setNotification(value);
    });

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => console.log(value)
    );
 
    // const emailControl = this.customerForm.get('emailGroup.email');

    // emailControl.valueChanges.pipe(
    //   debounceTime(2000)
    // ).subscribe( () => {this.setMessage(emailControl)});



  }

  setNotification(option:string):void {
    //access form control 
    //if customer choose test tobe notified with [phone becomes mandatory] else it remains optional
    const phoneControl = this.customerForm.get('phone');
    if(option === 'text'){
    phoneControl.setValidators(Validators.required);
    }else{
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();

  }

  buildAdresses():FormGroup{
    return this.fb.group({
      addressType:'',
      street1:'',
      street2:'',
      city:'',
      state:'',
      zip:''
    })
  }
  save() {
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
  }


  populateTestData():void{
    this.customerForm.patchValue({
      firstName:'Sara',
      lastName:'Sherif',
      sandCatalog:false
    });

  }




// array of values coming from api
// values as checkboxes form controls
// [checked] ="condition" in template driven form
// in reactive form bind the value from backend result check boxes
array:any = ['sara','lalo','kareem'];

isChecked(value:string):boolean{

  // if(){
  //   this.checked = true;
  // }
  return this.array.indexOf(value) > -1
  //  this.checked;
}

}
