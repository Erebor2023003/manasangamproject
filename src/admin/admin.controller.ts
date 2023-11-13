import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { adminDto } from './dto/admin.dto';
import { podupuDetailsDto } from './dto/podhupuDetails.dto';
import { Cron } from '@nestjs/schedule';
import { podhupuDto } from './dto/podhupu.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Post('/adminregister')
  async adminRegister(@Body() req: adminDto) {
    try{
      const addAdmin =await this.adminService.adminregister(req);
      return addAdmin
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/loginadmin')
  async loginadmin(@Body() req: adminDto) {
    try {
      const findAdmin = await this.adminService.loginAdmin(req);
      return findAdmin;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/addpodupudetails')
  async addPodupuDetails(@Body() req: podupuDetailsDto) {
    try{
      const addDetails = await this.adminService.addpodupuDetails(req);
      return addDetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  // @Cron('0 * * * * *')
  @Post('/addcustomerpodupus')
  async openForBusiness()  {
      try{
        const addpodhupurecord = await this.adminService.updatePodupu();
        return addpodhupurecord
      } catch(error) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error,
        }
      }
  }
}