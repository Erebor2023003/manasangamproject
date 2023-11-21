import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { adminDto } from './dto/admin.dto';
import { podupuDetailsDto } from './dto/podhupuDetails.dto';
import { Cron } from '@nestjs/schedule';
import { podhupuDto } from './dto/podhupu.dto';
import { depositDetailsDto } from './dto/depositDetails.dto';
import { depositDto } from './dto/deposit.dto';

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

  @Get('/getpodupudetailslist')
  async podupudetailsList() {
    try{
      const list = await this.adminService.getPodhupudetailsList();
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getpodupuDetailsbyid')
  async getPodhupuDetailsById(@Body() req: podupuDetailsDto) {
    try{
      const details = await this.adminService.getPodhupuDetailsbyid(req);
      return details
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  } 

  // @Cron('0 * * * * *')
  @Post('/addcustomerpodupus')
  async addPodhupus()  {
      try{
        const addpodhupurecord = await this.adminService.createPodupu();
        return addpodhupurecord
      } catch(error) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error,
        }
      }
  }

    // @Cron('0 * * * * *')
    @Post('/updatecustomerpodupus')
    async updatePoshupus()  {
        try{
          const updatepodhupurecord = await this.adminService.updatePodupu();
          return updatepodhupurecord
        } catch(error) {
          return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error,
          }
        }
    }

  @Post('/podupupaystatus')
  async podupustatus(@Body() req: podhupuDto) {
    try{
      const changeStatus = await this.adminService.updatepodupustatus(req);
      return changeStatus
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/podupulistbycustomer')
  async listOfPodupusByCustomer(@Body() req: podhupuDto) {
    try{
      const list = await this.adminService.podupusListByCustomer(req);
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/customerpodupubalance')
  async customerPodhupuBalance(@Body() req: podhupuDto) {
    try{
      const balance = await this.adminService.customerPodupuBalance(req);
      return balance
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/paidpodupulistbysangham')
  async paidPodupuListOfSangham(@Body() req: podhupuDto) {
    try{
      const paidList = await this.adminService.paidPodupu(req);
      return paidList
    }catch(error) {
      return{
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/unpaidpodupulistbysangham')
  async unpaidPodupuListOfSangham(@Body() req: podhupuDto) {
    try{
      const paidList = await this.adminService.unpaidPodupu(req);
      return paidList
    }catch(error) {
      return{
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/adddepositdetails')
  async addDepositDetails(@Body() req: depositDetailsDto) {
    try{
      const addDetails = await this.adminService.addDepositDetails(req);
      return addDetails
    } catch(error){
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Get('/getdepositdetails')
  async getDepositDetails() {
    try{
      const list = await this.adminService.getDepositDetailsList();
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getGetDepositDetailsById')
  async getDepositDetailsById(@Body() req:depositDetailsDto) {
    try{
      const details = await this.adminService.getDepositDetailsById(req);
      return details
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/payDeposit')
  async payDeposit(@Body() req: depositDto) {
    try{
      const adddeposit = await this.adminService.addDeposit(req);
      return adddeposit
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}