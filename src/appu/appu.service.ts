import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appu } from './schema/appu.schema';
import { Model } from 'mongoose';
import { AppuDetails } from './schema/appudetails.schema';
import { appuDetailsDto } from './dto/appudetails.dto';
import { appuDto } from './dto/appu.dto';
import { Surety } from './schema/surety.schema';
import { suretyDto } from './dto/surety.dto';
import { Customer } from 'src/customer/schema/customer.schema';
import { format } from 'date-fns';
import { every } from 'rxjs';
import { sanghamDto } from 'src/agent/dto/sangham.dto';
import { customerDto } from 'src/customer/dto/customer.dto';
import { AppuStatus, CustomerStatus, Role } from 'src/auth/guards/roles.enum';
import { interest } from './schema/interest.schema';
import { interestDto } from './dto/interest.dto';
import { AgentService } from 'src/agent/agent.service';

@Injectable()
export class AppuService {
  constructor(
    @InjectModel(Appu.name) private readonly appuModel: Model<Appu>,
    @InjectModel(AppuDetails.name)
    private readonly appuDetailsModel: Model<AppuDetails>,
    @InjectModel(Surety.name) private readonly suretyModel: Model<Surety>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(interest.name) private readonly interestModel: Model<interest>,
    private agentService: AgentService,
  ) {}

