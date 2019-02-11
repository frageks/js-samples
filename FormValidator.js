export default class FormValidator {
  constructor (componentContext, errorData, lists = {}) {
    this.component = componentContext;
    this.lists = lists;
    this.errorData = errorData;
  }

  check () {
    for (const field in this.component.$data) {
      if (this.component.$data.hasOwnProperty(field)) {
        this._checkField(field);
      }
    }
  }

  _checkField (field) {
    const fieldErrors = this.errorData[field];
    if (typeof fieldErrors === 'undefined') {
      return false;
    }
    const errors = Object.keys(this.errorData[field]);
    errors.forEach(error => {
      this[error](field);
    });
  }

  _getOptions (input) {
    if (this.lists[input]) {
      return this.lists[input];
    }
    return [];
  }

  isIn (input) {
    const inputOptions = this._getOptions(input);
    if (inputOptions.length > 0) {
      this.component.$data.errors[input].isIn.value = !inputOptions.includes(this.component.$data[input]);
    }
  }
  notEmpty (input) {
    this.component.$data.errors[input].notEmpty.value = typeof this.component.$data[input] === 'undefined' || this.component.$data[input].length === 0;
  }
  max (input) {
    let maxValue = 0;
    switch (input) {
      case 'enterpriseTitle':
        maxValue = 100;
        break;
      case 'name':
      case 'surname':
        maxValue = 20;
        break;
      case 'phoneNumber':
        maxValue = 17;
        break;
      default:
        return null;
    }
    this.component.$data.errors[input].max.value = this.component.$data[input].length > maxValue;
  }
  minPassword (input) {
    this.component.$data.errors[input].minPassword.value = this.component.$data[input].trim().length < 7;
  }
  min (input) {
    this.component.$data.errors[input].min.value = this.component.$data[input].trim().length < 2;
  }
  compare (input) {
    const passwordValue = this.component.$data.password;
    const passwordRepeatValue = this.component.$data.passwordRepeat;
    if (passwordValue !== passwordRepeatValue) {
      this.component.$data.errors.password.compare.value = true;
      this.component.$data.errors.passwordRepeat.compare.value = true;
    }
  }
  hasRestrictedSymbols (input) {
    const restrictedSymbols = '~!@#$%&*()`[]|:\\;=,';
    for (let i = 0; i < this.component.$data[input].length; i++) {
      if (restrictedSymbols.includes(this.component.$data[input][i])) {
        this.component.$data.errors[input].hasRestrictedSymbols.value = true;
        return null;
      }
    }
    return null;
  }
  isUnique (input) {}
  isInclude (input) {
    const str = this.component.$data[input];
    this.component.$data.errors[input].isInclude.value = !(/[a-z]/.test(str)) || !(/[A-Z]/.test(str)) || !(/[0-9]/.test(str));
  }
  unchecked (input) {
    this.component.$data.errors[input].unchecked.value = !this.component.$data[input];
  }
  typoInEmail (input) {} // do not clear
  wrongType (input) {
    let file = this.component.$data[input];
    if (file && Array.isArray(file.files) && file.files.length > 0) {
      let requiredType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      this.component.$data.errors[input].wrongType.value = file.files[0].type !== requiredType;
    }
  }
  tooBigFile (input) {
    let file = this.component.$data[input];
    if (file && Array.isArray(file.files) && file.files.length > 0) {
      let maxFileSizeInMB = 5;
      this.component.$data.errors[input].tooBigFile.value = Number(file.files[0].size) / 1024 / 1024 > maxFileSizeInMB;
    }
  }
  incorrectFormat (input) {
    this.component.$data.errors[input].incorrectFormat.value = !this.component.$data.isCorrectPhoneNumber;
  }
}

// Example of using:

// In mounted hook:
// validator = new FormValidator(this, GOAL_FORM_ERRORS, lists);

// Form submitting:
// validator.check();

// GOAL_FORM_ERRORS example:
//   goal_name: {
//    notEmpty: {
//      title: 'Required',
//      placeholder: 'This field is required.',
//      value: false
//    },
//    max: {
//      title: 'Too many characters',
//      placeholder: 'Title must include no more than 100 symbols.',
//      value: false
//    },
//    min: {
//      title: 'Not enough characters',
//      placeholder: 'Your title must include at least 3 symbols.',
//      value: false
//    },
//    hasRestrictedSymbols: {
//      title: 'Restricted symbols',
//      placeholder: 'Title must not include next symbols: ~!@#$%&*()',
//      value: false
//    }
//  },
