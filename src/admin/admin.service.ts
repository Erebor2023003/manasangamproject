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
  addDays,
} from 'date-fns';
import { Customer } from 'src/customer/schema/customer.schema';
import { depositDetailsDto } from './dto/depositDetails.dto';
import { DepositDetails } from './schema/depositDetails.schema';
import { Deposit } from './schema/deposit.schema';
import { Sangham } from 'src/agent/schema/sangham.schema';
import { depositDto } from './dto/deposit.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(PodupuDetails.name)
    private readonly podupudetailsModel: Model<PodupuDetails>,
    @InjectModel(Podupu.name)
    private readonly podupuModel: Model<Podupu>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>,
    @InjectModel(DepositDetails.name)
    private readonly depositdetailsModel: Model<DepositDetails>,
    @InjectModel(Deposit.name)
    private readonly depositModel: Model<Deposit>,
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
        sanghamId: req.sanghamId,
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
          message: 'Podupu Details Already Added to this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getPodhupudetailsList() {
    try {
      const list = await this.podupudetailsModel.find();
      if (list.length > 0) {
        const customerDetails = await this.podupudetailsModel.aggregate([
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customerId',
            },
          },
        ]);
        return {
          statusCode: HttpStatus.OK,
          message: 'List of podupus',
          data: customerDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Didn't find any podupus",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getPodhupuDetailsbyid(req: podupuDetailsDto) {
    try {
      const getDetails = await this.podupudetailsModel.findOne({
        podupuDetailsId: req.podupuDetailsId,
      });
      if (getDetails) {
        const getCustomer = await this.podupudetailsModel.aggregate([
          { $match: { podupuDetailsId: req.podupuDetailsId } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customerId',
            },
          },
        ]);
        return {
          statusCode: HttpStatus.OK,
          message: 'PodupuDetails of a customer',
          data: getCustomer,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found Details',
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
      // currentDate.setHours(0, 0, 0, 0);
      const podupuDetails = await this.podupudetailsModel.find().exec();

      const createPodupuPromises = podupuDetails.map(async (detail) => {
        const customerStartDate = parse(
          detail.startDate,
          'dd-MM-yyyy',
          new Date(),
        );
        const podupuPeriodEnd = addMonths(
          customerStartDate,
          detail.podupuPeriod,
        );
        if (
          getDate(customerStartDate) === getDate(currentDate) &&
          currentDate <= podupuPeriodEnd
        ) {
          // console.log(detail);
          const findDetails = await this.customerModel.find({
            sanghamId: detail.sanghamId,
          });
          // console.log(findDetails);
          const createPodupuRecords = findDetails.map(async (sanghamData) => {
            const customerStartDate = parse(
              detail.startDate,
              'dd-MM-yyyy',
              new Date(),
            );
            const lastMonthStartDate = addMonths(customerStartDate, -1);
            const lastMonthEndDate = addDays(customerStartDate, -1);

            // Retrieve the last month's podupu record for the specific customer
            const lastMonthRecord = await this.podupuModel
              .find({
                sanghamId: sanghamData.sanghamId,
                customerId: sanghamData.customerId,
                date: {
                  $gte: lastMonthStartDate,
                  $lt: customerStartDate, // Exclude the current month's start date
                },
              })
              .sort({ date: -1 }) // Sort in descending order to get the latest record first
              .limit(1) // Limit to only one document
              .exec();

            console.log('lastMonthRecord:', lastMonthRecord[0]); // Add this log for debugging

            console.log('lastMonthStartDate', lastMonthStartDate);
            console.log('lastMonthEndDate', lastMonthEndDate);
            let totalInterest = 0;
            if (lastMonthRecord.length > 0) {
              // Calculate interest based on your interest rate logic
              const interestRate = detail.interest / 100; // Replace with your actual interest rate
              const lastMonthInterest =
                interestRate * lastMonthRecord[0].podhupuAmount;
              totalInterest = lastMonthInterest + lastMonthRecord[0].interest;
            }
            const podupuRecord = new this.podupuModel({
              sanghamId: sanghamData.sanghamId,
              customerId: sanghamData.customerId,
              podhupuAmount: detail.monthlyAmount,
              date: currentDate,
              fine: 0,
              interest: totalInterest,
              Total: detail.monthlyAmount,
            });
            // console.log(podupuRecord);
            await podupuRecord.save();
          });

          await Promise.all(createPodupuRecords);
        }
      });

      await Promise.all(createPodupuPromises);

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
              detail.podhupuAmount *
              (podupuDetails.fine / 100) *
              monthsDifference;

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
              },
            );

            console.log(
              `Updated ${podupuRecordUpdate.modifiedCount} record(s)`,
            );

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

  async updatepodupustatus(req: podhupuDto) {
    try {
      const findPodhupu = await this.podupuModel.findOne({
        podhuId: req.podhuId,
      });
      if (findPodhupu.podhupuAmount === req.podhupuAmount) {
        const changeStatus = await this.podupuModel.updateOne(
          { podhuId: req.podhuId },
          {
            $set: {
              status: req.status,
            },
          },
        );
        if (changeStatus) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Podupu has been payed',
            data: changeStatus,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid Request',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please pay total amount',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        messagge: error,
      };
    }
  }

  async podupusListByCustomer(req: podhupuDto) {
    try {
      const list = await this.podupuModel.find({ customerId: req.customerId });
      if (list.length > 0) {
        const details = await this.podupuModel.aggregate([
          { $match: { customerId: req.customerId } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customerId',
            },
          },
        ]);
        return {
          statusCode: HttpStatus.OK,
          message: 'List of podupu of a customer',
          data: details,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Didn't Find any podupus",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async customerPodupuBalance(req: podhupuDto) {
    try {
      const findCustomer = await this.podupuModel.find({
        customerId: req.customerId,
      });
      if (findCustomer.length > 0) {
        const balance = findCustomer.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.Total;
        }, 0);
        return {
          statusCode: HttpStatus.OK,
          message: 'Total podhupu Balance of a customer',
          data: balance,
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async paidPodupu(req: podhupuDto) {
    try {
      const podupuList = await this.podupuModel.find({
        sanghamId: req.sanghamId,
      });

      if (podupuList.length > 0) {
        const paidList = await this.podupuModel.aggregate([
          { $match: { status: 'paid' } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customerId',
            },
          },
        ]);
        if (paidList.length > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Paid Podhupu',
            data: paidList,
          };
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found paid list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any podupus by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async unpaidPodupu(req: podhupuDto) {
    try {
      const podupuList = await this.podupuModel.find({
        sanghamId: req.sanghamId,
      });

      if (podupuList.length > 0) {
        const paidList = await this.podupuModel.aggregate([
          { $match: { status: 'unpaid' } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customerId',
            },
          },
        ]);
        if (paidList.length > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'UnPaid Podhupu',
            data: paidList,
          };
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found unpaid list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any podupus by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addDepositDetails(req: depositDetailsDto) {
    try {
      const findSangham = await this.depositdetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      if (findSangham) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Sangham Deposit Details Already Added',
        };
      } else {
        const adddetails = await this.depositdetailsModel.create(req);
        if (adddetails) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Deposit Details Added to the customer',
            data: adddetails,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid Request',
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

  async getDepositDetailsList() {
    try {
      const getList = await this.depositdetailsModel.find();
      if (getList.length > 0) {
        const getListbySangham = await this.depositdetailsModel.aggregate([
          {
            $lookup: {
              from: 'sanghams',
              localField: 'sanghamId',
              foreignField: 'sanghamId',
              as: 'sanghamId',
            },
          },
        ]);
        return {
          statusCode: HttpStatus.OK,
          message: 'List of DepositDetails',
          data: getListbySangham,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          mesage: "Didn't have any Deposit Details",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getDepositDetailsById(req: depositDetailsDto) {
    try {
      const getDetails = await this.depositdetailsModel.findOne({
        depositDetailsId: req.depositDetailsId,
      });
      if (getDetails) {
        const getSanghamDetails = await this.depositdetailsModel.aggregate([
          { $match: { sanghamId: getDetails.sanghamId } },
          {
            $lookup: {
              from: 'sanghams',
              localField: 'sanghamId',
              foreignField: 'sanghamId',
              as: 'sanghamId',
            },
          },
        ]);
        return {
          statusCode: HttpStatus.OK,
          message: 'Deposit Details of Sangham',
          data: getSanghamDetails,
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addDeposit(req: depositDto) {
    try {
      const findSangham = await this.depositdetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      if(findSangham) {
        if (findSangham.depositLimit < req.depositAmount) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Deposit Amount exceeds the Limit',
          };
        } else if(!req.depositAmount || req.depositAmount === 0) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Please enter valid Amount",
          }
        } else {
          const currentDate = new Date();
          const customerStartDate = parse(
            findSangham.depositDate,
            'dd-MM-yyyy',
            new Date(),
          );
          const lastMonthStartDate = addMonths(customerStartDate, -1); 
          console.log("lastMonthStartDate", lastMonthStartDate);   
          const lastMonthRecords = await this.depositModel.find({
            sanghamId: req.sanghamId,
            customerId: req.customerId,
            date: { 
              $lt: currentDate,
              $gt: lastMonthStartDate
            },
          }).sort({ date: -1 }).limit(1).exec();

          console.log("lastMonthRecords", lastMonthRecords);

        
        // Calculate interest based on the last month's interest and add it to the current deposit
        let interest = 0;

        let withdraw = 0;

        let Total;
        let lastMonthInterest = 0;
        let lastMonthTotal = 0;
        if(lastMonthRecords.length > 0) {
          lastMonthInterest = lastMonthRecords[0].interest;
          lastMonthTotal = lastMonthRecords[0].total;
          console.log(lastMonthInterest);
          console.log(lastMonthTotal);
          withdraw = 0;
          interest = lastMonthInterest + (lastMonthTotal * (findSangham.interest / 100));
          Total = req.depositAmount + interest + lastMonthRecords[0].depositAmount - withdraw;
        } else {
        //   lastMonthInterest = 0;
        //  lastMonthTotal = 0;
        //  interest = 0;
         Total = req.depositAmount;
         withdraw = 0;
        }

        

          const adddeposit = await this.depositModel.create({
            sanghamId: req.sanghamId,
            customerId: req.customerId,
            depositAmount: req.depositAmount,
            date: currentDate,
            withdraw: 0,
            interest: interest,
            total: Total,
          });
          if (adddeposit) {
            return {
              statusCode: HttpStatus.OK,
              message: 'deposit Paid Successfully',
              data: adddeposit,
            };
          } else {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Invalid Request',
            };
          }
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Didn't found Sangham",
        }
      }
      
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // async addDeposit(req: depositDto) {
  //   try {
  //     const findSangham = await this.depositdetailsModel.findOne({
  //       sanghamId: req.sanghamId,
  //     });
  
  //     if (!findSangham) {
  //       return {
  //         statusCode: HttpStatus.NOT_FOUND,
  //         message: "Didn't find Sangham",
  //       };
  //     }
  
  //     if (findSangham.depositLimit < req.depositAmount) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Deposit Amount exceeds the Limit',
  //       };
  //     }
  
  //     if (!req.depositAmount || req.depositAmount === 0) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Please enter a valid Amount',
  //       };
  //     }
  
  //     const currentDate = new Date();
  //     const customerStartDate = parse(
  //       findSangham.depositDate,
  //       'dd-MM-yyyy',
  //       new Date(),
  //     );
  //     const lastMonthStartDate = addMonths(customerStartDate, -1);
  
  //     let lastMonthRecords = await this.depositModel
  //       .find({
  //         sanghamId: req.sanghamId,
  //         customerId: req.customerId,
  //         date: {
  //           $gte: lastMonthStartDate,
  //           $lt: currentDate, // Exclude the current month's start date
  //         },
  //       })
  //       .sort({ date: -1 })
  //       .limit(1);
  //       console.log("lastMonthRecords",lastMonthRecords);
  //     // Check if there are last month records
  //     let lastMonthInterest = 0;
  //     let lastMonthTotal = 0;
  //     if (lastMonthRecords.length > 0) {
  //       lastMonthInterest = lastMonthRecords[0].interest;
  //       lastMonthTotal = lastMonthRecords[0].total;
  //       console.log(lastMonthInterest);
  //     console.log(lastMonthTotal);
  //     }
      
  
  //     // Calculate interest based on the last month's interest and add it to the current deposit
  //     const interest = lastMonthInterest + (lastMonthTotal * (findSangham.interest / 100));
  
  //     // Calculate total for the current deposit
  //     const Total = req.depositAmount + lastMonthTotal + interest;
  
  //     // Create the new deposit record
  //     const adddeposit = await this.depositModel.create({
  //       sanghamId: req.sanghamId,
  //       customerId: req.customerId,
  //       depositAmount: req.depositAmount,
  //       date: currentDate,
  //       withdraw: 0,
  //       interest: interest,
  //       total: Total,
  //     });
  
  //     if (adddeposit) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Deposit Paid Successfully',
  //         data: adddeposit,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid Request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }
  
}
