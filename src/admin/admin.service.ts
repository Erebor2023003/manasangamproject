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
  startOfMonth,
} from 'date-fns';
import { Customer } from 'src/customer/schema/customer.schema';
import { depositDetailsDto } from './dto/depositDetails.dto';
import { DepositDetails } from './schema/depositDetails.schema';
import { Deposit } from './schema/deposit.schema';
import { Sangham } from 'src/agent/schema/sangham.schema';
import { depositDto } from './dto/deposit.dto';
import { utcToZonedTime } from 'date-fns-tz';
import { withdrawDto } from './dto/withdraw.dto';
import { Withdraw } from './schema/withdraw.schema';

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
    @InjectModel(Withdraw.name)
    private readonly withdrawModel: Model<Deposit>,
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
        sanghamId: req.sanghamId,
      });
      if (getDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'PodupuDetails of a customer',
          data: getDetails,
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
      // console.log(podupuDetails);
      const createPodupuPromises = podupuDetails.map(async (detail) => {
        const customerStartDate = parse(
          detail.startDate,
          'dd-MM-yyyy',
          new Date(),
        );
        console.log('customerStartDate', customerStartDate);
        const podupuPeriodEnd = addMonths(
          customerStartDate,
          detail.podupuPeriod,
        );
        console.log('podupuPeriodEnd', podupuPeriodEnd);
        console.log(
          getDate(customerStartDate) === getDate(currentDate) &&
            currentDate <= podupuPeriodEnd,
        );
        if (
          getDate(customerStartDate) === getDate(currentDate) &&
          currentDate <= podupuPeriodEnd
        ) {
          console.log(detail);
          const findDetails = await this.customerModel.find({
            sanghamId: detail.sanghamId,
          });
          console.log(findDetails);
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
                // date: {
                //   $gte: lastMonthStartDate,
                //   $lt: customerStartDate, // Exclude the current month's start date
                // },
              })
              .exec();

            lastMonthRecord.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);

              return dateB.getMonth() - dateA.getMonth();
            });
            console.log('lastMonthRecord', lastMonthRecord);
            let fine = 0;

            let totalInterest = 0;
            if (lastMonthRecord.length > 0) {
              if (lastMonthRecord[0].status === 'unpaid') {
                const findSangham = await this.podupudetailsModel.findOne({
                  sanghamId: sanghamData.sanghamId,
                });
                const fineDate = new Date(lastMonthRecord[0].date);
                console.log(fineDate);
                fine = lastMonthRecord[0].fine + findSangham.fine;
              }
              // Calculate interest based on your interest rate logic
              const interestRate = detail.interest / 100; // Replace with your actual interest rate
              const lastMonthInterest =
                interestRate * lastMonthRecord[0].podhupuAmount;
              totalInterest = lastMonthInterest + lastMonthRecord[0].interest;
            }
            console.log('fine', fine);
            console.log('totalInterest', totalInterest);
            const podupuRecord = new this.podupuModel({
              sanghamId: sanghamData.sanghamId,
              customerId: sanghamData.customerId,
              podhupuAmount: detail.monthlyAmount,
              date: currentDate,
              fine,
              interest: totalInterest,
              Total: detail.monthlyAmount + fine,
            });
            // console.log(podupuRecord);
            await podupuRecord.save();
          });

          await Promise.all(createPodupuRecords);
        }
      });

      await Promise.all(createPodupuPromises);
      // return createPodupuPromises
      return {
        statusCode: HttpStatus.OK,
        message: 'Podupus records created successfully.',
        // data: createPodupuPromises
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
      const findPodupuDetails = await this.podupudetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      const currentDate = new Date();
      const startDateString = findPodupuDetails.startDate;
      const [day, month, year] = startDateString.split('-');
      const numericYear = parseInt(year, 10);
      const numericMonth = parseInt(month, 10);
      const podupuDate = new Date(
        Date.UTC(numericYear, numericMonth - 1, +day),
      );
      const podupuonedayLater = podupuDate.getTime() + 24 * 60 * 60 * 1000;
      const podupuextraDay = new Date(podupuonedayLater);
      podupuextraDay.setMonth(currentDate.getMonth());
      console.log(podupuextraDay);
      if (
        podupuDate.getDate() === currentDate.getDate() ||
        podupuextraDay.getDate() === currentDate.getDate()
      ) {
        const findPodhupu = await this.podupuModel.find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        });
        findPodhupu.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          return dateB.getMonth() - dateA.getMonth();
        });
        const parsepodupurecordDate = new Date(findPodhupu[0].date);
        console.log(parsepodupurecordDate);
        console.log(podupuextraDay.getDate() === currentDate.getDate() &&
        podupuextraDay.getMonth() === currentDate.getMonth() &&
        podupuextraDay.getFullYear() === currentDate.getFullYear())
        if (
          (podupuDate.getDate() === currentDate.getDate() &&
          podupuDate.getMonth() === currentDate.getMonth() &&
          podupuDate.getFullYear() === currentDate.getFullYear()) 
          || 
          (podupuextraDay.getDate() === currentDate.getDate() &&
          podupuextraDay.getMonth() === currentDate.getMonth() &&
          podupuextraDay.getFullYear() === currentDate.getFullYear())
        ) {
          if(req.podhupuAmount != (findPodhupu[0].fine + findPodhupu[0].Total)) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "Please pay Correct Amount",
            }
          } else {
            const findPodupuRecord = await this.podupuModel.findOne({podhuId: findPodhupu[0].podhuId});
            if(findPodupuRecord) {
              const updatestatus = await this.podupuModel.updateMany({$and: [{sanghamId: findPodupuRecord.sanghamId},{customerId: findPodupuRecord.customerId}]},{
                $set: {
                  status: "paid"
                }
              });
              const updatedRecord = await this.podupuModel.findOne({podhuId: findPodhupu[0].podhuId});
              return {
                statusCode: HttpStatus.OK,
                message: "Podhupu paid succesfully",
                data: updatedRecord,
              }
            } else {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid podhupuId",
              }
            }
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Podhupu for this month record not found",
          }
        }
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
        sanghamId: req.sanghamId,
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

      if (!findSangham) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Didn't find Sangham",
        };
      }

      if (findSangham.depositLimit < req.depositAmount) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Deposit Amount exceeds the Limit',
        };
      }

      if (!req.depositAmount || req.depositAmount === 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please enter a valid Amount',
        };
      }
      const currentDate = new Date();
      const dateString = findSangham.depositDate;
      const [day, month, year] = dateString.split('-');
      const numericYear = parseInt(year, 10);
      const numericMonth = parseInt(month, 10);

      const depositDate = new Date(
        Date.UTC(numericYear, numericMonth - 1, +day),
      );
      console.log(depositDate);
      const findDepositsOfcustomer = await this.depositModel.find({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      if (findDepositsOfcustomer.length === 0) {
        if (depositDate.getDate() === currentDate.getDate()) {
          const saveFormattedDate = new Date(currentDate);
          const formattedSavingDate = format(
            saveFormattedDate,
            "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
          );
          const createDeposit = await this.depositModel.create({
            sanghamId: req.sanghamId,
            customerId: req.customerId,
            depositAmount: req.depositAmount,
            date: formattedSavingDate,
            interest: 0,
            withdraw: 0,
            total: req.depositAmount,
          });
          return {
            statusCode: HttpStatus.OK,
            message: 'Deposit Paid successfully',
            data: createDeposit,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Deposit for the first time can be paid only on ${findSangham.depositDate}.`,
          };
        }
      } else {
        const oneDayLaterTimestamp =
          depositDate.getTime() + 24 * 60 * 60 * 1000;
        const extraDepositDate = new Date(oneDayLaterTimestamp);
        const currentDay = currentDate.getDate();
        const depositDay = depositDate.getDate();
        const extraDepositDay = extraDepositDate.getDate();

        console.log(currentDay);
        console.log(depositDay);
        console.log(extraDepositDay);

        console.log(currentDay === depositDay);
        console.log(currentDay === extraDepositDay);

        if (currentDay != depositDay && currentDay != extraDepositDay) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message:
              'Deposit can only be paid on the ' +
              `${depositDate.getDate()} ` +
              'or' +
              ` ${extraDepositDay}` +
              ' of every month.',
          };
        } else {
          const findDeposit = await this.depositModel.find({
            $and: [
              { sanghamId: req.sanghamId },
              { customerId: req.customerId },
            ],
          });
          findDeposit.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return dateB.getMonth() - dateA.getMonth();
          });
          console.log('findDeposit', findDeposit);
          const findDepositDate = new Date(findDeposit[0].date);

          if (
            findDepositDate.getDate() === currentDate.getDate() &&
            findDepositDate.getMonth() === currentDate.getMonth() &&
            findDepositDate.getFullYear() === currentDate.getFullYear()
          ) {
            if (findDeposit[0].depositAmount != 0) {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Deposit has been paid on this day',
              };
            } else {
              const updateDepositRecord = await this.depositModel.updateOne(
                { depositId: findDeposit[0].depositId },
                {
                  $set: {
                    depositAmount: req.depositAmount,
                    total: req.depositAmount + findDeposit[0].total,
                  },
                },
              );
              if (updateDepositRecord) {
                const getDepositRecord = await this.depositModel.findOne({
                  depositId: findDeposit[0].depositId,
                });
                return {
                  statusCode: HttpStatus.OK,
                  message: 'Deposit Paid Successfully',
                  data: getDepositRecord,
                };
              } else {
                return {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'Deposit Not Paid Successfully',
                };
              }
            }
          } else {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Invalid Request',
            };
          }
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async depositCron() {
    try {
      const findDeposits = await this.depositModel.find();

      // Create a map to store aggregated deposit amounts for each sanghamId and date
      const aggregatedDeposits = new Map();

      for (const deposit of findDeposits) {
        const findDetails = await this.depositdetailsModel.findOne({
          sanghamId: deposit.sanghamId,
        });

        if (findDetails) {
          const dateString = findDetails.depositDate;

          // console.log(dateString);
          const [day, month, year] = dateString.split('-');
          const numericYear = parseInt(year, 10);
          const numericMonth = parseInt(month, 10);

          const dateObject = new Date(
            Date.UTC(numericYear, numericMonth - 1, +day),
          );
          console.log('dateObject', dateObject);
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().split('T')[0];
          const saveFormattedDate = new Date(formattedDate);
          const formattedSavingDate = format(
            saveFormattedDate,
            "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
          );
          console.log('formattedSavingDate', formattedSavingDate);
          if (!aggregatedDeposits.has(deposit.sanghamId + formattedDate)) {
            aggregatedDeposits.set(deposit.sanghamId + formattedDate, {
              sanghamId: deposit.sanghamId,
              customerId: deposit.customerId,
              date: formattedSavingDate,
              depositAmount: 0,
            });
          }

          // Update the depositAmount for the current sanghamId and formattedDate
          aggregatedDeposits.get(
            deposit.sanghamId + formattedDate,
          ).depositAmount += deposit.depositAmount;
        }
      }

      // Create a single deposit record for each customer
      for (const depositRecord of aggregatedDeposits.values()) {
        // console.log('depositRecord', depositRecord);
        const existingDepositDetails = await this.depositdetailsModel.findOne({
          sanghamId: depositRecord.sanghamId,
          depositDate: depositRecord.date,
        });

        if (!existingDepositDetails) {
          const currentDate = new Date();

          const findDeposit = await this.depositModel.find({
            $and: [
              { sanghamId: depositRecord.sanghamId },
              { customerId: depositRecord.customerId },
            ],
          });
          findDeposit.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return dateB.getMonth() - dateA.getMonth();
          });
          const findDepositDate = new Date(findDeposit[0].date);
          const formattedDate = currentDate.toISOString().split('T')[0];
          console.log('formattedDate', formattedDate);
          const saveFormattedDate = new Date(formattedDate);
          console.log('saveFormattedDate', saveFormattedDate);
          if (
            findDepositDate.getDate() === saveFormattedDate.getDate() &&
            findDepositDate.getMonth() === saveFormattedDate.getMonth() &&
            findDepositDate.getFullYear() === saveFormattedDate.getFullYear()
          ) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Deposit has been paid on this day',
            };
          }

          const lastMonthRecord = await this.depositModel.find({
            sanghamId: depositRecord.sanghamId,
            customerId: depositRecord.customerId,
            // date: {$lt: currentDate}
          });
          lastMonthRecord.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return dateB.getMonth() - dateA.getMonth();
          });
          const findSangham = await this.depositdetailsModel.findOne({
            sanghamId: depositRecord.sanghamId,
          });
          let interest;
          let total;
          let withdraw = 0;
          if (lastMonthRecord.length > 0) {
            let runningTotal = 0;
            lastMonthRecord.forEach((record) => {
              runningTotal += record.depositAmount;
            });
            interest =
              lastMonthRecord[0].interest +
              lastMonthRecord[0].total * (findSangham.interest / 100);
            total = runningTotal + interest - withdraw;
          } else {
            interest = 0;
            total = lastMonthRecord[0].total;
          }
          const createDeposit = await this.depositModel.create({
            sanghamId: depositRecord.sanghamId,
            customerId: depositRecord.customerId,
            date: depositRecord.date,
            depositAmount: 0,
            withdraw,
            interest,
            total,
          });
          console.log(`Record created for ${depositRecord.date}`);
          return createDeposit;
          // Add interest for the previous month
          // Your logic to calculate interest and update depositDetails goes here
          // ...
        } else {
          console.log(`Record already exists for ${depositRecord.date}`);
        }
      }

      // Return a response if needed
      // return {
      //   statusCode: HttpStatus.OK,
      //   message: 'Cron job executed successfully',
      // };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getDepositsOfCustomer(req: depositDto) {
    try {
      const findDepositList = await this.depositModel.find({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      if (findDepositList.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of deposits by customer',
          data: findDepositList,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Didn't found any deposits for this customer",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async depositHistoryList(req: depositDto) {
    try {
      const history = await this.depositModel.find({
        $and: [
          { sanghamId: req.sanghamId },
          { customerId: req.customerId },
          { depositAmount: { $ne: 0 } },
        ],
      });
      if (history.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Deposits history',
          data: history,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Can't found deposits",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // async withdrawDeposit(req: withdrawDto) {
  //   try {
  //     const findDeposit = await this.depositdetailsModel.findOne({
  //       sanghamId: req.sanghamId,
  //     });
  //     const dateString = findDeposit.depositDate;

  //     const [day, month, year] = dateString.split('-');
  //     const numericYear = parseInt(year, 10);
  //     const numericMonth = parseInt(month, 10);

  //     const dateObject = new Date(
  //       Date.UTC(numericYear, numericMonth - 1, +day),
  //     );
  //     const currentDate = new Date();
  //     console.log('dateObject', dateObject.getDate());
  //     console.log('currentDate', currentDate.getDate());
  //     if (dateObject.getDate() === currentDate.getDate()) {
  //       const saveFormattedDate = new Date(currentDate);
  //       const formattedSavingDate = format(
  //         saveFormattedDate,
  //         "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
  //       );
  //       if(!req.amount || req.amount === 0) {
  //         return {
  //           statusCode: HttpStatus.BAD_REQUEST,
  //           message: "Please valid amount to withdraw",
  //         }
  //       }
  //       const lastMonthRecord = await this.depositModel.find({
  //         sanghamId: req.sanghamId,
  //         customerId: req.customerId,
  //       });
  //       lastMonthRecord.sort((a, b) => {
  //         const dateA = new Date(a.date);
  //         const dateB = new Date(b.date);

  //         return dateB.getMonth() - dateA.getMonth();
  //       });
  //       console.log('lastMonthRecord', lastMonthRecord);
  //       // const addWithdraw = await this.withdrawModel.create({
  //       //   amount: req.amount,
  //       //   date: formattedSavingDate,
  //       //   sanghamId: req.sanghamId,
  //       //   customerId: req.customerId,
  //       // });
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Withdraw Added Successfully',
  //         data: lastMonthRecord,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: `Withdraw will be on ${dateObject.getDate()} of every month.`,
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
