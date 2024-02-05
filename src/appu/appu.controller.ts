import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppuService } from './appu.service';
import { AppuDetails } from './schema/appudetails.schema';
import { appuDetailsDto } from './dto/appudetails.dto';
import { appuDto } from './dto/appu.dto';
import { suretyDto } from './dto/surety.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { customerDto } from 'src/customer/dto/customer.dto';
import { interestDto } from './dto/interest.dto';

@Controller('appu')
export class AppuController {
  constructor(private readonly appuService: AppuService) {}

  @Post('/addappudetails')
  async addAppuDetails(@Body() req: appuDetailsDto) {
    try {
      const details = await this.appuService.addappuDetails(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getcustomerappudetailsbysangham')
  async getCustomerAppuDetailsBySangham(@Body() req: appuDetailsDto) {
    try {
      const details = await this.appuService.getCustomerAppuDetailsBySangham(
        req,
      );
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getcustomerappudetails')
  async getCustomerAppuDetails(@Body() req: appuDetailsDto) {
    try {
      const details = await this.appuService.getCustomerAppuDetails(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/adddsuretymembers')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addSuretyMember(@Body() req: suretyDto, @UploadedFiles() image) {
    try {
      const addsurety = await this.appuService.addSurety(req, image);
      return addsurety;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/addappu')
  async addAppu(@Body() req: appuDto) {
    try {
      const addAppu = await this.appuService.addAppu(req);
      return addAppu;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/approveappu')
  async approveAppu(@Body() req: customerDto) {
    try {
      const addAppu = await this.appuService.approveAppu(req);
      return addAppu;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // @Cron()
  @Post('/appucron')
  async appuCron() {
    try {
      const addappu = await this.appuService.appuCron();
      return addappu;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/recentpaidappu')
  async recentAppuPaid(@Body() req: appuDto) {
    try {
      const addappu = await this.appuService.appuRecentPaid(req);
      return addappu;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/payappu')
  async payCustomerAppu(@Body() req: appuDto) {
    try {
      const payappu = await this.appuService.payAppu(req);
      return payappu;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/getcustomerappubyid')
  async getCustomerappubyid(@Body() req: appuDto) {
    try {
      const list = await this.appuService.getCustomerAppuById(req);
      return list;
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/searchappubydate')
  async searchAppuByDate(@Body() req: appuDto) {
    try {
      const list = await this.appuService.searchAppuByDate(req);
      return list;
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/appurecoveredfilter')
  async appuPaidList(@Body() req: appuDto) {
    try {
      const recoveryList = await this.appuService.appuRecoveredList(req);
      return recoveryList;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/appupendingfilter')
  async appuPendingList(@Body() req: appuDto) {
    try {
      const recoveryList = await this.appuService.appuPendingList(req);
      return recoveryList;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/appubalanceofcustomer')
  async customerAppuBalance(@Body() req: appuDto) {
    try {
      const recoveryList = await this.appuService.appuCustomerBalance(req);
      return recoveryList;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/resendotp')
  async resendOtp(@Body() req: customerDto) {
    try {
      const sendOtp = await this.appuService.resendOtpToCustomer(req);
      return sendOtp;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Post('/addInterest')
  async addInterest(@Body() req: interestDto) {
    try {
      const details = await this.appuService.addInterest(req);
      return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  @Get('/getinterestlist')
  async getInterestlist() {
    try{
      const getlist = await this.appuService.getInterestlist();
      return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error
      }
    }
  }

  @Post('/getinterestbyid')
  async getInterestById(@Body() req: interestDto) {
    try{
      const getlist = await this.appuService.getInterestbyid(req);
      return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error
      }
    }
  }

  @Post("/updateinterest")
  async updateInterest(@Body() req: interestDto) {
    try{
      const moderateinterest = await this.appuService.updateInterestById(req);
      return moderateinterest
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error
      }
    }
  }
}
