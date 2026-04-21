import { Transform } from 'class-transformer';
import { toBoolean } from '../utils/transform.util';

export const ToBoolean = (): PropertyDecorator => Transform(toBoolean);