  async addappuDetails(req: appuDetailsDto) {
    try {
      const findDetails = await this.appuDetailsModel.findOne({
        $and: [{ sanghamId: req.sanghamId, customerId: req.customerId }],
      });
      if (!findDetails) {
        const addDetails = await this.appuDetailsModel.create(req);
        if (addDetails) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Appu Details Added Successfully',
            data: addDetails,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid Request',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Appu Details Already added to this Customer',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getCustomerAppuDetailsBySangham(req: appuDetailsDto) {
    try {
      const getList = await this.appuDetailsModel.find({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      if (getList.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Appu Details of Customer',
          data: getList,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Appu Details not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getCustomerAppuDetails(req: appuDetailsDto) {
    try {
      const findAppus = await this.appuModel
        .find({ customerId: req.customerId })
        .sort({ createdAt: -1 });
      const findSurety = await this.suretyModel.find({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      const suretyIds = findSurety.map((record) => record.suretyId);
      console.log(suretyIds);
      if (findAppus.length > 0) {
        const details = await this.appuDetailsModel.aggregate([
          {
            $match: {
              $and: [
                { sanghamId: req.sanghamId },
                { customerId: req.customerId },
              ],
            },
          },
          {
            $addFields: {
              appuAmount: findAppus[0].appuAmount,
              dueDate: findAppus[0].dueDate,
              surety: suretyIds,
            },
          },
          {
            $lookup: {
              from: 'sureties',
              let: { suretyIds: '$surety' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$suretyId', '$$suretyIds'],
                    },
                  },
                },
              ],
              as: 'surety',
            },
          },
        ]);
        if (details) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Appu Details of customer',
            data: [
              {
                appuDate: findAppus[0].date,
                sanghamId: details[0].sanghamId,
                interest: details[0].interest,
                timePeriod: findAppus[0].timePeriod,
                customerId: details[0].customerId,
                fine: details[0].fine,
                appuDetailsId: details[0].appuDetailsId,
                appuAmount: details[0].appuAmount,
                dueDate: details[0].dueDate,
                surety: details[0].surety,
              },
            ],
          };
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Customer Appu Details Not Found',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No appu found',
        };
      }
      // const details = await this.appuDetailsModel.aggregate([
      //   {
      //     $match: {$and: [
      //       { sanghamId: req.sanghamId },
      //       { customerId: req.customerId },
      //     ]},
      //   },
      //   {
      //     $lookup: {
      //       from: "customers",
      //       localField: "customerId",
      //       foreignField: "customerId",
      //       as: "customerId"
      //     }
      //   }
      // ]);
      // return details;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addSurety(req: suretyDto, image) {
    try {
      // console.log(req, 'documents...', image);
      if (image) {
        const reqDoc = image.map((doc, index) => {
          let IsPrimary = false;
          if (index == 0) {
            IsPrimary = true;
          }
          const randomNumber = Math.floor(Math.random() * 1000000 + 1);
          return doc.filename;
        });

        req.candidateImage = reqDoc.toString();
      }
      const findCustomerSurities = await this.suretyModel.find({
        customerId: req.customerId,
      });
      if (findCustomerSurities.length >= 2) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No more surities accepted as it reaches the maximum number',
        };
      }
      const findSuretyEligibleStatus = await this.customerModel.findOne({
        customerId: req.customerId,
      });
      const findSuretySangham = await this.customerModel.findOne({
        $and: [{ aadharNo: req.aadharNumber }, { mobileNo: req.mobileNumber }],
      });
      const suretyAvail = await this.suretyModel.findOne({
        $and: [
          { aadharNumber: findSuretyEligibleStatus.aadharNo },
          { mobileNumber: findSuretyEligibleStatus.mobileNo },
          { customerId: findSuretySangham.customerId },
        ],
      });
      if (suretyAvail) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Lender has given surety to the Given customer.Please change surety member',
        };
      }
      if (findSuretySangham.sanghamId != req.sanghamId) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Surety accepted within the sangham only',
        };
      }
      const findByAadhar = await this.suretyModel.findOne({
        $and: [
          { sanghamId: req.sanghamId },
          { customerId: req.customerId },
          { aadharNumber: req.aadharNumber },
        ],
      });
      if (findByAadhar) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Candidate Already added as Surety to this customer',
        };
      }
      const findSurety = await this.suretyModel.find({
        aadharNumber: req.aadharNumber,
      });
      if (findSurety.length > 2) {
        let statusArray = [];
        for (const record of findSurety) {
          const findAppuRecords = await this.appuModel
            .find({ customerId: record.customerId })
            .sort({ createdAt: -1 });
          if (findAppuRecords[0].appuStatus === 'pending') {
            statusArray.push(record);
          }
        }
        if (statusArray.length < 2) {
          const findCustomerRecord = await this.customerModel.findOne({
            aadharNumber: req.aadharNumber,
          });
          if (findCustomerRecord) {
            const contactNumber = req.mobileNumber;
            if (
              findCustomerRecord.mobileNo.toString() ===
                contactNumber.toString() &&
              findCustomerRecord.status === CustomerStatus.ACTIVE
            ) {
              const addSurety = await this.suretyModel.create({
                sanghamId: req.sanghamId,
                customerId: req.customerId,
                candidateName: req.candidateName,
                candidateImage: req.candidateImage,
                aadharNumber: req.aadharNumber,
                mobileNumber: req.mobileNumber,
                candidateId: findCustomerRecord.customerId,
              });
              if (addSurety) {
                return {
                  statusCode: HttpStatus.OK,
                  message: 'Surety Added Succesfully',
                  data: addSurety,
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
                message: 'FingerPrint is not matched',
              };
            }
          } else {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                "Candidate is not registered as Customer, So can't able to add as surety",
            };
          }
        } else {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Surety can be given only two persons at a time',
          };
        }
      } else {
        const findCustomerRecord = await this.customerModel.findOne({
          aadharNo: req.aadharNumber,
        });
        // console.log("findCustomerRecord",findCustomerRecord);
        if (findCustomerRecord) {
          const contactNumber = req.mobileNumber;
          console.log(findCustomerRecord.mobileNo);
          console.log(contactNumber);
          if (
            findCustomerRecord.mobileNo.toString() ===
              contactNumber.toString() &&
            findCustomerRecord.status === CustomerStatus.ACTIVE
          ) {
            const addSurety = await this.suretyModel.create({
              sanghamId: req.sanghamId,
              customerId: req.customerId,
              candidateName: req.candidateName,
              candidateImage: req.candidateImage,
              aadharNumber: req.aadharNumber,
              mobileNumber: req.mobileNumber,
              candidateId: findCustomerRecord.customerId,
            });
            if (addSurety) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Surety Added Succesfully',
                data: addSurety,
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
              message: 'Mobile Number is not matched',
            };
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message:
              "Candidate is not registered as Customer, So can't able to add as surety",
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

  async suretyNext(req: suretyDto) {
    try {
      const findSureties = await this.suretyModel.find({
        customerId: req.customerId,
      });
      if (findSureties.length >= 2) {
        return {
          statusCode: HttpStatus.OK,
          message: 'success appu can be processed soon',
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Can't proceed the appu please add sureties that are needed",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async addAppu(req: appuDto) {
    try {
      const sanghamData: sanghamDto = {
        sanghamId: req.sanghamId,
        customerId: '',
        agentId: '',
        sanghamName: '',
        rateOfInterestPodupu: 0,
        rateOfInterestAppu: 0,
        rateOfInterestDeposit: 0,
        rateOfInterestPodupuFine: 0,
        startDate: '',
        endDate: '',
        longitude: '',
        latitude: '',
        address: '',
        customersLimit: 0,
      };
      const availExceedAppu =
        await this.agentService.getSanghamAvailableBalance(sanghamData);
      console.log('available balance response', availExceedAppu);
      if (req.appuAmount > availExceedAppu.data.availableBalance) {
        console.log('please enter the available amount');
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please enter the amount that was available in sangham',
          availableAmount: availExceedAppu.data.availableBalance,
        };
      }

      const customerAppus = await this.appuModel
        .find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        })
        .sort({ createdAt: -1 });

      const findAppu = await this.appuDetailsModel.findOne({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      console.log(findAppu);
      const dateString = findAppu.appuDate;
      const [day, month, year] = dateString.split('-');
      const numericYear = parseInt(year, 10);
      const numericMonth = parseInt(month, 10);
      const parsedDate = new Date(
        Date.UTC(numericYear, numericMonth - 1, +day),
      );
      const currentDate = new Date();
      const appuStartDate = new Date();
      appuStartDate.setDate(parsedDate.getDate());
      appuStartDate.setMonth(currentDate.getMonth());
      appuStartDate.setFullYear(currentDate.getFullYear());
      const appuEndDate = new Date();
      appuEndDate.setDate(appuStartDate.getDate() + 1);
      appuEndDate.setMonth(currentDate.getMonth());
      appuEndDate.setFullYear(currentDate.getFullYear());
      console.log('appuStartDate', appuStartDate);
      console.log('appuEndDate', appuEndDate);
      if (req.timePeriod > findAppu.timePeriod) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Please Enter Time Period Lessthan or Equal ${findAppu.timePeriod}.`,
        };
      }
      if (
        (currentDate.getDate() === appuStartDate.getDate() ||
          currentDate.getDate() === appuEndDate.getDate()) &&
        (currentDate.getMonth() === appuStartDate.getMonth() ||
          currentDate.getMonth() === appuEndDate.getMonth()) &&
        (currentDate.getFullYear() === appuStartDate.getFullYear() ||
          currentDate.getFullYear() === appuEndDate.getFullYear())
      ) {
        if (customerAppus.length > 0) {
          if (customerAppus[0].appuStatus === 'recovered') {
            const findSurety = await this.suretyModel.find({
              $and: [
                { customerId: req.customerId },
                { sanghamId: req.sanghamId },
              ],
            });
            console.log('findSurety', findSurety);
            if (findSurety.length != 2) {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Surety Members should be two members',
              };
            } else {
              const formattedSavingDate = format(
                appuStartDate,
                "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
              );
              // const dueDate = new Date();
              // dueDate.setDate(appuStartDate.getDate());
              // dueDate.setMonth(currentDate.getMonth() + req.timePeriod);

              console.log('.......dueDate', req.dueDate);
              const duedateString = req.dueDate;
              const [dueday, duemonth, dueyear] = duedateString.split('-');
              const duenumericYear = parseInt(dueyear, 10);
              const duenumericMonth = parseInt(duemonth, 10);
              const dueparsedDate = new Date(
                Date.UTC(duenumericYear, duenumericMonth - 1, +dueday),
              );
              console.log('.....dueparsedDate', dueparsedDate);
              const formattedDueDate = format(
                dueparsedDate,
                "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
              );

              const addAppu = await this.appuModel.create({
                sanghamId: req.sanghamId,
                customerId: req.customerId,
                appuAmount: req.appuAmount,
                timePeriod: req.timePeriod,
                interest: 0,
                fine: 0,
                paidAmount: 0,
                total: req.appuAmount,
                date: formattedSavingDate,
                dueDate: formattedDueDate,
              });
              if (addAppu) {
                const otp = Math.floor(1000 + Math.random() * 9000).toString();
                const addOtp = await this.customerModel.updateOne(
                  { customerId: req.customerId },
                  {
                    $set: {
                      otp: otp,
                    },
                  },
                );
                return {
                  statusCode: HttpStatus.OK,
                  message: 'Appu Has been added',
                  data: addAppu,
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
              statusCode: HttpStatus.BAD_REQUEST,
              message:
                'Appu cannot be sanction until the present appu has been cleared',
            };
          }
        } else {
          const findSurety = await this.suretyModel.find({
            $and: [
              { customerId: req.customerId },
              { sanghamId: req.sanghamId },
            ],
          });
          console.log('findSurety', findSurety);
          if (findSurety.length != 2) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Surety Members should be two members',
            };
          } else {
            const formattedSavingDate = format(
              appuStartDate,
              "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
            );
            // const dueDate = new Date();
            // dueDate.setDate(appuStartDate.getDate());
            // dueDate.setMonth(currentDate.getMonth() + req.timePeriod);

            // console.log('....dueDate', req.dueDate);
            console.log('.......dueDate', req.dueDate);
            const duedateString = req.dueDate;
            const [dueday, duemonth, dueyear] = duedateString.split('-');
            const duenumericYear = parseInt(dueyear, 10);
            const duenumericMonth = parseInt(duemonth, 10);
            const dueparsedDate = new Date(
              Date.UTC(duenumericYear, duenumericMonth - 1, +dueday),
            );
            const formattedDueDate = format(
              dueparsedDate,
              "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)",
            );
            console.log('.....dueparsedDate', dueparsedDate);
            console.log('.....formattedDate', formattedDueDate);
            const addAppu = await this.appuModel.create({
              sanghamId: req.sanghamId,
              customerId: req.customerId,
              appuAmount: req.appuAmount,
              timePeriod: req.timePeriod,
              interest: 0,
              fine: 0,
              paidAmount: 0,
              total: req.appuAmount,
              date: formattedSavingDate,
              dueDate: formattedDueDate,
            });
            if (addAppu) {
              const otp = Math.floor(1000 + Math.random() * 9000).toString();
              const addOtp = await this.customerModel.updateOne(
                { customerId: req.customerId },
                {
                  $set: {
                    otp: otp,
                  },
                },
              );
              return {
                statusCode: HttpStatus.OK,
                message: 'Appu Has been added',
                data: addAppu,
              };
            } else {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid Request',
              };
            }
          }
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `appu will be given only on ${appuStartDate.getDate()} to ${appuEndDate.getDate()} of any month for the first time`,
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async approveAppu(req: customerDto) {
    try {
      const findCustomer = await this.customerModel.findOne({
        customerId: req.customerId,
      });
      if (findCustomer) {
        let otp_string = req.otp.toString();
        if (otp_string === '1234') {
          const findAppus = await this.appuModel
            .find({
              $and: [
                { sanghamId: findCustomer.sanghamId },
                { customerId: findCustomer.customerId },
              ],
            })
            .sort({ createdAt: -1 });
          if (findAppus.length > 0) {
            const updateStatus = await this.appuModel.updateOne(
              { appuId: findAppus[0].appuId },
              {
                $set: {
                  approveStatus: 'approved',
                },
              },
            );
            if (updateStatus) {
              const findAppu = await this.appuModel.findOne({
                appuId: findAppus[0].appuId,
              });
              return {
                statusCode: HttpStatus.OK,
                message: 'Appu Approved Successfully',
                data: findAppu,
              };
            } else {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Appu Not Approved',
              };
            }
          } else {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Appu does not Approved',
            };
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid Otp',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Customer Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async blockCustomerDefault() {
    try {
      const findAppus = await this.appuModel.find();
      const recordsByCustomerId = [];
      let blockedCustomers = [];
      for (const appuRecord of findAppus) {
        const { customerId } = appuRecord;

        if (!recordsByCustomerId[customerId]) {
          recordsByCustomerId[customerId] = [];
        }

        recordsByCustomerId[customerId].push(appuRecord);
        // recordsByCustomerId[customerId].sort({createdAt: -1})
      }

      // Convert object to array of arrays
      const arrayOfArrays = Object.values(recordsByCustomerId);
      for (const customerArray of arrayOfArrays) {
        for (const customerRecord of customerArray) {
          // const dateString =
          const finalDate = customerRecord.dueDate.replace(
            /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
            '',
          );
          const customerDueDate = new Date(finalDate);
          const currentDate = new Date();
          console.log('......customerDueDate', customerDueDate);
          console.log('......currentDate', currentDate);
          console.log(
            'dateEqual',
            customerDueDate.getDate() === currentDate.getDate() - 1,
          );
          console.log(
            'monthequal',
            customerDueDate.getMonth(),
            currentDate.getMonth(),
          );
          console.log(
            'YearEqual',
            customerDueDate.getFullYear() === currentDate.getFullYear(),
          );
          console.log(
            'equalstatus',
            customerDueDate.getDate() === currentDate.getDate() - 1 &&
              customerDueDate.getMonth() === currentDate.getMonth() &&
              customerDueDate.getFullYear() === currentDate.getFullYear(),
          );
          if (
            customerDueDate.getDate() === currentDate.getDate() - 1 &&
            customerDueDate.getMonth() === currentDate.getMonth() &&
            customerDueDate.getFullYear() === currentDate.getFullYear()
          ) {
            const getAppuRecords = await this.appuModel
              .find({ customerId: customerRecord.customerId })
              .sort({ createdAt: -1 });
            console.log('getAppuRecords', getAppuRecords);
            if (getAppuRecords[0].total != 0) {
              console.log('customerId', getAppuRecords[0]);
              const blockCustomer = await this.customerModel.updateOne(
                { customerId: customerRecord.customerId },
                {
                  $set: {
                    status: CustomerStatus.BLOCK,
                  },
                },
              );
              if (blockCustomer) {
                const findBlockedCustomer = await this.customerModel.findOne({
                  customerId: customerRecord.customerId,
                });
                blockedCustomers.push(findBlockedCustomer);
                break;
              } else {
                continue;
              }
            } else {
              continue;
            }
          } else {
            continue;
          }
        }
        continue;
      }
      return blockedCustomers;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async appuCron() {
    try {
      const findAppus = await this.appuModel.find();
      const aggregatedDeposits = new Map();

      for (const deposit of findAppus) {
        if (deposit.approveStatus === 'approved') {
          const findDetails = await this.appuDetailsModel.findOne({
            $and: [
              { sanghamId: deposit.sanghamId },
              { customerId: deposit.customerId },
            ],
          });
          if (findDetails) {
            const dateString = findDetails.appuDate;

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
                  appuAmount: deposit.appuAmount,
                  dueDate: deposit.dueDate,
                  timePeriod: deposit.timePeriod,
                  approveStatus: deposit.approveStatus,
                });
              }

              // Update the depositAmount for the current sanghamId and formattedDate
              aggregatedDeposits.get(
                deposit.sanghamId + formattedDate,
              ).appuAmount = deposit.appuAmount;
            } else {
              // return `Record can be created only on ${monthDate.getDate()} on every month.`;
              continue;
            }
          }
        } else {
          continue;
          // return 'No records are approved';
        }
      }
      let createdRecords: any = [];
      for (const depositRecord of aggregatedDeposits.values()) {
        console.log('depositRecord', depositRecord);
        const existingDepositDetails = await this.appuDetailsModel.findOne({
          sanghamId: depositRecord.sanghamId,
          customerId: depositRecord.customerId,
          depositDate: depositRecord.date,
        });

        if (!existingDepositDetails) {
          const currentDate = new Date();

          const findDeposit = await this.appuModel
            .find({
              $and: [
                { sanghamId: depositRecord.sanghamId },
                { customerId: depositRecord.customerId },
              ],
            })
            .sort({ createdAt: -1 });
          if (findDeposit[0].appuStatus === 'recovered') {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Appu Amount has been paid Completely',
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
            // return {
            //   statusCode: HttpStatus.BAD_REQUEST,
            //   message: 'Appu has been paid on this day',
            // };
            continue;
          }
          const lastMonthRecord = await this.appuModel
            .find({
              sanghamId: depositRecord.sanghamId,
              customerId: depositRecord.customerId,
              // date: {$lt: currentDate}
            })
            .sort({ createdAt: -1 });
          if (lastMonthRecord[0].total === 0) {
            // return 'Record will be create when the Appu is added';
            continue;
          }
          const findCustomerAppu = await this.appuDetailsModel.findOne({
            $and: [
              { sanghamId: depositRecord.sanghamId },
              { customerId: depositRecord.customerId },
            ],
          });
          let interest;
          let fine;
          if (lastMonthRecord.length > 0) {
            if (lastMonthRecord[0].interest != 0) {
              interest =
                lastMonthRecord[0].interest +
                lastMonthRecord[0].total * (findCustomerAppu.interest / 100);
              fine =
                lastMonthRecord[0].fine +
                lastMonthRecord[0].interest * (findCustomerAppu.fine / 100);
            } else {
              interest =
                lastMonthRecord[0].total * (findCustomerAppu.interest / 100);
              fine = 0;
            }
          } else {
            interest = 0;
            fine = 0;
          }
          console.log('....fine', fine);
          const addAppuRecord = await this.appuModel.create({
            sanghamId: depositRecord.sanghamId,
            customerId: depositRecord.customerId,
            appuAmount: depositRecord.appuAmount,
            paidAmount: 0,
            interest: interest,
            fine: fine,
            total: depositRecord.appuAmount + interest + fine,
            date: depositRecord.date,
            dueDate: depositRecord.dueDate,
            timePeriod: depositRecord.timePeriod,
            approveStatus: depositRecord.approveStatus,
          });

          console.log(`Record created for ${depositRecord.date}`);
          if (addAppuRecord) {
            createdRecords.push(addAppuRecord);
            continue;
          }
          // return addAppuRecord;
          // Add interest for the previous month
          // Your logic to calculate interest and update depositDetails goes here
          // ...
        } else {
          console.log(`Record already exists for ${depositRecord.date}`);
          continue;
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

  async appuRecentPaid(req: appuDto) {
    try {
      const findRecentPaid = await this.appuModel.aggregate([
        {
          $match: {
            $and: [
              { sanghamId: req.sanghamId },
              { customerId: req.customerId },
              { paidAmount: { $ne: 0 } },
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
        const appuRecords = await this.appuModel
          .find({ customerId: req.customerId })
          .sort({ createdAt: -1 });
        const indexOfPaid = appuRecords.findIndex(
          (record) => record.appuId === findRecentPaid[0].appuId,
        );
        const nextRecordAfterPaid = appuRecords[indexOfPaid + 1];
        console.log('nextRecordAfterPaid', nextRecordAfterPaid);
        const findCustomerAppu = await this.appuDetailsModel.findOne({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        });
        let paidInterest;
        let paidFine;
        if (nextRecordAfterPaid.paidAmount === 0) {
          paidInterest =
            nextRecordAfterPaid.interest +
            nextRecordAfterPaid.total * (findCustomerAppu.interest / 100);
          paidFine =
            nextRecordAfterPaid.fine +
            nextRecordAfterPaid.interest * (findCustomerAppu.fine / 100);
        } else {
          paidInterest =
            nextRecordAfterPaid.total * (findCustomerAppu.interest / 100);
          paidFine = 0;
        }
        return {
          statusCode: HttpStatus.OK,
          message: 'Recent Paid Appu Details',
          data: [
            {
              sanghamId: findRecentPaid[0].sanghamId,
              customerId: findRecentPaid[0].customerId,
              appuAmount: nextRecordAfterPaid.appuAmount,
              interest: paidInterest,
              fine: paidFine,
              paidAmount: findRecentPaid[0].paidAmount,
              total: findRecentPaid[0].total,
              date: findRecentPaid[0].date,
              timePeriod: findRecentPaid[0].timePeriod,
              appuStatus: findRecentPaid[0].appuStatus,
              dueDate: findRecentPaid[0].dueDate,
              approveStatus: findRecentPaid[0].approveStatus,
              appuId: findRecentPaid[0].appuId,
            },
          ],
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Recent Paid Appu Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async payAppu(req: appuDto) {
    try {
      const findAppuDetails = await this.appuDetailsModel.findOne({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      if (findAppuDetails) {
        const currentDate = new Date();
        const dateString = findAppuDetails.appuDate;
        const [day, month, year] = dateString.split('-');
        const numericYear = parseInt(year, 10);
        const numericMonth = parseInt(month, 10);

        const loanDate = new Date(
          Date.UTC(numericYear, numericMonth - 1, +day),
        );
        console.log('loanDate', loanDate);
        const appuStartDate = new Date();
        appuStartDate.setDate(loanDate.getDate());
        appuStartDate.setMonth(currentDate.getMonth());
        const appuEndDate = new Date();
        appuEndDate.setDate(appuStartDate.getDate() + 1);
        console.log('appuStartDate', appuStartDate);
        console.log('appuEndDate', appuEndDate);
        const findAppu = await this.appuModel
          .find({
            $and: [
              { sanghamId: req.sanghamId },
              { customerId: req.customerId },
            ],
          })
          .sort({ createdAt: -1 });
        if (findAppu.length > 0) {
          const dateString = findAppu[0].date.replace(
            /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
            '',
          );
          const appuFirstRecordDate = new Date(dateString);
          console.log('appuFirstRecordDate', appuFirstRecordDate);
          if (
            appuStartDate.getDate() <= currentDate.getDate() &&
            currentDate.getDate() <= appuEndDate.getDate()
          ) {
            if (appuFirstRecordDate.getDate() === appuStartDate.getDate()) {
              if (req.paidAmount === 0 || !req.paidAmount) {
                return {
                  statuscode: HttpStatus.NOT_ACCEPTABLE,
                  message: 'Enter Valid Amount',
                };
              }
              if (
                findAppu[0].interest === 0 &&
                findAppu[0].fine === 0 &&
                findAppu[0].paidAmount != 0
              ) {
                return {
                  statusCode: HttpStatus.CONFLICT,
                  message: 'This month appu has been paid Already',
                };
              }
              if (findAppu[0].total === 0) {
                return {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: 'Your appu has been already recovered',
                };
              }
              let interest;
              let appuTotal;
              let fine;
              let remainingAmount =
                req.paidAmount - findAppu[0].interest - findAppu[0].fine;
              let grandTotal;
              if (req.paidAmount >= findAppu[0].interest + findAppu[0].fine) {
                interest = 0;
                appuTotal = findAppu[0].appuAmount - remainingAmount;
                fine = 0;
                grandTotal =
                  findAppu[0].total -
                  findAppu[0].interest -
                  findAppu[0].fine -
                  remainingAmount;
              } else {
                return {
                  statusCode: HttpStatus.NOT_ACCEPTABLE,
                  message: 'Please pay total interest',
                };
              }
              console.log('interest', interest);
              console.log('appuTotal', appuTotal);
              console.log('fine', fine);
              console.log('remainingAmount', remainingAmount);
              console.log('grandTotal', grandTotal);
              const payamount = await this.appuModel.updateOne(
                { appuId: findAppu[0].appuId },
                {
                  $set: {
                    paidAmount: req.paidAmount,
                    interest: interest,
                    fine: fine,
                    appuAmount: appuTotal,
                    total: grandTotal,
                  },
                },
              );
              if (payamount) {
                const findAppuRecord = await this.appuModel.findOne({
                  appuId: findAppu[0].appuId,
                });
                if (findAppuRecord.total === 0) {
                  const updateAppu = await this.appuModel.updateMany(
                    {
                      $and: [
                        { sanghamId: req.sanghamId },
                        { customerId: req.customerId },
                      ],
                    },
                    {
                      $set: { appuStatus: AppuStatus.RECOVERED },
                    },
                  );
                  const findSurites = await this.suretyModel.find({
                    $and: [
                      { sanghamId: req.sanghamId },
                      { customerId: req.customerId },
                    ],
                  });
                  for (const surety of findSurites) {
                    const deleteSurety = await this.suretyModel.deleteOne({
                      suretyId: surety.suretyId,
                    });
                  }
                }
                return {
                  statusCode: HttpStatus.OK,
                  message: 'Appu Paid Successfully',
                  data: {
                    sanghamId: findAppuRecord.sanghamId,
                    customerId: findAppuRecord.customerId,
                    appuAmount: findAppu[0].appuAmount,
                    interest: findAppu[0].interest,
                    fine: findAppu[0].fine,
                    paidAmount: findAppuRecord.paidAmount,
                    total: findAppuRecord.total,
                    date: findAppuRecord.date,
                    timePeriod: findAppuRecord.timePeriod,
                    appuStatus: findAppuRecord.appuStatus,
                    dueDate: findAppuRecord.dueDate,
                    approveStatus: findAppuRecord.approveStatus,
                    appuId: findAppuRecord.appuId,
                  },
                };
              }
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Appu Record does not created',
              };
            }
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: "Customer doesn't have appu",
          };
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Didn't found appu details, please contact admin",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getCustomerAppuById(req: appuDto) {
    try {
      const getAppu = await this.appuModel.findOne({ appuId: req.appuId });
      if (getAppu) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Appu Details of Customer',
          data: getAppu,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Appu Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async searchAppuByDate(req: appuDto) {
    try {
      if (req.date) {
        const parsedDate = new Date(req.date);
        // if (parsedDate.getDate() === 1) {
        //   parsedDate.setDate(parsedDate.getDate() + 1);
        //   parsedDate.setMonth(parsedDate.getMonth());
        //   parsedDate.setFullYear(parsedDate.getFullYear());
        // }
        console.log(parsedDate);
        const searchlist = await this.appuModel.find({
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
        const searchlist = await this.appuModel.find({
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

  async appuRecoveredList(req: appuDto) {
    try {
      const podupuList = await this.appuModel.find({
        sanghamId: req.sanghamId,
      });

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalAppuMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [
                { paidAmount: { $ne: 0 } },
                { interest: 0 },
                { sanghamId: req.sanghamId },
              ],
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
          {
            $addFields: {
              paidStatus: 'paid',
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

        const paidList = await this.appuModel.aggregate(aggregationPipeline);

        if (paidList.length > 0) {
          if (!req.date) {
            const count = await this.appuModel
              .find({
                $and: [
                  { sanghamId: req.sanghamId },
                  { interest: 0 },
                  { paidAmount: { $ne: 0 } },
                ],
              })
              .count();
            return {
              statusCode: HttpStatus.OK,
              message: 'List of Appu recovered records',
              totalAppuMembers: totalAppuMembers,
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
              message: 'Paid Appu List',
              totalAppuMembers: totalAppuMembers,
              count: count,
              data: filteredpaidList,
            };
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found appu paid list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any appu records by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async appuPendingList(req: appuDto) {
    try {
      const podupuList = await this.appuModel.find({
        sanghamId: req.sanghamId,
      });
      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalAppuMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [
                { paidAmount: 0 },
                { interest: { $ne: 0 } },
                { sanghamId: req.sanghamId },
              ],
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
          {
            $addFields: {
              paidStatus: 'unpaid',
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

        const paidList = await this.appuModel.aggregate(aggregationPipeline);

        if (paidList.length > 0) {
          if (!req.date) {
            const count = await this.appuModel
              .find({
                $and: [
                  { sanghamId: req.sanghamId },
                  { interest: { $ne: 0 } },
                  { paidAmount: 0 },
                ],
              })
              .count();
            return {
              statusCode: HttpStatus.OK,
              message: 'List of Appu Pending records',
              count: count,
              totalAppuMembers: totalAppuMembers,
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
              message: 'Pending Appu List',
              count: count,
              totalAppuMembers: totalAppuMembers,
              data: filteredpaidList,
            };
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found unpaid appu list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any appu records by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async appuCustomerBalance(req: appuDto) {
    try {
      const findAppu = await this.appuModel
        .find({
          $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
        })
        .sort({ createdAt: -1 });
      if (findAppu.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Balance Appu of the customer',
          data: findAppu[0].total,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          messagage: 'Unable to found balance',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async resendOtpToCustomer(req: customerDto) {
    try {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const addOtp = await this.customerModel.updateOne(
        { customerId: req.customerId },
        {
          $set: {
            otp: otp,
          },
        },
      );
      if (addOtp) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Otp sent successfully',
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

  async addInterest(req: interestDto) {
    try {
      const findInterests = await this.interestModel.find();
      if (findInterests.length >= 1) {
        return {
          statuscode: HttpStatus.BAD_REQUEST,
          message: 'Interest already added',
        };
      }
      const interestRate = await this.interestModel.create(req);
      if (interestRate) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Interest added successfully',
          data: interestRate,
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'send request properly',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getInterestlist() {
    try {
      const getlist = await this.interestModel.find();
      if (getlist.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'list of interests',
          data: getlist,
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Didn't found interests list",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getInterestbyid(req: interestDto) {
    try {
      const getinterest = await this.interestModel.findOne({
        interestId: req.interestId,
      });
      if (getinterest) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Interest Details',
          data: getinterest,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Interest not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: error,
      };
    }
  }

  async updateInterestById(req: interestDto) {
    try {
      const moderate = await this.interestModel.updateOne(
        { interestId: req.interestId },
        {
          $set: {
            interest: req.interest,
          },
        },
      );
      if (moderate) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Interest updated successfully',
          data: moderate,
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

  async appupaidRecovery(req: appuDto) {
    try {
      const podupuList = await this.appuModel.find({
        sanghamId: req.sanghamId,
      });

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalAppuMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [{ sanghamId: req.sanghamId }],
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
          {
            $addFields: {
              paidStatus: 'paid',
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

        const paidList = await this.appuModel.aggregate(aggregationPipeline);
        // console.log('...paidList', paidList);
        if (paidList.length > 0) {
          if (!req.date || req.date == " ") {
            const currentDate = new Date();
            const filteredpaidList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              // const findDepositDate = new Date(dateString);
              const recordDate = new Date(dateString);
              // console.log("...recordDate", recordDate);
              if (
                recordDate.getMonth() === currentDate.getMonth() &&
                recordDate.getFullYear() === recordDate.getFullYear()
              ) {
                const customerRecords = await this.appuModel.find({
                  customerId: record.customerId,
                });
                console.log("customerRecords", customerRecords);
                if (customerRecords.length > 1) {
                  if (record.paidAmount != 0) {
                    filteredpaidList.push(record);
                    continue;
                  } else {
                    continue;
                  }
                } else if(customerRecords.length == 0) {
                  continue;
                } else {
                  filteredpaidList.push(record);
                  continue;
                }
              }
            }
            const count = filteredpaidList.length;

            if(filteredpaidList.length>0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Paid Appu List',
                totalAppuMembers: totalAppuMembers,
                count: count,
                data: filteredpaidList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: "Paid appu records not found for this month",
              }
            }
          } else {
            // const currentDate = new Date(req.date);
            console.log("...currentDate", parsedDate);
            const filteredpaidList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              if (
                recordDate.getDate() === parsedDate.getDate() &&
                recordDate.getMonth() === parsedDate.getMonth() &&
                recordDate.getFullYear() === parsedDate.getFullYear()
              ) {
                const customerRecords = await this.appuModel.find({
                  customerId: record.customerId,
                });
                console.log("customerRecords", customerRecords);
                if (customerRecords.length > 1) {
                  if (record.paidAmount != 0) {
                    filteredpaidList.push(record);
                    continue;
                  } else {
                    continue;
                  }
                } else if(customerRecords.length == 0) {
                  continue;
                } else {
                  filteredpaidList.push(record);
                  continue;
                }
              }
            }
            const count = filteredpaidList.length;

            if(filteredpaidList.length>0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Paid Appu List',
                totalAppuMembers: totalAppuMembers,
                count: count,
                data: filteredpaidList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: "Paid appu records not found for this given date",
              }
            }
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found appu paid list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any appu records by this sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async appuunpaidRecovery(req: appuDto) {
    try {
      const podupuList = await this.appuModel.find({
        sanghamId: req.sanghamId,
      });

      const findProfessions = new Set(
        podupuList.map((record) => record.customerId),
      );
      const totalAppuMembers = findProfessions.size;

      if (podupuList.length > 0) {
        const parsedDate = req.date ? new Date(req.date) : null;

        const aggregationPipeline: any[] = [
          {
            $match: {
              $and: [{ sanghamId: req.sanghamId }],
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
          {
            $addFields: {
              paidStatus: 'unpaid',
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

        const paidList = await this.appuModel.aggregate(aggregationPipeline);
        if (paidList.length > 0) {
          if (!req.date || req.date === " ") {
            const currentDate = new Date();
            const filteredpaidList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              // console.log("...recordDate", recordDate);
              if (
                recordDate.getMonth() === currentDate.getMonth() &&
                recordDate.getFullYear() === currentDate.getFullYear()
              ) {
                const customerRecords = await this.appuModel.find({
                  customerId: record.customerId,
                });
                console.log("customerRecords", customerRecords);
                if (customerRecords.length > 1) {
                  if (record.paidAmount == 0) {
                    filteredpaidList.push(record);
                    continue;
                  } else {
                    continue;
                  }
                } else if(customerRecords.length == 0) {
                  continue;
                } else {
                  continue;
                }
              }
            }
            const count = filteredpaidList.length;

            if(filteredpaidList.length>0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Unpaid Appu List',
                totalAppuMembers: totalAppuMembers,
                count: count,
                data: filteredpaidList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: "Unpaid records not found for this month",
              }
            }
          } else {
            const filteredpaidList = [];
            for (const record of paidList) {
              const dateString = record.date.replace(
                /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                '',
              );
              const recordDate = new Date(dateString);
              // console.log("...recordDate", recordDate);
              if (
                recordDate.getDate() === parsedDate.getDate() &&
                recordDate.getMonth() === parsedDate.getMonth() &&
                recordDate.getFullYear() === parsedDate.getFullYear()
              ) {
                const customerRecords = await this.appuModel.find({
                  customerId: record.customerId,
                });
                console.log("customerRecords", customerRecords);
                if (customerRecords.length > 1) {
                  if (record.paidAmount == 0) {
                    filteredpaidList.push(record);
                    continue;
                  } else {
                    continue;
                  }
                } else if(customerRecords.length == 0) {
                  continue;
                } else {
                  continue;
                }
              }
            }
            const count = filteredpaidList.length;

            if(filteredpaidList.length>0) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Unpaid Appu List',
                totalAppuMembers: totalAppuMembers,
                count: count,
                data: filteredpaidList,
              };
            } else {
              return {
                statusCode: HttpStatus.NOT_FOUND,
                message: "Unpaid records not found for this given date",
              }
            }
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Not found appu paid list',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found any appu records by this sangham',
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
