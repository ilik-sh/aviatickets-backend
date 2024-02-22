/* eslint-disable @typescript-eslint/ban-types */
import { Transform } from 'class-transformer';
import { isArray, isString } from 'class-validator';

export function RemoveExtraSpaces(): PropertyDecorator {
  return Transform(({ value }) => {
    return tryToRemoveExtraSpaces(value);
  });
}

const tryToRemoveExtraSpaces = (value: any): any => {
  const isValueArray = isArray(value);
  if (!isString(value) && !isValueArray) {
    return value;
  }

  if (isValueArray) {
    const string = value.join(',');
    return removeExtraSpaces(string).split(',');
  }

  return removeExtraSpaces(String(value));
};

const removeExtraSpaces = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};
