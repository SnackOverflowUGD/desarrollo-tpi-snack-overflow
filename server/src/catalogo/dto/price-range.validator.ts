import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Class-validator constraint: `rangoPrecioMin <= rangoPrecioMax`.
 * Both bounds are optional; the range is only checked when BOTH are present
 * (RN-CAT-01 / PSM-REQ-05). Applied to the `rangoPrecioMax` property so the
 * error surfaces on the upper bound.
 */
export function IsPriceRangeValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPriceRangeValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const obj = args.object as {
            rangoPrecioMin?: number | null;
            rangoPrecioMax?: number | null;
          };
          const min = obj.rangoPrecioMin;
          const max = obj.rangoPrecioMax;
          if (min === null || min === undefined) return true;
          if (max === null || max === undefined) return true;
          return min <= max;
        },
        defaultMessage() {
          return 'rangoPrecioMin must be less than or equal to rangoPrecioMax';
        },
      },
    });
  };
}
