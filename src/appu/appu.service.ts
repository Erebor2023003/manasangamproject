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

@Injectable()
export class AppuService {
  constructor(
    @InjectModel(Appu.name) private readonly appuModel: Model<Appu>,
    @InjectModel(AppuDetails.name)
    private readonly appuDetailsModel: Model<AppuDetails>,
    @InjectModel(Surety.name) private readonly suretyModel: Model<Surety>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
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
        sanghamId: req.sanghamId,
      });
      if (getList.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Appu Details By Sangham',
          data: getList,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'List of Appu Details not Found',
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
      const getdetails = await this.appuDetailsModel.findOne({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      if (getdetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Appu Details of customer',
          data: getdetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Customer Appu Details Not Found',
        };
      }
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
          const rawFingerprintData = req.fingerPrint;
          const base64EncodedFingerprintData =
            Buffer.from(rawFingerprintData).toString('base64');
          const findCustomerRecord = await this.customerModel.findOne({
            aadharNumber: req.aadharNumber,
          });
          if (findCustomerRecord) {
            if (
              findCustomerRecord.fingerPrint === base64EncodedFingerprintData
            ) {
              const addSurety = await this.suretyModel.create({
                sanghamId: req.sanghamId,
                customerId: req.customerId,
                candidateName: req.candidateName,
                candidateImage: req.candidateImage,
                aadharNumber: req.aadharNumber,
                mobileNumber: req.mobileNumber,
                fingerPrint: base64EncodedFingerprintData,
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
        const rawFingerprintData = req.fingerPrint;
        const base64EncodedFingerprintData =
          Buffer.from(rawFingerprintData).toString('base64');
        const findCustomerRecord = await this.customerModel.findOne({
          aadharNo: req.aadharNumber,
        });
        // console.log("findCustomerRecord",findCustomerRecord);
        if (findCustomerRecord) {
          console.log(
            'base64EncodedFingerprintData',
            base64EncodedFingerprintData,
          );
          if (findCustomerRecord.fingerPrint === base64EncodedFingerprintData) {
            const addSurety = await this.suretyModel.create({
              sanghamId: req.sanghamId,
              customerId: req.customerId,
              candidateName: req.candidateName,
              candidateImage: req.candidateImage,
              aadharNumber: req.aadharNumber,
              mobileNumber: req.mobileNumber,
              fingerPrint: base64EncodedFingerprintData,
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
              const dueDate = new Date();
              dueDate.setDate(appuStartDate.getDate());
              dueDate.setMonth(currentDate.getMonth() + req.timePeriod);
              const formattedDueDate = format(
                dueDate,
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
            const dueDate = new Date();
            dueDate.setDate(appuStartDate.getDate());
            dueDate.setMonth(currentDate.getMonth() + req.timePeriod);
            const formattedDueDate = format(
              dueDate,
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
        if (req.otp === findCustomer.otp) {
          const findAppus = await this.appuModel.find(
            {$and: [
              { sanghamId: findCustomer.sanghamId },
              { customerId: findCustomer.customerId },
            ]}
          ).sort({createdAt: -1});
          if(findAppus.length>0) {
            const updateStatus = await this.appuModel.updateOne({appuId: findAppus[0].appuId},{
              $set: {
                approveStatus: "approved"
              }
            });
            if(updateStatus) {
              const findAppu = await this.appuModel.findOne({appuId: findAppus[0].appuId});
              return {
                statusCode: HttpStatus.OK,
                message: "Appu Approved Successfully",
                data: findAppu
              }
            } else {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Appu Not Approved",
              }
            }
          } else {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "Appu does not Approved",
            }
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Invalid Otp",
          }
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
              ).appuAmount += deposit.appuAmount;
            } else {
              return `Record can be created only on ${monthDate.getDate()} on every month.`;
            }
          }
        } else {
          return 'No records are approved';
        }
      }
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
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Appu has been paid on this day',
            };
          }
          const lastMonthRecord = await this.appuModel
            .find({
              sanghamId: depositRecord.sanghamId,
              customerId: depositRecord.customerId,
              // date: {$lt: currentDate}
            })
            .sort({ createdAt: -1 });
          if (lastMonthRecord[0].total === 0) {
            return 'Record will be create when the Appu is added';
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
              fine = lastMonthRecord[0].fine + findCustomerAppu.fine;
            } else {
              interest =
                lastMonthRecord[0].total * (findCustomerAppu.interest / 100);
              fine = 0;
            }
          } else {
            interest = 0;
            fine = 0;
          }
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
          return addAppuRecord;
          // Add interest for the previous month
          // Your logic to calculate interest and update depositDetails goes here
          // ...
        } else {
          console.log(`Record already exists for ${depositRecord.date}`);
        }
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getAppuRecordsOfCustomer(req: appuDto) {
    try {
      const getList = await this.appuModel.find({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      if (getList.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Appu Records',
          data: getList,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Appu Records Not Found',
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
}
