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
import {
  isSameDay,
  format,
  parse,
  differenceInDays,
  subMonths,
  differenceInMonths,
  addMonths,
  isSameMonth,
  getDate,
} from 'date-fns';

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
      const podupuDetails = await this.podupudetailsModel.find().exec();
  
      for (const detail of podupuDetails) {
        const customerStartDate = parse(detail.startDate, 'dd-MM-yyyy', new Date());
        const podupuPeriodEnd = addMonths(customerStartDate, detail.podupuPeriod);
  
        // Check if the day of the month in startDate matches today's day
        // and if the current date is within the specified podupuPeriod
        if (
          getDate(customerStartDate) === getDate(currentDate) &&
          currentDate <= podupuPeriodEnd
        ) {
          // Create a podupus record for today's date
          const podupuRecord = new this.podupuModel({
            customerId: detail.customerId,
            podhupuAmount: detail.monthlyAmount,
            date: currentDate,
            fine: 0,
            interest: 0,
            Total: detail.monthlyAmount,
          });
          console.log(podupuRecord);
          await podupuRecord.save();
        }
      }
  
      return {
        statusCode: HttpStatus.OK,
        message: 'Podupus records created successfully.',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async updatePodupu() {
    try {
      const currentDate = new Date();
      const lastMonth = subMonths(currentDate, 1);
  
      const podupuDetails = await this.podupuModel.find().exec();
  
      for (const detail of podupuDetails) {
        const inputDate = new Date(detail.date);
  
        // Calculate the difference in days
        const differInDays = differenceInDays(currentDate, inputDate);
  
        console.log('customerStartDate:', inputDate);
        console.log('lastMonth:', lastMonth);
        console.log('differenceInDays:', differInDays);
        console.log(detail.status);
  
        if (differInDays >= 30) {
          if (detail.status === 'unpaid') {
            const monthsDifference = Math.floor(differInDays / 30);
            console.log(monthsDifference);
            const podupuDetails = await this.podupudetailsModel.findOne({
              customerId: detail.customerId,
            });
  
            const fine =
              detail.podhupuAmount * (podupuDetails.fine / 100) * monthsDifference;
  
            const podupuRecordUpdate = await this.podupuModel.updateMany(
              {
                podhuId: detail.podhuId,
                status: 'unpaid',
              },
              {
                $set: {
                  fine: fine,
                  Total: detail.podhupuAmount + fine,
                },
              }
            );
  
            console.log(`Updated ${podupuRecordUpdate.modifiedCount} record(s)`);
  
            // You may choose to return something here if needed
          }
        }
      }
  
      // You may return something here if needed
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }


}
