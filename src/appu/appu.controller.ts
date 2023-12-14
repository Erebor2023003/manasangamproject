import { Body, Controller, HttpStatus, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppuService } from './appu.service';
import { AppuDetails } from './schema/appudetails.schema';
import { appuDetailsDto } from './dto/appudetails.dto';
import { appuDto } from './dto/appu.dto';
import { suretyDto } from './dto/surety.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { customerDto } from 'src/customer/dto/customer.dto';

@Controller('appu')
export class AppuController {
  constructor(private readonly appuService: AppuService) {}

  @Post('/addappudetails')
  async addAppuDetails(@Body() req: appuDetailsDto) {
    try{
      const details = await this.appuService.addappuDetails(req);
      return details
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getcustomerappudetailsbysangham')
  async getCustomerAppuDetailsBySangham(@Body() req: appuDetailsDto) {
    try{
      const details = await this.appuService.getCustomerAppuDetailsBySangham(req);
      return details
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getcustomerappudetails')
  async getCustomerAppuDetails(@Body() req: appuDetailsDto) {
    try{
      const details = await this.appuService.getCustomerAppuDetails(req);
      return details
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
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
    try{
      const addsurety = await this.appuService.addSurety(req,image);
      return addsurety
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/addappu')
  async addAppu(@Body() req: appuDto) {
    try{
      const addAppu = await this.appuService.addAppu(req);
      return addAppu
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/approveappu')
  async approveAppu(@Body() req: customerDto) {
    try{
      const addAppu = await this.appuService.approveAppu(req);
      return addAppu
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  // @Cron()
  @Post('/appucron')
  async appuCron() {
    try{
      const addappu = await this.appuService.appuCron();
      return addappu
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getcustomerappus')
  async getCustomerAppus(@Body() req: appuDto) {
    try{
      const list = await this.appuService.getAppuRecordsOfCustomer(req);
      return list
    } catch(error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getcustomerappubyid')
  async getCustomerappubyid(@Body() req: appuDto) {
    try{
      const list = await this.appuService.getCustomerAppuById(req);
      return list
    } catch(error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/searchappubydate')
  async searchAppuByDate(@Body() req: appuDto) {
    try{
      const list = await this.appuService.searchAppuByDate(req);
      return list
    } catch(error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
