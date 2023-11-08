import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin.schema';
import { Model } from 'mongoose';
import { adminDto } from './dto/admin.dto';
import { AuthService } from 'src/auth/auth.service';
import { podupuDetailsDto } from './dto/podhupuDetails.dto';
import { PodupuDetails } from './schema/podhupuDetails.schema';
import { podhupuDto } from './dto/podhupu.dto';
import { Podupu } from './schema/podhupu.schema';
import { isSameDay, format, parse, differenceInDays, subMonths, differenceInMonths  } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(PodupuDetails.name)
    private readonly podupudetailsModel: Model<PodupuDetails>,
    @InjectModel(Podupu.name)
    private readonly podupuModel: Model<Podupu>,
    private readonly authService: AuthService,
  ) {}

  async adminregister(req: adminDto) {
    try {
      const findAdmin = await this.adminModel.findOne({ emailId: req.emailId });
      if (!findAdmin) {
        const bcryptPassword = await this.authService.hashPassword(
          req.password,
        );
        req.password = bcryptPassword;
        const createAdmin = await this.adminModel.create(req);
        if (createAdmin) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Admin Registered successfully',
            data: createAdmin,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Admin Registration Failed',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Admin already existed',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async loginAdmin(req: adminDto) {
    try {
      const findAdmin = await this.adminModel.findOne({ emailId: req.emailId });
      //   console.log(findUser);
      if (!findAdmin) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Admin Not Found',
        };
      } else {
        const matchPassword = await this.authService.comparePassword(
          req.password,
          findAdmin.password,
        );
        // console.log(matchPassword);
        if (matchPassword) {
          const jwtToken = await this.authService.createToken({ findAdmin });
          //   console.log(jwtToken);
          return {
            statusCode: HttpStatus.OK,
            message: 'Admin Login successfull',
            token: jwtToken,
            data: findAdmin,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Password incorrect',
          };
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addpodupuDetails(req: podupuDetailsDto) {
    try {
      const findCustomer = await this.podupudetailsModel.findOne({
        customerId: req.customerId,
      });
      // const findUser = await this.customerModel.findOne({customerId: req.customerId});
      if (!findCustomer) {
        const addDetails = await this.podupudetailsModel.create(req);
        if (addDetails) {
          return {
            statusCode: HttpStatus.OK,
            message: 'PodupuDetails Added Successfully',
            data: addDetails,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Customer Details Already Added to this customer',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async createPodupu() {
    try {
      const currentDate = new Date();
      const currentDateFormatted = format(currentDate, 'dd-MM-yyyy');
      const lastMonth = subMonths(currentDate, 1);

      const podupuDetails = await this.podupudetailsModel.find().exec();

      for (const detail of podupuDetails) {
        const customerStartDate = parse(
          detail.startDate,
          'dd-MM-yyyy',
          new Date(),
        );
        const formattedStartDate = format(customerStartDate, 'dd-MM-yyyy');
        console.log('customerStartDate:', customerStartDate);
          console.log('currentDate:', currentDate);
          console.log('isSameDay:', isSameDay(customerStartDate, lastMonth) || isSameDay(customerStartDate, currentDate));

          
        if (
          isSameDay(customerStartDate, lastMonth) || isSameDay(customerStartDate, currentDate)
        ) {
          const lastRecord = await this.podupuModel.findOne({
            customerId: detail.customerId,
          }).sort({ date: -1 }).exec();

          const timeGapInDays = lastRecord
            ? differenceInMonths(currentDate, customerStartDate)
            : 0;
          console.log(timeGapInDays);
          const interest = (detail.monthlyAmount * timeGapInDays * detail.interest) / 100;

            const podupuRecord = new this.podupuModel({
              customerId: detail.customerId,
              podhupuAmount: detail.monthlyAmount,
              date: currentDate,
              fine: detail.monthlyAmount * (detail.fine / 100),
              interest: interest,
              Total: detail.monthlyAmount + interest,
            });
  
            await podupuRecord.save();
          
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
