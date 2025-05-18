export const validateLogin = (form, handleSubmit, data) => {
  const validate = new window.JustValidate(form);

  const { cc, password } = data;

  validate
    .addField(cc, [
      {
        rule: 'integer',
        errorMessage: 'El campo tiene que ser numérico',
      },
      {
        rule: 'required',
        errorMessage: 'Requerido',
      },
      {
        rule: 'minLength',
        value: 8,
        errorMessage: 'Mínimo 8 caracteres',
      },
      {
        rule: 'maxLength',
        value: 10,
        errorMessage: 'Máximo 10 caracteres',
      },
    ])
    .addField(password, [
      {
        rule: 'required',
        errorMessage: 'Requerido',
      },
      {
        rule: 'minLength',
        value: 6,
        errorMessage: 'Mínimo 6 caracteres',
      },
      {
        rule: 'maxLength',
        value: 15,
        errorMessage: 'Máximo 15 caracteres',
      },
    ])
    .onSuccess(() => {
      handleSubmit();
    });
};

export const validateTransfer = (form, handleSubmit, data) => {
  const validate = new window.JustValidate(form);

  const { fromAccount, toAccount, amount } = data;

  validate
    .addField(fromAccount, [
      // {
      //   rule: 'integer',
      //   errorMessage: 'El campo tiene que ser numérico',
      // },
      {
        rule: 'required',
        errorMessage: 'Requerido',
      },
      {
        rule: 'minLength',
        value: 16,
        errorMessage: 'Mínimo 16 caracteres',
      },
      {
        rule: 'maxLength',
        value: 16,
        errorMessage: 'Máximo 16 caracteres',
      },
    ])
    .addField(toAccount, [
      {
        rule: 'integer',
        errorMessage: 'El campo tiene que ser numérico',
      },
      {
        rule: 'required',
        errorMessage: 'Requerido',
      },
      {
        rule: 'minLength',
        value: 16,
        errorMessage: 'Mínimo 16 digitos',
      },
      {
        rule: 'maxLength',
        value: 16,
        errorMessage: 'Máximo 16 digitos',
      },
    ])
    .addField(amount, [
      {
        rule: 'integer',
        errorMessage: 'El campo tiene que ser numérico',
      },
      {
        rule: 'required',
        errorMessage: 'Requerido',
      },
      {
        rule: 'minNumber',
        value: 500,
        errorMessage: 'La transferencia mínima es de 500',
      },
      {
        rule: 'maxNumber',
        value: 2000000,
        errorMessage: 'La transferencia no puede superar los 2,000,000',
      },
    ])
    .onSuccess(() => {
      handleSubmit();
    });
};

export const validateRegister = (validate, data, stepNumber) => {
  const {
    cc,
    first_name,
    last_name,
    birth_date,
    email,
    phone_number,
    department,
    city,
    address,
    password,
    password_confirmation,
  } = data;

  switch (stepNumber) {
    case 1:
      validate
        .addField(cc, [
          { rule: 'integer', errorMessage: 'El campo tiene que ser numérico' },
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'minLength', value: 8, errorMessage: 'Mínimo 8 caracteres' },
          {
            rule: 'maxLength',
            value: 10,
            errorMessage: 'Máximo 10 caracteres',
          },
        ])
        .addField(first_name, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'customRegexp', value: /^[^\d]+$/, errorMessage: 'Inválido' },
          { rule: 'minLength', value: 3, errorMessage: 'Mínimo 3 caracteres' },
          {
            rule: 'maxLength',
            value: 50,
            errorMessage: 'Máximo 50 caracteres',
          },
        ])
        .addField(last_name, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'customRegexp', value: /^[^\d]+$/, errorMessage: 'Inválido' },
          { rule: 'minLength', value: 5, errorMessage: 'Mínimo 5 caracteres' },
          {
            rule: 'maxLength',
            value: 50,
            errorMessage: 'Máximo 50 caracteres',
          },
        ])
        .addField(birth_date, [
          { rule: 'required', errorMessage: 'Requerido' },
          {
            rule: 'custom',
            validator: (value) => {
              const birthDate = new Date(value);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              const dayDiff = today.getDate() - birthDate.getDate();
              return !(
                age < 18 ||
                (age === 18 &&
                  (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
              );
            },
            errorMessage: 'Debes ser mayor de 18 años',
          },
        ]);
      break;
    case 2:
      validate
        .addField(email, [
          { rule: 'email' },
          { rule: 'required', errorMessage: 'Requerido' },
        ])
        .addField(phone_number, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'customRegexp', value: /^[0-9]+$/, errorMessage: 'Inválido' },
          {
            rule: 'minLength',
            value: 10,
            errorMessage: 'Tiene que tener 10 números',
          },
          {
            rule: 'maxLength',
            value: 10,
            errorMessage: 'Tiene que tener 10 números',
          },
        ]);
      break;
    case 3:
      validate
        .addField(department, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'customRegexp', value: /^[^\d]+$/, errorMessage: 'Inválido' },
          { rule: 'minLength', value: 4, errorMessage: 'Mínimo 4 caracteres' },
          {
            rule: 'maxLength',
            value: 25,
            errorMessage: 'Máximo 25 caracteres',
          },
        ])
        .addField(city, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'customRegexp', value: /^[^\d]+$/, errorMessage: 'Inválido' },
          { rule: 'minLength', value: 4, errorMessage: 'Mínimo 4 caracteres' },
          {
            rule: 'maxLength',
            value: 25,
            errorMessage: 'Máximo 25 caracteres',
          },
        ])
        .addField(address, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'minLength', value: 3, errorMessage: 'Mínimo 3 caracteres' },
          {
            rule: 'maxLength',
            value: 50,
            errorMessage: 'Máximo 50 caracteres',
          },
        ]);
      break;
    case 4:
      validate
        .addField(password, [
          { rule: 'required', errorMessage: 'Requerido' },
          { rule: 'minLength', value: 6, errorMessage: 'Mínimo 6 caracteres' },
          {
            rule: 'maxLength',
            value: 15,
            errorMessage: 'Máximo 15 caracteres',
          },
        ])
        .addField(password_confirmation, [
          {
            rule: 'required',
            errorMessage: 'Requerido',
          },
          { rule: 'minLength', value: 6, errorMessage: 'Mínimo 6 caracteres' },
          {
            rule: 'maxLength',
            value: 15,
            errorMessage: 'Máximo 15 caracteres',
          },
          {
            validator: () => {
              if (password.value !== password_confirmation.value) {
                return false;
              }

              return true;
            },
            errorMessage: 'Las contraseñas deben ser las mismas',
          },
        ]);
      break;
    default:
      break;
  }
};

export const validateDeposit = (form, handleSubmit, data) => {
  const validate = new window.JustValidate(form);

  const { amount, modalContainer } = data;

  validate
    .addField(amount, [
      {
        rule: 'integer',
        errorMessage: 'El campo tiene que ser numérico',
      },
      {
        rule: 'required',
        errorMessage: 'Requerido',
      },
      {
        rule: 'minNumber',
        value: 500,
        errorMessage: 'El deposito mínimo es de 500',
      },
      {
        rule: 'maxNumber',
        value: 2000000,
        errorMessage: 'El deposito no puede superar los 2,000,000',
      },
    ])
    .onSuccess(() => {
      handleSubmit(amount.value, modalContainer);
    });
};
