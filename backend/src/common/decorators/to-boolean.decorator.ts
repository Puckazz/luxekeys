import { Transform } from 'class-transformer';
import { toBoolean } from '../utils';

export const ToBoolean = (): PropertyDecorator => Transform(toBoolean);
