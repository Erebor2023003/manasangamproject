import { Controller, Post, Get, Body, HttpStatus } from '@nestjs/common';
import { SanghamdepositsService } from './sanghamdeposits.service';
import { sanghamdepositDetailsDto } from './dto/sanghamdepositdetails.dto';
import { sanghamDepositDto } from './dto/sanghamdeposits.dto';
import { sanghamWithdrawDto } from './dto/sanghamwithdraw.dto';
import { paidDto } from './dto/paid.dto';

@Controller('sanghamdeposits')
export class SanghamdepositsController {
  constructor(
    private readonly sanghamdepositsService: SanghamdepositsService,
  ) {}

  //start of sangham deposit details

  // Add Sangham Deposit Details
  @Post('/depositdetailsofsangham')
  async createSanghamDepositDetails(@Body() req: sanghamdepositDetailsDto) {
    try {
      const adddetails = await this.sanghamdepositsService.createSanghamDetails(
        req,
      );
      return adddetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Get sangham deposit details by sanghamId
  @Post('/getdepositdetailsbyid')
  async getSanghamDepositDetailsById(@Body() req: sanghamdepositDetailsDto) {
    try {
      const adddetails =
        await this.sanghamdepositsService.getSanghamDetailsbyId(req);
      return adddetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Update sangham Deposit Interest
  @Post('/updatedepositdetailsbyid')
  async updateSanghamDepositDetailsById(@Body() req: sanghamdepositDetailsDto) {
    try {
      const adddetails =
        await this.sanghamdepositsService.updateSanghamDetailsbyId(req);
      return adddetails;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // end of sangham deposit details

  //start of sangham deposits

  // Pay or Add sangham Deposit
  @Post('/paySanghamDeposit')
  async addSanghamDeposit(@Body() req: sanghamDepositDto) {
    try {
      const addDeposit = await this.sanghamdepositsService.createSanghamDeposit(
        req,
      );
      return addDeposit;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Cron api for creating sangham deposits
  // @Cron()
  @Post('/sanghamdepositcron')
  async sanghamDepositCron() {
    try {
      const _SDCRON = await this.sanghamdepositsService.sanghamDepositCron();
      return _SDCRON;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Get sangham deposit list of sangham
  @Post('/getsanghamdepositslist')
  async getSanghamDepositsList(@Body() req: sanghamDepositDto) {
    try {
      const addDeposit =
        await this.sanghamdepositsService.getSanghamDepositsBySangham(req);
      return addDeposit;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Get sangham balance of sangham deposits
  @Post('/getsanghamdepositsbalance')
  async getSanghamDepositsBalance(@Body() req: sanghamDepositDto) {
    try {
      const addDeposit =
        await this.sanghamdepositsService.sanghamDepositsBalance(req);
      return addDeposit;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Sangham Deposit history with date filtering
  @Post('/getsanghamdepositshistory')
  async getSanghamDepositsHistory(@Body() req: sanghamDepositDto) {
    try {
      const addDeposit =
        await this.sanghamdepositsService.sanghamDepositsHistory(req);
      return addDeposit;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // end of sangham deposits

  // start of sangham withdraws

  @Post('/withdrawsanghamdeposit')
  async withdrawSanghamDeposit(@Body() req: sanghamWithdrawDto) {
    try {
      const withdraw = await this.sanghamdepositsService.createSanghamWithdraw(
        req,
      );
      return withdraw;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getsanghamwithdraws')
  async getSanghamWithdrawList(@Body() req: sanghamWithdrawDto) {
    try {
      const withdraw =
        await this.sanghamdepositsService.getSanghamWithdrawsbyfilter(req);
      return withdraw;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // end of sangham withdraws

  // Add Pay to manasangham
  @Post('/paytosangham')
  async payToSangham(@Body() req: paidDto) {
    try{
      const paidDetails = await this.sanghamdepositsService.payToSangham(req);
      return paidDetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  // Get paid History of sangham
  @Post('/payslistofsangham')
  async getPaidHistoryofSangham(@Body() req: paidDto) {
    try{
      const paidDetails = await this.sanghamdepositsService.paysList(req);
      return paidDetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
