import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SanghamDepositDetails } from './schema/sanghamdepositdetails.schema';
import { Model } from 'mongoose';
import { SanghamDeposit } from './schema/sanghamdeposit.schema';
import { SanghamWithdraw } from './schema/sanghamwithdraw.schema';
import { sanghamdepositDetailsDto } from './dto/sanghamdepositdetails.dto';
import { sanghamDepositDto } from './dto/sanghamdeposits.dto';
import { sanghamWithdrawDto } from './dto/sanghamwithdraw.dto';
import { paidDto } from './dto/paid.dto';
import { Sangham } from 'src/agent/schema/sangham.schema';
import { Paid } from './schema/paid.schema';

@Injectable()
export class SanghamdepositsService {
  constructor(
    @InjectModel(SanghamDepositDetails.name)
    private readonly sanghamDepositDetailsModel: Model<SanghamDepositDetails>,
    @InjectModel(SanghamDeposit.name)
    private readonly sanghamDepositModel: Model<SanghamDeposit>,
    @InjectModel(SanghamWithdraw.name)
    private readonly sanghamWithdrawModel: Model<SanghamWithdraw>,
    @InjectModel(Sangham.name) private readonly sanghamModel: Model<Sangham>,
    @InjectModel(Paid.name) private readonly paidModel:Model<Paid>,
  ) {}

  // start of sangham deposits details

