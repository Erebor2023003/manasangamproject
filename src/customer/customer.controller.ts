import { Body, Controller, HttpStatus, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/roles.enum';
import { customerDto } from './dto/customer.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.AGENT,Role.ADMIN)
  @Post('/addcustomer')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aadharImage' },  { name: 'profileImage' }]),
  )
  async addCustomer(@Body() req: customerDto,@UploadedFiles() image) {
    try{
      const addcustomer = await this.customerService.addCustomer(req, image);
      return addcustomer
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/customersbysangham')
  async listOfCustomers(@Body() req: customerDto) {
    try{
      const list = await this.customerService.listOfCustomersBySangam(req);
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/searchcustomerbyname')
  async searchCustomerByName(@Body() req: customerDto) {
    try{
      const searchCustomer = await this.customerService.searchCustomerByName(req);
      return searchCustomer
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/updatecustomer')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aadharImage' },  { name: 'profileImage' }]),
  )
  async updateCustomer(@Body() req: customerDto, @UploadedFiles() image) {
    try{
      const updatecustomer = await this.customerService.updateCustomer(req, image);
      return updatecustomer
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getcustomerdetails')
  async getCustomerDetailsById(@Body() req: customerDto) {
    try{
      const getdetails = await this.customerService.getCustomerDetailsById(req);
      return getdetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/unblockcustomer')
  async unblockCustomer(@Body() req: customerDto) {
    try{
      const unblockcustomer = await this.customerService.unblockCustomer(req);
      return unblockcustomer
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getcustomerdetails')
  async deleteCustomer(@Body() req: customerDto) {
    try{
      const getdetails = await this.customerService.deleteCustomer(req);
      return getdetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
