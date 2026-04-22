import { PartialType } from '@nestjs/swagger';
import { CreateProductSpecDto } from './create-product-spec.dto';

export class UpdateProductSpecDto extends PartialType(CreateProductSpecDto) {}