  // Add Sangham Deposit Details
  async createSanghamDetails(req: sanghamdepositDetailsDto) {
    try {
      const findSanghams = await this.sanghamDepositDetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      if (findSanghams) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Deposit Details Of this sangham already existed',
        };
      }
      const addSanghamDetails = await this.sanghamDepositDetailsModel.create(
        req,
      );
      if (addSanghamDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Sangham Deposit Details Added',
          data: addSanghamDetails,
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

  // Get sangham deposit details by sanghamId
  async getSanghamDetailsbyId(req: sanghamdepositDetailsDto) {
    try {
      const addSanghamDetails = await this.sanghamDepositDetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      if (addSanghamDetails) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Deposit Details of Sangham',
          data: addSanghamDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found details of sangham',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Update sangham Deposit Interest
  async updateSanghamDetailsbyId(req: sanghamdepositDetailsDto) {
    try {
      const moderate = await this.sanghamDepositDetailsModel.updateOne(
        { sanghamdepositDetailsId: req.sanghamdepositDetailsId },
        {
          $set: {
            interestRate: req.interestRate,
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

  // end of sangham deposit details

  //start of sangham deposits

  // Pay or Add sangham Deposit
  async createSanghamDeposit(req: sanghamDepositDto) {
    try {
      const findSanghamDepositDetails =
        await this.sanghamDepositDetailsModel.findOne({
          sanghamId: req.sanghamId,
        });
      if (findSanghamDepositDetails) {
        const currentDate = new Date();
        const dateString = findSanghamDepositDetails.depositDate;
        const [day, month, year] = dateString.split('-');
        const numericYear = parseInt(year, 10);
        const numericMonth = parseInt(month, 10);

        const dateObject = new Date(
          Date.UTC(numericYear, numericMonth - 1, +day),
        );
        if (
          currentDate.getDate() === dateObject.getDate() ||
          currentDate.getDate() === dateObject.getDate() + 1
        ) {
          const sanghamRecords = await this.sanghamDepositModel
            .find({ sanghamId: req.sanghamId })
            .sort({ createdAt: -1 });
          if (sanghamRecords.length > 0) {
            const dateString = sanghamRecords[0].date.replace(
              /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
              '',
            );
            const lastMonthDate = new Date(dateString);
            if (
              lastMonthDate.getDate() === currentDate.getDate() &&
              lastMonthDate.getMonth() === currentDate.getMonth() &&
              lastMonthDate.getFullYear() === currentDate.getFullYear()
            ) {
              if (sanghamRecords[0].depositAmount === 0) {
                const updateDeposit = await this.sanghamDepositModel.updateOne(
                  { sanghamDepositId: sanghamRecords[0].sanghamDepositId },
                  {
                    $set: {
                      depositAmount: req.depositAmount,
                      total: sanghamRecords[0].total + req.depositAmount,
                    },
                  },
                );
                if (updateDeposit) {
                  const findDetails = await this.sanghamDepositModel.findOne({
                    sanghamDepositId: sanghamRecords[0].sanghamDepositId,
                  });
                  return {
                    statusCode: HttpStatus.OK,
                    message: 'SanghamDeposit Paid Scuccessfully',
                    data: {
                      sanghamId: findDetails.sanghamId,
                      agentId: findDetails.agentId,
                      depositAmount: findDetails.depositAmount,
                      interest: findSanghamDepositDetails.interestRate,
                      withdraw: findDetails.withdraw,
                      total: findDetails.total,
                      date: findDetails.date,
                    },
                  };
                } else {
                  return {
                    statusCode: HttpStatus.EXPECTATION_FAILED,
                    message: 'Sangham Deposit failed.',
                  };
                }
              } else {
                return {
                  statusCode: HttpStatus.CONFLICT,
                  message: 'Deposit already paid for this month',
                };
              }
            } else {
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: `SanghamDeposit record not created for this month.`,
              };
            }
          } else {
            const date = new Date();
            date.setDate(dateObject.getDate());
            const addDeposit = await this.sanghamDepositModel.create({
              sanghamId: req.sanghamId,
              agentId: req.agentId,
              depositAmount: req.depositAmount,
              interest: 0,
              withdraw: 0,
              total: req.depositAmount,
              date: date,
            });
            if (addDeposit) {
              return {
                statusCode: HttpStatus.OK,
                message: 'Sangham Deposit added Successfully',
                data: {
                  sanghamId: addDeposit.sanghamId,
                  agentId: addDeposit.agentId,
                  depositAmount: addDeposit.depositAmount,
                  interest: findSanghamDepositDetails.interestRate,
                  withdraw: addDeposit.withdraw,
                  total: addDeposit.total,
                  date: addDeposit.date,
                },
              };
            } else {
              return {
                statusCode: HttpStatus.EXPECTATION_FAILED,
                message: 'Sangham Deposit failed',
              };
            }
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Sangham Deposit can only be taken on ${dateObject.getDate()} of every month`,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sangham Deposit Details not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Cron api for creating sangham deposits
  async sanghamDepositCron() {
    try {
      const createdRecords = [];
      const findsanghamdeposits = await this.sanghamDepositModel.find();
      // console.log("...findsanghamdeposits", findsanghamdeposits);
      if (findsanghamdeposits.length > 0) {
        for (const sanghamRecords of findsanghamdeposits) {
          // console.log("...length", findsanghamdeposits.length);
          const findDepositRecords = await this.sanghamDepositModel
            .find({ sanghamId: sanghamRecords.sanghamId })
            .sort({ createdAt: -1 });
          if (findDepositRecords.length > 0) {
            const parseDate = findDepositRecords[0].date.replace(
              /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
              '',
            );
            const parsedDepositDate = new Date(parseDate);
            const currentDate = new Date();
            if (
              currentDate.getDate() === parsedDepositDate.getDate() &&
              currentDate.getMonth() === parsedDepositDate.getMonth() &&
              currentDate.getFullYear() === parsedDepositDate.getFullYear()
            ) {
              continue;
            } else {
              const findDetails = await this.sanghamDepositDetailsModel.findOne(
                {
                  sanghamId: sanghamRecords.sanghamId,
                },
              );

              if (findDetails) {
                const dateString = findDetails.depositDate;
                const [day, month, year] = dateString.split('-');
                const numericYear = parseInt(year, 10);
                const numericMonth = parseInt(month, 10);

                const dateObject = new Date(
                  Date.UTC(numericYear, numericMonth - 1, +day),
                );
                const depositDate = sanghamRecords.date.replace(
                  /GMTZ \(GMT[+-]\d{2}:\d{2}\)/,
                  '',
                );
                const lastMonthDate = new Date(depositDate);
                if (
                  lastMonthDate.getDate() === dateObject.getDate() &&
                  lastMonthDate.getMonth() === currentDate.getMonth() - 1
                ) {
                  let interest =
                    findDepositRecords[0].total *
                    (findDetails.interestRate / 100);
                  const createRecord = await this.sanghamDepositModel.create({
                    sanghamId: sanghamRecords.sanghamId,
                    depositAmount: 0,
                    agentId: sanghamRecords.agentId,
                    withdraw: 0,
                    interest: interest,
                    date: currentDate,
                    total: findDepositRecords[0].total + interest,
                  });
                  if (createRecord) {
                    createdRecords.push(createRecord);
                    continue;
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
          } else {
            continue;
          }
        }
        return createdRecords;
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'SanghamDeposits not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Get sangham deposit list of sangham
  async getSanghamDepositsBySangham(req: sanghamDepositDto) {
    try {
      const findSanghamDeposits = await this.sanghamDepositModel.find({
        sanghamId: req.sanghamId,
      });
      if (findSanghamDeposits.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of sangham deposits',
          data: findSanghamDeposits,
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

  // Get sangham balance of sangham deposits
  async sanghamDepositsBalance(req: sanghamDepositDto) {
    try {
      const balance = await this.sanghamDepositModel.find({
        sanghamId: req.sanghamId,
      });
      if (balance.length > 0) {
        // Use reduce to sum up podhupuAmount and fine
        const totalAmount = balance.reduce((acc, current) => {
          const podhupuAmount = current.depositAmount || 0;
          return acc + podhupuAmount;
        }, 0);
        return {
          statusCode: HttpStatus.OK,
          message: 'Sangham Deposit Balance',
          data: totalAmount,
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

  // Sangham Deposit history with date filtering
  async sanghamDepositsHistory(req: sanghamDepositDto) {
    try {
      const depositHistory = await this.sanghamDepositModel.find({
        $and: [{ sanghamId: req.sanghamId }, { depositAmount: { $ne: 0 } }],
      });
      if (depositHistory.length > 0) {
        if (req.date) {
          const parseDate = new Date(req.date);
          console.log('....parseDate', parseDate);
          const matchingRecords = [];
          depositHistory.map((record) => {
            console.log('...matchRecord', new Date(record.date));
            const matchRecordDate = new Date(record.date);
            if (
              matchRecordDate.getDate() === parseDate.getDate() &&
              matchRecordDate.getMonth() === parseDate.getMonth() &&
              matchRecordDate.getFullYear() === parseDate.getFullYear()
            ) {
              matchingRecords.push(record);
            }
          });
          console.log('matchingRecords', matchingRecords);
          const remainingRecords = [];
          depositHistory.map((record) => {
            console.log('...remainRecord', new Date(record.date));
            const remainRecordDate = new Date(record.date);
            if (
              remainRecordDate.getDate() != parseDate.getDate() ||
              remainRecordDate.getMonth() != parseDate.getMonth() ||
              remainRecordDate.getFullYear() != parseDate.getFullYear()
            ) {
              remainingRecords.push(record);
            }
          });
          const sortedDepositHistory = matchingRecords.concat(remainingRecords);
          return {
            statusCode: HttpStatus.OK,
            message: 'List of deposits lists',
            data: sortedDepositHistory,
          };
        } else {
          return {
            statusCode: HttpStatus.OK,
            message: 'List of deposits lists',
            data: depositHistory,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Deposits Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // end of sanghamDeposits

  //start of sangham withdraws

  // Withdraw api to withdraw from Sangham Deposits
  async createSanghamWithdraw(req: sanghamWithdrawDto) {
    try {
      const sanghamDeposit = await this.sanghamDepositDetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      if (sanghamDeposit) {
        const dateString = sanghamDeposit.depositDate;
        const [day, month, year] = dateString.split('-');
        const numericYear = parseInt(year, 10);
        const numericMonth = parseInt(month, 10);

        const depositDate = new Date(
          Date.UTC(numericYear, numericMonth - 1, +day),
        );
        const currentDate = new Date();
        const withdrawStartDate = new Date(depositDate);
        if (
          withdrawStartDate.getDate() === currentDate.getDate() ||
          withdrawStartDate.getDate() + 1 === currentDate.getDate()
        ) {
          const findSanghamDeposits = await this.sanghamDepositModel
            .find({
              sanghamId: req.sanghamId,
            })
            .sort({ createdAt: -1 });
          if (
            !req.withdrawAmount ||
            req.withdrawAmount === 0 ||
            req.withdrawAmount >= findSanghamDeposits[0].total
          ) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Please enter valid amount',
            };
          }
          const withdrawRecords = await this.sanghamWithdrawModel
            .find({ sanghamId: req.sanghamId })
            .sort({ createdAt: -1 });
          console.log(withdrawRecords);
          if (withdrawRecords.length > 0) {
            const parseDate = new Date(withdrawRecords[0].date);
            console.log('parseDate', parseDate);
            if (
              (currentDate.getDate() === parseDate.getDate() ||
                currentDate.getDate() - 1 === parseDate.getDate()) &&
              currentDate.getMonth() === parseDate.getMonth() &&
              currentDate.getFullYear() === parseDate.getFullYear()
            ) {
              return {
                statuscode: HttpStatus.CONFLICT,
                message: 'Withdraw Has done for this month',
              };
            }
          }
          const savingDate = new Date();
          savingDate.setDate(withdrawStartDate.getDate());
          const addwithdraw = await this.sanghamWithdrawModel.create({
            withdrawAmount: req.withdrawAmount,
            date: savingDate,
            agentId: sanghamDeposit.agentId,
            sanghamId: req.sanghamId,
            total: req.withdrawAmount,
          });
          if (addwithdraw) {
            const findDeposit = await this.sanghamDepositModel.findOne({
              sanghamDepositId: findSanghamDeposits[0].sanghamDepositId,
            });
            const updateDepositTotal = await this.sanghamDepositModel.updateOne(
              { sanghamDepositId: findSanghamDeposits[0].sanghamDepositId },
              {
                $set: {
                  withdraw: addwithdraw.withdrawAmount,
                  total:
                    findSanghamDeposits[0].total - addwithdraw.withdrawAmount,
                },
              },
            );
            if (updateDepositTotal) {
              const updatedDeposit = await this.sanghamDepositModel.findOne({
                sanghamDepositId: findSanghamDeposits[0].sanghamDepositId,
              });
              const updateWithdraw = await this.sanghamWithdrawModel.updateOne({sanghamWithdrawId: addwithdraw.sanghamWithdrawId},{
                $set: {
                  total: updatedDeposit.total
                }
              })
              return {
                statusCode: HttpStatus.OK,
                message: 'Withdraw Successful',
                data: {
                  date: addwithdraw.date,
                  depositAmount: findDeposit.total - findDeposit.interest,
                  total: findDeposit.total,
                  interest: findDeposit.interest,
                  withdrawAmount: addwithdraw.withdrawAmount,
                  availableBalance: updatedDeposit.total,
                },
              };
            } else {
              const deleteWithdraw = await this.sanghamWithdrawModel.deleteOne({
                sanghamWithdrawId: addwithdraw.sanghamWithdrawId,
              });
              return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Withdraw failed',
              };
            }
          }
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Withdraw can't approved`,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sangham Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // Get Withdraw list by date filter
  async getSanghamWithdrawsbyfilter(req: sanghamWithdrawDto) {
    try {
      const depositHistory = await this.sanghamWithdrawModel.find({sanghamId: req.sanghamId });
      if (depositHistory.length > 0) {
        if (req.date) {
          const parseDate = new Date(req.date);
          console.log('....parseDate', parseDate);
          const matchingRecords = [];
          depositHistory.map((record) => {
            console.log('...matchRecord', new Date(record.date));
            const matchRecordDate = new Date(record.date);
            if (
              matchRecordDate.getDate() === parseDate.getDate() &&
              matchRecordDate.getMonth() === parseDate.getMonth() &&
              matchRecordDate.getFullYear() === parseDate.getFullYear()
            ) {
              matchingRecords.push(record);
            }
          });
          console.log('matchingRecords', matchingRecords);
          const remainingRecords = [];
          depositHistory.map((record) => {
            console.log('...remainRecord', new Date(record.date));
            const remainRecordDate = new Date(record.date);
            if (
              remainRecordDate.getDate() != parseDate.getDate() ||
              remainRecordDate.getMonth() != parseDate.getMonth() ||
              remainRecordDate.getFullYear() != parseDate.getFullYear()
            ) {
              remainingRecords.push(record);
            }
          });
          const sortedDepositHistory = matchingRecords.concat(remainingRecords);
          return {
            statusCode: HttpStatus.OK,
            message: 'List of withdraw lists of sangham',
            data: sortedDepositHistory,
          };
        } else {
          return {
            statusCode: HttpStatus.OK,
            message: 'List of withdraw lists of sangham',
            data: depositHistory,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Deposits Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  // end of sangham withdraws

  // start of Paid Apis

  // Add Pay to manasangham
  async payToSangham(req: paidDto) {
    try{
      const findSangham = await this.sanghamModel.findOne({sanghamId: req.sanghamId});
      if(findSangham) {
        if(!req.amount || req.amount === 0) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Please provide valid amount",
          }
        }
        const currentDate = new Date();
        const createPay = await this.paidModel.create({
          sanghamId: req.sanghamId,
          amount: req.amount,
          date: currentDate,
        });
        if(createPay) {
          return {
            statusCode: HttpStatus.OK,
            message: "Paid to sangham Successfully",
            data: createPay,
          }
        } else {
          return {
            statusCode: HttpStatus.EXPECTATION_FAILED,
            message: "Pay to sangham failed"
          }
        }
      } else {
        return{
          statusCode: HttpStatus.NOT_FOUND,
          message: "sangham details not found",
        }
      }
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  //Get pays of sangham to manasangham
  async paysList(req: paidDto) {
    try{
      const paysList = await this.paidModel.find({sanghamId: req.sanghamId});
      if(paysList.length>0) {
        if (req.date) {
          const parseDate = new Date(req.date);
          console.log('....parseDate', parseDate);
          const matchingRecords = [];
          paysList.map((record) => {
            console.log('...matchRecord', new Date(record.date));
            const matchRecordDate = new Date(record.date);
            if (
              matchRecordDate.getDate() === parseDate.getDate() &&
              matchRecordDate.getMonth() === parseDate.getMonth() &&
              matchRecordDate.getFullYear() === parseDate.getFullYear()
            ) {
              matchingRecords.push(record);
            }
          });
          console.log('matchingRecords', matchingRecords);
          const remainingRecords = [];
          paysList.map((record) => {
            console.log('...remainRecord', new Date(record.date));
            const remainRecordDate = new Date(record.date);
            if (
              remainRecordDate.getDate() != parseDate.getDate() ||
              remainRecordDate.getMonth() != parseDate.getMonth() ||
              remainRecordDate.getFullYear() != parseDate.getFullYear()
            ) {
              remainingRecords.push(record);
            }
          });
          const sortedDepositHistory = matchingRecords.concat(remainingRecords);
          return {
            statusCode: HttpStatus.OK,
            message: 'List of withdraw lists of sangham',
            data: sortedDepositHistory,
          };
        } else {
          return {
            statusCode: HttpStatus.OK,
            message: 'List of withdraw lists of sangham',
            data: paysList,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "No paid List found"
        }
      }
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}