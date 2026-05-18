import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/index.js';
import { JwtAuthGuard } from '../../common/guards/index.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all addresses of the current user' })
  @ApiOkResponse({
    description: 'List of user addresses ordered by default first',
  })
  findAll(@CurrentUser() user: AuthUser) {
    return this.addressesService.findAllByUser(user.id);
  }

  @Get('states')
  @ApiOperation({ summary: 'Get states or provinces by country' })
  getStates(@Query('country') country: string) {
    return this.addressesService.getStates(country);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get cities or districts by country and state' })
  getCities(@Query('country') country: string, @Query('state') state: string) {
    return this.addressesService.getCities(country, state);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new address' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(user.id, createAddressDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single address by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Address detail' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.addressesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, user.id, updateAddressDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete an address' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.addressesService.remove(id, user.id);
  }

  @Patch(':id/set-default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  setDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.addressesService.setDefault(id, user.id);
  }
}
