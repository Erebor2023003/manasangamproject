import { Controller, Post, Get, Body, HttpStatus } from '@nestjs/common';
import { SanghamdepositsService } from './sanghamdeposits.service';
import { sanghamdepositDetailsDto } from './dto/sanghamdepositdetails.dto';
import { sanghamDepositDto } from './dto/sanghamdeposits.dto';

@Controller('sanghamdeposits')
export class SanghamdepositsController {
  constructor(private readonly sanghamdepositsService: SanghamdepositsService) {}

  @Post('/depositdetailsofsangham')
  async createSanghamDepositDetails(@Body() req: sanghamdepositDetailsDto) {
    try{
      const adddetails = await this.sanghamdepositsService.createSanghamDetails(req);
      return adddetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Get('/listofsanghamdepositdetails')
  async getSanghamDepositDetailslist() {
    try{
      const adddetails = await this.sanghamdepositsService.getSanghamDetailslist();
      return adddetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
  @Post('/getdepositdetailsbyid')
  async getSanghamDepositDetailsById(@Body() req: sanghamdepositDetailsDto) {
    try{
      const adddetails = await this.sanghamdepositsService.getSanghamDetailsbyId(req);
      return adddetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getdepositdetailsbyagent')
  async getSanghamDepositDetailsByAgentId(@Body() req: sanghamdepositDetailsDto) {
    try{
      const adddetails = await this.sanghamdepositsService.getSanghamDetailsbyAgentId(req);
      return adddetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/paySanghamDeposit')
  async addSanghamDeposit(@Body() req: sanghamDepositDto) {
    try{
      const addDeposit = await this.sanghamdepositsService.createSanghamDeposit(req);
      return addDeposit
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getsanghamdepositslist')
  async getSanghamDepositsList(@Body() req: sanghamDepositDto) {
    try{
      const addDeposit = await this.sanghamdepositsService.getSanghamDepositsBySangham(req);
      return addDeposit
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
