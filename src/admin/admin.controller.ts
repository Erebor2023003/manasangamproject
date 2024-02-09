import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { adminDto } from './dto/admin.dto';
import { podupuDetailsDto } from './dto/podhupuDetails.dto';
import { Cron } from '@nestjs/schedule';
import { podhupuDto } from './dto/podhupu.dto';
import { depositDetailsDto } from './dto/depositDetails.dto';
import { depositDto } from './dto/deposit.dto';
import { withdrawDto } from './dto/withdraw.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/adminregister')
  async adminRegister(@Body() req: adminDto) {
    try {
      const addAdmin = await this.adminService.adminregister(req);
      return addAdmin;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
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

  @Post('/forgotPassword')
  async updatePassword(@Body() req: adminDto) {
    try {
      const findAdmin = await this.adminService.updateAdmin(req);
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
    try {
      const addDetails = await this.adminService.addpodupuDetails(req);
      return addDetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/getpodupudetailslist')
  async podupudetailsList() {
    try {
      const list = await this.adminService.getPodhupudetailsList();
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getpodupuDetailsbyid')
  async getPodhupuDetailsById(@Body() req: podupuDetailsDto) {
    try {
      const details = await this.adminService.getPodhupuDetailsbyid(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/updatepodupuDetailsbyid')
  async updatePodhupuDetailsById(@Body() req: podupuDetailsDto) {
    try {
      const details = await this.adminService.updatePodupuDetailsbyId(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // @Cron('0 * * * * *')
  @Post('/addcustomerpodupus')
  async addPodhupus() {
    try {
      const addpodhupurecord = await this.adminService.createPodupu();
      return addpodhupurecord;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/podupupaystatus')
  async podupustatus(@Body() req: podhupuDto) {
    try {
      const changeStatus = await this.adminService.updatepodupustatus(req);
      return changeStatus;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/podupulistbycustomer')
  async listOfPodupusByCustomer(@Body() req: podhupuDto) {
    try {
      const list = await this.adminService.podupusListByCustomer(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getpodhupubyid')
  async getPodhupuById(@Body() req: podhupuDto) {
    try {
      const details = await this.adminService.getPodhupuById(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/customerpodupubalance')
  async customerPodhupuBalance(@Body() req: podhupuDto) {
    try {
      const balance = await this.adminService.customerPodupuBalance(req);
      return balance;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/searchcustomerpodupubydate')
  async searchPodupuByDate(@Body() req: podhupuDto) {
    try {
      const list = await this.adminService.searchCustomerPodhupudByDate(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getrecentpaidpodhupu')
  async getRecentPaidPodhupu(@Body() req: podhupuDto) {
    try {
      const list = await this.adminService.podhupuRecentPaid(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/paidpodupulistbysangham')
  async paidPodupuListOfSangham(@Body() req: podhupuDto) {
    try {
      const paidList = await this.adminService.paidPodupu(req);
      return paidList;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/unpaidpodupulistbysangham')
  async unpaidPodupuListOfSangham(@Body() req: podhupuDto) {
    try {
      const paidList = await this.adminService.unpaidPodupu(req);
      return paidList;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/sanghampodhupubalance')
  async sanghamPodhupubalance(@Body() req: podhupuDto) {
    try {
      const paidList = await this.adminService.getSanghamPodhupuBalance(req);
      return paidList;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/adddepositdetails')
  async addDepositDetails(@Body() req: depositDetailsDto) {
    try {
      const addDetails = await this.adminService.addDepositDetails(req);
      return addDetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/getdepositdetails')
  async getDepositDetails() {
    try {
      const list = await this.adminService.getDepositDetailsList();
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getDepositDetailsById')
  async getDepositDetailsById(@Body() req: depositDetailsDto) {
    try {
      const details = await this.adminService.getDepositDetailsById(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/updateDepositDetailsById')
  async updateDepositDetailsById(@Body() req: depositDetailsDto) {
    try {
      const details = await this.adminService.updateDepositDetailsbyId(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/payDeposit')
  async payDeposit(@Body() req: depositDto) {
    try {
      const adddeposit = await this.adminService.addDeposit(req);
      return adddeposit;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // @Cron('0 * * * * *')
  @Post('/depositCron')
  async cronDeposit() {
    try {
      const cronjob = await this.adminService.depositCron();
      return cronjob;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/depositslist')
  async depositsList(@Body() req: depositDto) {
    try {
      const list = await this.adminService.getDepositsOfCustomer(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/customerdepositsfilter')
  async sanghamDepositsFilter(@Body() req: depositDto) {
    try {
      const list = await this.adminService.getSanghamDepositsbyfilter(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/deposithistory')
  async depositHistory(@Body() req: depositDto) {
    try {
      const history = await this.adminService.depositHistoryList(req);
      return history;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/depositwholebalance')
  async depositWholeBalance(@Body() req: depositDto) {
    try {
      const history = await this.adminService.depositsWholeBalance(req);
      return history;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/withdrawdeposit')
  async depositWithdraw(@Body() req: withdrawDto) {
    try {
      const createWithdraw = await this.adminService.withdrawDeposit(req);
      return createWithdraw;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/withdrawsbycustomer')
  async getWithdrawList(@Body() req: withdrawDto) {
    try {
      const getwithdrawlist = await this.adminService.getWithdrawsbycustomer(
        req,
      );
      return getwithdrawlist;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/customerwithdrawsfilter')
  async sanghamWithdrawsFilter(@Body() req: withdrawDto) {
    try {
      const list = await this.adminService.getSanghamWithdrawsbyfilter(req);
      return list;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getwithdrawbyid')
  async getWithdrawById(@Body() req: withdrawDto) {
    try {
      const findWithdraw = await this.adminService.getWithdrawById(req);
      return findWithdraw;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
