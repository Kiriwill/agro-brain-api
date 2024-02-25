import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import {cnpj, cpf } from "cpf-cnpj-validator";

@ValidatorConstraint({ async: false })
class CpfIsValid implements ValidatorConstraintInterface {
  validate(num: string, args: ValidationArguments): boolean {
	return cpf.isValid(num)
  }
}

export default function IsCpfValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CpfIsValid,
    });
  };
}

@ValidatorConstraint({ async: false })
class CnpjIsValid implements ValidatorConstraintInterface {
  validate(num: string, args: ValidationArguments): boolean {
	return cnpj.isValid(num)
  }
}

export function IsCnpjValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CnpjIsValid,
    });
  };
}
