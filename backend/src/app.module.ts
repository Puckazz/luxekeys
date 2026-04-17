import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/products/product.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [ProductModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
