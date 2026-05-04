import { Module } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: 'APP_GUARD_JWT',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD_ROLES',
      useClass: RolesGuard,
    },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
