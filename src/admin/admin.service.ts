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
import { format } from 'date-fns';
import { Customer } from 'src/customer/schema/customer.schema';
import { depositDetailsDto } from './dto/depositDetails.dto';
import { DepositDetails } from './schema/depositDetails.schema';
import { Deposit } from './schema/deposit.schema';
import { depositDto } from './dto/deposit.dto';
import { withdrawDto } from './dto/withdraw.dto';
import { Withdraw } from './schema/withdraw.schema';
import { SanghamDeposit } from 'src/sanghamdeposits/schema/sanghamdeposit.schema';
import { Sangham } from 'src/agent/schema/sangham.schema';

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
    private readonly withdrawModel: Model<Withdraw>,
    private readonly authService: AuthService,
    @InjectModel(SanghamDeposit.name)
    private readonly sanghamDepositModel: Model<SanghamDeposit>,
    @InjectModel(Sangham.name) private readonly sanghamModel: Model<Sangham>,
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

  async updateAdmin(req: adminDto) {
    try {
      const findAdmin = await this.adminModel.findOne({ emailId: req.emailId });
      let passwords = findAdmin.password;
      const bcryptPassword = await this.authService.hashPassword(req.password);
      const updateAdmin = await this.adminModel.updateOne(
        { password: passwords },
        {
          $set: {
            emailId: req.emailId,
            password: bcryptPassword,
          },
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Updated Succesfully',
        data: updateAdmin,
      };
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
      const getDetails = await this.podupudetailsModel.aggregate([
        { $match: { sanghamId: req.sanghamId } },
        {
          $lookup: {
            from: 'sanghams',
            localField: 'sanghamId',
            foreignField: 'sanghamId',
            as: 'sanghamId',
          },
        },
      ]);
      if (getDetails.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'PodupuDetails of a Sangham',
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

  async updatePodupuDetailsbyId(req: podupuDetailsDto) {
    try {
      const moderate = await this.podupudetailsModel.updateOne(
        { podupuDetailsId: req.podupuDetailsId },
        {
          $set: {
            interest: req.interest,
          },
        },
      );
      if (moderate) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Updated Successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Request',
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
      const customers = await this.customerModel.find();
      // console.log("customers",customers);
      const currentDate = new Date();
      let createdRecords: any = [];
      for (const customerRecord of customers) {
        const findPodhuDetails = await this.podupudetailsModel.findOne({
          sanghamId: customerRecord.sanghamId,
        });
        console.log('findPodhuDetails', findPodhuDetails);
        if (!findPodhuDetails) {
          continue;
        } else {
          const sanghamDetails = await this.sanghamModel.findOne({
            sanghamId: customerRecord.sanghamId,
          });
          if (!sanghamDetails) {
            continue;
          }
          const sanghamEndString = sanghamDetails.endDate;
          const [endDay, endMonth, endYear] = sanghamEndString.split('-');
          const endNumericYear = parseInt(endYear, 10);
          const endNumericMonth = parseInt(endMonth, 10);
          const sanghamEndDate = new Date(
            Date.UTC(endNumericYear, endNumericMonth - 1, +endDay),
          );
          if (
            sanghamEndDate.getDate() <= currentDate.getDate() &&
            sanghamEndDate.getMonth() <= currentDate.getMonth() &&
            sanghamEndDate.getFullYear() <= currentDate.getFullYear()
          ) {
            continue;
          }
          const dateString = findPodhuDetails.startDate;
          const [day, month, year] = dateString.split('-');
          const numericYear = parseInt(year, 10);
          const numericMonth = parseInt(month, 10);

          const depositDate = new Date(
            Date.UTC(numericYear, numericMonth - 1, +day),
          );
          console.log('depositDate', depositDate);
          const podhupuDate = new Date();
          podhupuDate.setDate(depositDate.getDate());
          podhupuDate.setMonth(currentDate.getMonth());
          podhupuDate.setFullYear(currentDate.getFullYear());
          console.log('podhupuDate', podhupuDate);
          if (
            podhupuDate.getDate() === currentDate.getDate() &&
            podhupuDate.getMonth() === currentDate.getMonth() &&
            podhupuDate.getFullYear() === currentDate.getFullYear()
          ) {
            const lastMonthRecords = await this.podupuModel
              .find({
                $and: [
                  { sanghamId: customerRecord.sanghamId },
                  { customerId: customerRecord.customerId },
                ],
              })
              .sort({ createdAt: -1 });
            if (lastMonthRecords.length > 0) {
              const parseLastMonthRecordDate = new Date(
                lastMonthRecords[0].date,
              );
              console.log(parseLastMonthRecordDate);
              if (
                parseLastMonthRecordDate.getDate() === currentDate.getDate() &&
                parseLastMonthRecordDate.getMonth() ===
                  currentDate.getMonth() &&
                parseLastMonthRecordDate.getFullYear() ===
                  currentDate.getFullYear()
              ) {
                return {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'Podhupu Already created',
                };
              }
              let fine;
              let totalInterest;
              let Total;
              if (
                parseLastMonthRecordDate.getDate() === currentDate.getDate() &&
                parseLastMonthRecordDate.getMonth() ===
                  currentDate.getMonth() - 1 &&
                parseLastMonthRecordDate.getFullYear() ===
                  currentDate.getFullYear()
              ) {
                totalInterest =
                  lastMonthRecords[0].interest +
                  (lastMonthRecords[0].Total * findPodhuDetails.interest) / 100;
              } else {
                totalInterest = 0;
              }
              if (lastMonthRecords[0].status === 'unpaid') {
                fine =
                  lastMonthRecords[0].podhupuAmount *
                  (findPodhuDetails.fine / 100);
                Total =
                  findPodhuDetails.monthlyAmount +
                  fine +
                  lastMonthRecords[0].podhupuAmount;
              } else {
                fine = 0;
                Total = findPodhuDetails.monthlyAmount;
              }
              const createPodhupuRecord = await this.podupuModel.create({
                sanghamId: customerRecord.sanghamId,
                customerId: customerRecord.customerId,
                podhupuAmount: findPodhuDetails.monthlyAmount,
                date: currentDate,
                fine,
                interest: totalInterest,
                Total,
                status: 'unpaid',
              });
              if (createPodhupuRecord) {
                createdRecords.push(createPodhupuRecord);
                continue;
              }
            } else {
              const createPodhupuRecord = await this.podupuModel.create({
                sanghamId: customerRecord.sanghamId,
                customerId: customerRecord.customerId,
                podhupuAmount: findPodhuDetails.monthlyAmount,
                date: currentDate,
                fine: 0,
                interest: 0,
                Total: findPodhuDetails.monthlyAmount,
                status: 'unpaid',
              });

              if (createPodhupuRecord) {
                createdRecords.push(createPodhupuRecord);
                continue;
              }
            }
          } else {
            // return `records can't be created`;
            continue;
          }
        }
      }
      return createdRecords;
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
      podupuextraDay.setFullYear(currentDate.getFullYear());
      console.log('podupuextraDay', podupuextraDay);
      if (
        podupuDate.getDate() === currentDate.getDate() ||
        podupuextraDay.getDate() === currentDate.getDate()
      ) {
        const findPodhupu = await this.podupuModel
          .find({
            $and: [
              { sanghamId: req.sanghamId },
              { customerId: req.customerId },
            ],
          })
          .sort({ createdAt: -1 });
        const parsepodupurecordDate = new Date(findPodhupu[0].date);
        console.log('parsepodupurecordDate', parsepodupurecordDate);
        console.log(
          podupuextraDay.getDate() === currentDate.getDate() &&
            podupuextraDay.getMonth() === currentDate.getMonth() &&
            podupuextraDay.getFullYear() === currentDate.getFullYear(),
        );
        console.log(podupuDate.getDate() === currentDate.getDate());
        console.log('podupuDate', podupuDate);
        console.log('podupuextraDay', podupuextraDay);
        console.log('currentDate', currentDate);
        console.log(parsepodupurecordDate.getDate() === podupuDate.getDate());
        console.log(
          podupuextraDay.getDate() === currentDate.getDate() &&
            podupuextraDay.getMonth() === currentDate.getMonth() &&
            podupuextraDay.getFullYear() === currentDate.getFullYear(),
        );
        if (
          podupuDate.getDate() === currentDate.getDate() ||
          (podupuextraDay.getDate() === currentDate.getDate() &&
            podupuextraDay.getMonth() === currentDate.getMonth() &&
            podupuextraDay.getFullYear() === currentDate.getFullYear())
        ) {
          if (findPodhupu[0].status === 'paid') {
            return {
              statusCode: HttpStatus.CONFLICT,
              message: 'Podupu for this month already paid',
            };
          }
          if (req.podhupuAmount != findPodhupu[0].Total) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Please pay Correct Amount',
            };
          } else {
            const findPodupuRecord = await this.podupuModel.findOne({
              podhuId: findPodhupu[0].podhuId,
            });
            if (findPodupuRecord) {
              const updatestatus = await this.podupuModel.updateMany(
                {
                  $and: [
                    { sanghamId: findPodupuRecord.sanghamId },
                    { customerId: findPodupuRecord.customerId },
                  ],
                },
                {
                  $set: {
                    status: 'paid',
                  },
                },
              );
              const updatedRecord = await this.podupuModel.findOne({
                podhuId: findPodhupu[0].podhuId,
              });
              return {
                statusCode: HttpStatus.OK,
                message: 'Podhupu paid succesfully',
                data: updatedRecord,
              };
            } else {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid podhupuId',
              };
            }
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Podhupu for this month record not found',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Podupu can paid on ${podupuDate.getDate()} or ${podupuextraDay.getDate()} of every month.`,
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

  async getPodhupuById(req: podhupuDto) {
    try {
      const details = await this.podupuModel.findOne({ podhuId: req.podhuId });
      if (details) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Podhupu',
          data: details,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Details of podhupu not found',
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
      const podupuBalanceRecords = [];
      findCustomer.map((podupuRecord) => {
        if (podupuRecord.status === 'paid') {
          podupuBalanceRecords.push(podupuRecord);
        }
      });
      console.log(podupuBalanceRecords);
      if (podupuBalanceRecords.length > 0) {
        const balance = podupuBalanceRecords.reduce(
          (accumulator, currentValue) => {
            return accumulator + currentValue.podhupuAmount;
          },
          0,
        );
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

  async searchCustomerPodhupudByDate(req: podhupuDto) {
    try {
      if (req.date) {
        const parsedDate = new Date(req.date);
        // if (parsedDate.getDate() === 1) {
        //   parsedDate.setDate(parsedDate.getDate() + 1);
        //   parsedDate.setMonth(parsedDate.getMonth());
        //   parsedDate.setFullYear(parsedDate.getFullYear());
        // }
        console.log(parsedDate);
        const searchlist = await this.podupuModel.find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        });
        const searchlistfilter = searchlist.filter((record) => {
          const parsedRecordDate = new Date(record.date);
          if (
            parsedRecordDate.getDate() === parsedDate.getDate() &&
            parsedRecordDate.getMonth() === parsedDate.getMonth() &&
            parsedRecordDate.getFullYear() === parsedDate.getFullYear()
          ) {
            return record;
          }
        });
        if (searchlistfilter.length > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Customer Podupu by date',
            data: searchlistfilter,
          };
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Customer Podupu not found on that date',
          };
        }
      } else {
        const searchlist = await this.podupuModel.find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        });
        if (searchlist.length > 0) {
          return {
            statusCode: HttpStatus.OK,
            message: 'List of Podhupu Records',
            data: searchlist,
          };
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not Found podhupu records of this customer',
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

  async podhupuRecentPaid(req: podhupuDto) {
    try {
      const findRecentPaid = await this.podupuModel.aggregate([
        {
          $match: {
            $and: [
              { sanghamId: req.sanghamId },
              { customerId: req.customerId },
              { status: 'paid' },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 1,
        },
      ]);
      if (findRecentPaid.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Recent Paid Podhupu Details',
          data: findRecentPaid,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Recent Paid Podhupu Not Found',
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

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [{ status: 'paid' }, { sanghamId: req.sanghamId }],
            },
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName) {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.podupuModel.aggregate(aggregationPipeline);

        if (paidList.length > 0) {
          if (!req.date) {
            const count = await this.podupuModel
              .find({
                $and: [{ sanghamId: req.sanghamId }, { status: 'paid' }],
              })
              .count();
            return {
              statusCode: HttpStatus.OK,
              message: 'List of paid records',
              totalMembers: totalMembers,
              count: count,
              data: paidList,
            };
          } else {
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;
            const count = filteredpaidList.length;
            return {
              statusCode: HttpStatus.OK,
              message: 'Paid Podhupu',
              totalMembers: totalMembers,
              count: count,
              data: filteredpaidList,
            };
          }
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

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [{ status: 'unpaid' }, { sanghamId: req.sanghamId }],
            },
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName) {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.podupuModel.aggregate(aggregationPipeline);

        if (paidList.length > 0) {
          if (!req.date) {
            const count = await this.podupuModel
              .find({
                $and: [{ sanghamId: req.sanghamId }, { status: 'unpaid' }],
              })
              .count();
            return {
              statusCode: HttpStatus.OK,
              message: 'List of paid records',
              totalMembers: totalMembers,
              count: count,
              data: paidList,
            };
          } else {
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;
            const count = filteredpaidList.length;
            return {
              statusCode: HttpStatus.OK,
              message: 'Unpaid Podhupus',
              totalMembers: totalMembers,
              count: count,
              data: filteredpaidList,
            };
          }
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

  async getSanghamPodhupuBalance(req: podhupuDto) {
    try {
      const balance = await this.podupuModel.find({
        $and: [{ sanghamId: req.sanghamId }, { status: 'paid' }],
      });
      if (balance.length > 0) {
        // Use reduce to sum up podhupuAmount and fine
        const totalAmount = balance.reduce((acc, current) => {
          const podhupuAmount = current.podhupuAmount || 0;
          const fine = current.fine || 0;
          return acc + podhupuAmount + fine;
        }, 0);
        return {
          statusCode: HttpStatus.OK,
          message: 'Sangham Podhupu',
          data: totalAmount,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sangham Podupus Not Found',
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
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Deposit Details of Sangham not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async updateDepositDetailsbyId(req: depositDetailsDto) {
    try {
      const moderate = await this.depositdetailsModel.updateOne(
        { depositDetailsId: req.depositDetailsId },
        {
          $set: {
            interest: req.interest,
          },
        },
      );
      if (moderate) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Updated Successfully',
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid Request',
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
      const depositStartDate = new Date();
      depositStartDate.setDate(depositDate.getDate());
      depositStartDate.setMonth(currentDate.getMonth());
      depositStartDate.setFullYear(currentDate.getFullYear());
      const depositEndDate = new Date();
      depositEndDate.setDate(depositStartDate.getDate() + 1);
      depositEndDate.setMonth(depositStartDate.getMonth());
      depositEndDate.setFullYear(depositStartDate.getFullYear());
      console.log('depositStartDate', depositStartDate);
      console.log('depositEndDate', depositEndDate);
      if (
        (currentDate.getDate() === depositStartDate.getDate() ||
          depositEndDate.getDate()) &&
        (currentDate.getMonth() === depositStartDate.getMonth() ||
          depositEndDate.getMonth()) &&
        (currentDate.getFullYear() === depositStartDate.getFullYear() ||
          depositEndDate.getFullYear())
      ) {
        const findDepositsOfcustomer = await this.depositModel.find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        });
        if (findDepositsOfcustomer.length > 0) {
          const findDeposit = await this.depositModel
            .find({
              $and: [
                { sanghamId: req.sanghamId },
                { customerId: req.customerId },
              ],
            })
            .sort({ createdAt: -1 });
          console.log('findDeposit', findDeposit);
          if (findDeposit[0].total != 0) {
            const dateString = findDeposit[0].date.replace(
              /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
              '',
            );
            const findDepositDate = new Date(dateString);
            console.log(findDepositDate);
            console.log(currentDate);
            console.log(
              findDepositDate.getDate() === currentDate.getDate() &&
                findDepositDate.getMonth() === currentDate.getMonth() &&
                findDepositDate.getFullYear() === currentDate.getFullYear(),
            );
            // console.log();
            if (
              findDepositDate.getDate() === depositStartDate.getDate() &&
              findDepositDate.getMonth() === depositStartDate.getMonth() &&
              findDepositDate.getFullYear() === depositStartDate.getFullYear()
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
          } else {
            const formattedSavingDate = format(
              depositStartDate,
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
          }
        } else {
          const saveFormattedDate = new Date();
          saveFormattedDate.setDate(depositDate.getDate());
          saveFormattedDate.setMonth(currentDate.getMonth());
          saveFormattedDate.setFullYear(currentDate.getFullYear());
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
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Deposit can only be paid on ${depositStartDate.toLocaleDateString()} to ${depositEndDate.toLocaleDateString()}.`,
        };
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

      let createdRecords: any = [];
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
          const monthDate = new Date();
          monthDate.setDate(dateObject.getDate());
          monthDate.setMonth(currentDate.getMonth());
          monthDate.setFullYear(currentDate.getFullYear());
          console.log('monthDate', monthDate);
          console.log('currentDate', currentDate);
          console.log(
            'equalstatus',
            monthDate.getDate() === currentDate.getDate() &&
              monthDate.getMonth() === currentDate.getMonth() &&
              monthDate.getFullYear() === currentDate.getFullYear(),
          );
          if (
            monthDate.getDate() === currentDate.getDate() &&
            monthDate.getMonth() === currentDate.getMonth() &&
            monthDate.getFullYear() === currentDate.getFullYear()
          ) {
            const formattedDate = monthDate.toISOString().split('T')[0];
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
      }

      // Create a single deposit record for each customer
      for (const depositRecord of aggregatedDeposits.values()) {
        console.log('depositRecord', depositRecord);
        const existingDepositDetails = await this.depositdetailsModel.findOne({
          sanghamId: depositRecord.sanghamId,
          depositDate: depositRecord.date,
        });

        if (!existingDepositDetails) {
          const currentDate = new Date();

          const findDeposit = await this.depositModel
            .find({
              $and: [
                { sanghamId: depositRecord.sanghamId },
                { customerId: depositRecord.customerId },
              ],
            })
            .sort({ createdAt: -1 });
          if (findDeposit[0].total === 0) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Deposit Amount has been Withdrawed Completely',
            };
          }
          const findDepositDate = new Date(findDeposit[0].date);
          console.log('findDepositDate', findDepositDate);
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
          if (lastMonthRecord[0].total === 0) {
            continue;
            // return 'Record will be create when the deposit is added';
          }
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
          if (createDeposit) {
            createdRecords.push(createDeposit);
            continue;
          }
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
      return createdRecords;
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

  async getSanghamDepositsbyfilter(req: depositDto) {
    try {
      const podupuList = await this.depositModel.find({
        sanghamId: req.sanghamId,
      });

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          { $match: { sanghamId: req.sanghamId } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName) {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.depositModel.aggregate(aggregationPipeline);
        const count = await this.depositModel
          .find({ sanghamId: req.sanghamId })
          .count();

        if (paidList.length > 0) {
          if (!req.date) {
            return {
              statusCode: HttpStatus.OK,
              message: 'List of deposits',
              count: count,
              data: paidList,
            };
          } else {
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;

            return {
              statusCode: HttpStatus.OK,
              message: 'Deposit List of Sangham',
              count: count,
              data: filteredpaidList,
            };
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found deposit list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any deposits by this sangham',
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

  async depositsWholeBalance(req: depositDto) {
    try {
      const balance = await this.depositModel.find({
        sanghamId: req.sanghamId,
      });
      if (balance.length > 0) {
        // Use reduce to sum up podhupuAmount and fine
        // const totalAmount = balance.reduce((acc, current) => {
        //   const podhupuAmount = current.depositAmount || 0;
        //   const fine = current.interest || 0;
        //   return acc + podhupuAmount + fine;
        // }, 0);
        const separatedArrays = new Map();
        balance.forEach((item) => {
          if (!separatedArrays.has(item.customerId)) {
            separatedArrays.set(item.customerId, []);
          }
          separatedArrays.get(item.customerId).push(item);
        });

        // Step 2: Sort each separated array in reverse order
        separatedArrays.forEach((array) => {
          array.sort((a, b) => b.createdAt - a.createdAt); // Assuming createdAt is the sorting criteria
        });

        // Step 3: Add the first record of each separated array
        let totalAmount = 0;
        separatedArrays.forEach((array) => {
          if (array.length > 0) {
            const firstRecord = array[0];
            totalAmount += firstRecord.total;
          }
        });
        const sanghamdepositbalance = await this.sanghamDepositModel.find({
          sanghamId: req.sanghamId,
        });
        let totalSanghamAmount;
        if (sanghamdepositbalance.length > 0) {
          totalSanghamAmount = sanghamdepositbalance.reduce((acc, current) => {
            const podhupuAmount = current.depositAmount || 0;
            const fine = current.interest || 0;
            return acc + podhupuAmount + fine;
          }, 0);
        } else {
          totalSanghamAmount = 0;
        }
        console.log(totalAmount);
        console.log(totalSanghamAmount);
        return {
          statusCode: HttpStatus.OK,
          message: 'Whole Deposit Balance of Sangham',
          data: totalAmount + totalSanghamAmount,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sangham Deposits Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async withdrawDeposit(req: withdrawDto) {
    try {
      const findsanghamDeposit = await this.depositdetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      const findDeposits = await this.depositModel
        .find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        })
        .sort({ createdAt: -1 });
      // findDeposits.sort((a, b) => {
      //   const dateA = new Date(a.date);
      //   const dateB = new Date(b.date);

      //   return dateB.getMonth() - dateA.getMonth();
      // });
      if (findDeposits[0].total === 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          messsage:
            "Total Deposit Amount has been withdrawn, So can't process your withdraw now",
        };
      }
      const dateString = findsanghamDeposit.depositDate;
      const [day, month, year] = dateString.split('-');
      const numericYear = parseInt(year, 10);
      const numericMonth = parseInt(month, 10);

      const depositDate = new Date(
        Date.UTC(numericYear, numericMonth - 1, +day),
      );
      const currentDate = new Date();
      const withdrawStartDate = new Date();
      withdrawStartDate.setDate(depositDate.getDate());
      withdrawStartDate.setMonth(currentDate.getMonth());
      withdrawStartDate.setFullYear(currentDate.getFullYear());
      const withdrawEndDate = new Date();
      withdrawEndDate.setDate(withdrawStartDate.getDate() + 1);
      console.log(withdrawStartDate);
      console.log(withdrawEndDate);
      console.log(withdrawStartDate <= currentDate);
      console.log(currentDate <= withdrawEndDate);
      console.log(
        withdrawStartDate <= currentDate && currentDate <= withdrawEndDate,
      );
      if (withdrawStartDate <= currentDate && currentDate <= withdrawEndDate) {
        console.log(findDeposits[0]);
        if (req.amount > findDeposits[0].total) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Amount exceed the withdrawable amount',
          };
        }
        if (!req.amount || req.amount === 0) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Enter the valid amount to withdraw',
          };
        }
        const findWithdraw = await this.withdrawModel.find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        });
        findWithdraw.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          return dateB.getMonth() - dateA.getMonth();
        });
        console.log('findWithdraw', findWithdraw);
        if (findWithdraw.length > 0) {
          const withdrawedDate = new Date(findWithdraw[0].date);
          if (withdrawedDate === withdrawStartDate || withdrawEndDate) {
            return {
              statusCode: HttpStatus.CONFLICT,
              message: 'Withdraw has been done for this month',
            };
          } else {
            const withdrawing = await this.withdrawModel.create({
              sanghamId: req.sanghamId,
              customerId: req.customerId,
              amount: req.amount,
              date: withdrawStartDate,
              total: 0,
            });
            if (withdrawing) {
              const updateDeposit = await this.depositModel.updateOne(
                { depositId: findDeposits[0].depositId },
                {
                  $set: {
                    withdraw: req.amount,
                    total: findDeposits[0].total - req.amount,
                  },
                },
              );
              const findWithdrawedDeposit = await this.depositModel.findOne({
                depositId: findDeposits[0].depositId,
              });
              const updateTotal = await this.withdrawModel.updateOne(
                { withdrawId: withdrawing.withdrawId },
                {
                  $set: {
                    total: findWithdrawedDeposit.total,
                  },
                },
              );
              const withdrawDetails = await this.withdrawModel.findOne({
                withdrawId: withdrawing.withdrawId,
              });
              const depositDetails = await this.depositModel.find({
                customerId: req.customerId,
              });
              return {
                statusCode: HttpStatus.OK,
                message: 'Withdraw Successfull',
                data: {
                  amount: withdrawDetails.amount,
                  sanghamId: withdrawDetails.sanghamId,
                  customerId: withdrawDetails.customerId,
                  date: withdrawDetails.date,
                  total: withdrawDetails.total,
                  withdrawId: withdrawDetails.withdrawId,
                  depositAmount: depositDetails[0].depositAmount,
                  interest: findDeposits[0].interest,
                },
              };
            } else {
              return {
                statusCode: HttpStatus.FAILED_DEPENDENCY,
                message: 'Withdraw Failed',
              };
            }
          }
        } else {
          const withdrawing = await this.withdrawModel.create({
            sanghamId: req.sanghamId,
            customerId: req.customerId,
            amount: req.amount,
            date: withdrawStartDate,
            total: 0,
          });
          if (withdrawing) {
            const updateDeposit = await this.depositModel.updateOne(
              { depositId: findDeposits[0].depositId },
              {
                $set: {
                  withdraw: req.amount,
                  total: findDeposits[0].total - req.amount,
                },
              },
            );
            const findWithdrawedDeposit = await this.depositModel.findOne({
              depositId: findDeposits[0].depositId,
            });
            const updateTotal = await this.withdrawModel.updateOne(
              { withdrawId: withdrawing.withdrawId },
              {
                $set: {
                  total: findWithdrawedDeposit.total,
                },
              },
            );
            const withdrawDetails = await this.withdrawModel.findOne({
              withdrawId: withdrawing.withdrawId,
            });
            const depositDetails = await this.depositModel.find({
              customerId: req.customerId,
            });
            return {
              statusCode: HttpStatus.OK,
              message: 'Withdraw Successfull',
              data: {
                amount: withdrawDetails.amount,
                sanghamId: withdrawDetails.sanghamId,
                customerId: withdrawDetails.customerId,
                date: withdrawDetails.date,
                total: withdrawDetails.total,
                withdrawId: withdrawDetails.withdrawId,
                depositAmount: depositDetails[0].depositAmount,
                interest: findDeposits[0].interest,
              },
            };
          } else {
            return {
              statusCode: HttpStatus.FAILED_DEPENDENCY,
              message: 'Withdraw Failed',
            };
          }
        }
      } else {
        return `withdraw can be done only dates ${withdrawStartDate} to ${withdrawEndDate}.`;
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getWithdrawsbycustomer(req: withdrawDto) {
    try {
      const getWithdrawList = await this.withdrawModel.find({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      getWithdrawList.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateA.getMonth() - dateB.getMonth();
      });
      if (getWithdrawList.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Withdraws by Customer',
          data: getWithdrawList,
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No Withdraws found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getSanghamWithdrawsbyfilter(req: withdrawDto) {
    try {
      const podupuList = await this.withdrawModel.find({
        sanghamId: req.sanghamId,
      });

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          { $match: { sanghamId: req.sanghamId } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName) {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.withdrawModel.aggregate(
          aggregationPipeline,
        );
        const count = await this.withdrawModel
          .find({ sanghamId: req.sanghamId })
          .count();

        if (paidList.length > 0) {
          if (!req.date) {
            return {
              statusCode: HttpStatus.OK,
              message: 'List of withdraws',
              count: count,
              data: paidList,
            };
          } else {
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;

            return {
              statusCode: HttpStatus.OK,
              message: 'Withdraw List of Sangham',
              count: count,
              data: filteredpaidList,
            };
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found withdraw list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any withdraws by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getWithdrawById(req: withdrawDto) {
    try {
      const findWithdraw = await this.withdrawModel.findOne({
        withdrawId: req.withdrawId,
      });
      if (findWithdraw) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Withdraw Details',
          data: findWithdraw,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Withdraw Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async podhupuRecovery(req: podhupuDto) {
    try {
      const podupuList = await this.podupuModel.find({
        sanghamId: req.sanghamId,
      });

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [{ status: 'paid' }, { sanghamId: req.sanghamId }],
            },
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName) {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.podupuModel.aggregate(aggregationPipeline);

        if (paidList.length > 0) {
          if (!req.date) {
            const currentDate = new Date();
            let depositRecoveryList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              console.log('...recordDate', recordDate);
              if (
                recordDate.getMonth() === currentDate.getMonth() &&
                recordDate.getFullYear() === currentDate.getFullYear()
              ) {
                depositRecoveryList.push(record);
                continue;
              }
            }
            const count = depositRecoveryList.length;
            if (depositRecoveryList.length > 0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'List of paid records',
                totalMembers: totalMembers,
                count: count,
                data: depositRecoveryList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'No paid podupu records found',
              };
            }
          } else {
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;
            const count = filteredpaidList.length;
            return {
              statusCode: HttpStatus.OK,
              message: 'Paid Podhupu',
              totalMembers: totalMembers,
              count: count,
              data: filteredpaidList,
            };
          }
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

  async podhupuUnRecovery(req: podhupuDto) {
    try {
      const podupuList = await this.podupuModel.find({
        sanghamId: req.sanghamId,
      });

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [{ status: 'unpaid' }, { sanghamId: req.sanghamId }],
            },
          },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName) {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.podupuModel.aggregate(aggregationPipeline);

        if (paidList.length > 0) {
          if (!req.date) {
            const currentDate = new Date();
            let depositRecoveryList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              console.log('...recordDate', recordDate);
              if (
                recordDate.getMonth() === currentDate.getMonth() &&
                recordDate.getFullYear() === currentDate.getFullYear()
              ) {
                depositRecoveryList.push(record);
                continue;
              }
            }
            const count = depositRecoveryList.length;
            if (depositRecoveryList.length > 0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'List of unpaid records',
                totalMembers: totalMembers,
                count: count,
                data: depositRecoveryList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'No unpaid podupu records found',
              };
            }
          } else {
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;
            const count = filteredpaidList.length;
            return {
              statusCode: HttpStatus.OK,
              message: 'Unpaid Podhupu',
              totalMembers: totalMembers,
              count: count,
              data: filteredpaidList,
            };
          }
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

  async depositRecovery(req: depositDto) {
    try {
      const podupuList = await this.depositModel.find({
        sanghamId: req.sanghamId,
      });

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          { $match: { sanghamId: req.sanghamId } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName || req.customerName != ' ') {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.depositModel.aggregate(aggregationPipeline);
        const findProfessions = new Set(
          podupuList.map((record) => record.customerId),
        );
        const count = findProfessions.size;

        if (paidList.length > 0) {
          if (!req.date) {
            const currentDate = new Date();
            let depositRecoveryList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              console.log('...recordDate', recordDate);
              if (
                recordDate.getMonth() === currentDate.getMonth() &&
                recordDate.getFullYear() === currentDate.getFullYear()
              ) {
                depositRecoveryList.push(record);
                continue;
              } else {
                continue;
              }
            }
            if (depositRecoveryList.length > 0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'List of deposits',
                count: count,
                data: depositRecoveryList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Deposits not found this month',
              };
            }
          } else {
            console.log('...parsedDate', parsedDate);
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const dateString = record.date.replace(
                    /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                    '',
                  );
                  const recordDate = new Date(dateString);
                  console.log('....recordDate', recordDate);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;

            if (filteredpaidList.length > 0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Deposit List of Sangham',
                count: count,
                data: filteredpaidList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Deposits not found on this given day',
              };
            }
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found deposit list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any deposits by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async withdrawRecovery(req: withdrawDto) {
    try {
      const podupuList = await this.withdrawModel.find({
        sanghamId: req.sanghamId,
      });

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          { $match: { sanghamId: req.sanghamId } },
          {
            $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'customerId',
              as: 'customer',
            },
          },
        ];

        if (req.customerName || req.customerName != ' ') {
          aggregationPipeline.push({
            $match: {
              'customer.firstName': {
                $regex: new RegExp(req.customerName, 'i'), // Case-insensitive partial match
              },
            },
          } as any);
        }

        const paidList = await this.withdrawModel.aggregate(
          aggregationPipeline,
        );
        const findProfessions = new Set(
          podupuList.map((record) => record.customerId),
        );
        const count = findProfessions.size;

        if (paidList.length > 0) {
          if (!req.date) {
            const currentDate = new Date();
            let depositRecoveryList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              console.log('...recordDate', recordDate);
              if (
                recordDate.getMonth() === currentDate.getMonth() &&
                recordDate.getFullYear() === currentDate.getFullYear()
              ) {
                depositRecoveryList.push(record);
                continue;
              } else {
                continue;
              }
            }
            if (depositRecoveryList.length > 0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'List of withdraws',
                count: count,
                data: depositRecoveryList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Not found withdraws for this month',
              };
            }
          } else {
            console.log('...parsedDate', parsedDate);
            const filteredpaidList = parsedDate
              ? paidList.filter((record) => {
                  const dateString = record.date.replace(
                    /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                    '',
                  );
                  const recordDate = new Date(dateString);
                  console.log('....recordDate', recordDate);
                  return (
                    recordDate.getDate() === parsedDate.getDate() &&
                    recordDate.getMonth() === parsedDate.getMonth() &&
                    recordDate.getFullYear() === parsedDate.getFullYear()
                  );
                })
              : paidList;

            if (filteredpaidList.length > 0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Deposit List of Sangham',
                count: count,
                data: filteredpaidList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Deposits not found on this given day',
              };
            }
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found deposit list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any withdraws by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }
}
