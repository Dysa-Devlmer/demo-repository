import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('demo')
  @HttpCode(HttpStatus.OK)
  async createDemoRequest(@Body() createDemoRequestDto: CreateDemoRequestDto) {
    return this.leadsService.createDemoRequest(createDemoRequestDto);
  }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async createContactRequest(@Body() contactData: any) {
    return this.leadsService.createContactRequest(contactData);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async createRegistration(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.leadsService.createRegistration(createRegistrationDto);
  }
}
