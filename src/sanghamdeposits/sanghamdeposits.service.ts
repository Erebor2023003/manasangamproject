import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SanghamDepositDetails } from './schema/sanghamdepositdetails.schema';
import { Model } from 'mongoose';
import { SanghamDeposit } from './schema/sanghamdeposit.schema';
import { SanghamWithdraw } from './schema/sanghamwithdraw.schema';
import { sanghamdepositDetailsDto } from './dto/sanghamdepositdetails.dto';
import { sanghamDepositDto } from './dto/sanghamdeposits.dto';

@Injectable()
export class SanghamdepositsService {
  constructor(
    @InjectModel(SanghamDepositDetails.name)
    private readonly sanghamDepositDetailsModel: Model<SanghamDepositDetails>,
    @InjectModel(SanghamDeposit.name)
    private readonly sanghamDepositModel: Model<SanghamDeposit>,
    @InjectModel(SanghamDepositDetails.name)
    private readonly sanghamWithdrawModel: Model<SanghamWithdraw>,
  ) {}

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

  async getSanghamDetailslist() {
    try {
      const addSanghamDetails = await this.sanghamDepositDetailsModel.find();
      if (addSanghamDetails.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Sangham Deposit Details',
          data: addSanghamDetails,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Didn't found",
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getSanghamDetailsbyId(req: sanghamdepositDetailsDto) {
    try {
      const addSanghamDetails = await this.sanghamDepositDetailsModel.findOne({
        sanghamdepositDetailsId: req.sanghamdepositDetailsId,
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

  async getSanghamDetailsbyAgentId(req: sanghamdepositDetailsDto) {
    try {
      const addSanghamDetails = await this.sanghamDepositDetailsModel.find({
        agentId: req.agentId,
      });
      if (addSanghamDetails.length > 0) {
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

  async createSanghamDeposit(req: sanghamDepositDto) {
    try {
      const findSanghamDetails = await this.sanghamDepositDetailsModel.findOne({
        sanghamId: req.sanghamId,
      });
      const dateString = findSanghamDetails.depositDate;
      const [day, month, year] = dateString.split('-');
      const numericYear = parseInt(year, 10);
      const numericMonth = parseInt(month, 10);

      const depositDate = new Date(
        Date.UTC(numericYear, numericMonth - 1, +day),
      );
      const currentDate = new Date();
      const depositStartDate = new Date();
      depositStartDate.setDate(depositDate.getDate());
      depositStartDate.setMonth(currentDate.getMonth());
      depositStartDate.setFullYear(currentDate.getFullYear());
      const depositEndDate = new Date();
      depositEndDate.setDate(depositStartDate.getDate() + 1);
      console.log(depositStartDate);
      console.log(depositEndDate);
      console.log(depositStartDate <= currentDate);
      console.log(currentDate <= depositEndDate);
      console.log(
        depositStartDate <= currentDate && currentDate <= depositEndDate,
      );
      if (depositStartDate <= currentDate && currentDate <= depositEndDate) {
        if (req.depositAmount === 0 || !req.depositAmount) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Enter Valid Deposit amount',
          };
        }
        let depositInterest: number = 0;
        const findDeposits = await this.sanghamDepositModel.find({
          sanghamId: req.sanghamId,
        });
        findDeposits.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          return dateB.getMonth() - dateA.getMonth();
        });
        console.log('findDeposits', findDeposits);
        console.log(req.depositAmount);

        if (findDeposits.length > 0) {
          const parseDate = new Date(findDeposits[0].date);
          console.log('parseDate', parseDate);
          if (
            parseDate.getDate() === currentDate.getDate() &&
            parseDate.getMonth() === currentDate.getMonth()
          ) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Deposit Already paid for this month',
            };
          }

          if (parseDate.getMonth() === currentDate.getMonth() - 1) {
            depositInterest =
              findDeposits[0].interest +
              findDeposits[0].total * (findSanghamDetails.interestRate / 100);
          }
          console.log(depositInterest);
        }
        const addDeposit = await this.sanghamDepositModel.create({
          sanghamId: req.sanghamId,
          agentId: req.agentId,
          depositAmount: req.depositAmount,
          date: currentDate,
          interest: depositInterest,
          total: depositInterest,
        });
        if (addDeposit) {
          console.log('depositInterest', depositInterest);
          console.log('addDeposit.depositAmount', addDeposit.depositAmount);
          console.log('findDeposits[0].total', findDeposits[0].total);
          const updateTotal = await this.sanghamDepositModel.updateOne(
            { sanghamDepositId: addDeposit.sanghamDepositId },
            {
              $set: {
                total:
                  depositInterest +
                  addDeposit.depositAmount +
                  findDeposits[0].total -
                  findDeposits[0].interest,
              },
            },
          );
          const findSanghamDeposit = await this.sanghamDepositModel.findOne({
            sanghamDepositId: addDeposit.sanghamDepositId,
          });
          return {
            statusCode: HttpStatus.OK,
            message: 'Deposit added Succesfully',
            data: findSanghamDeposit,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Deposit for Sangham can only be done on ${depositStartDate} to ${depositEndDate} only.`,
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getSanghamDepositsBySangham(req: sanghamDepositDto) {
    try {
      const findSanghamDeposits = await this.sanghamDepositModel.find({
        sanghamId: req.sanghamId,
      });
      // const dateString = req.date;

      // // console.log(dateString);
      // const [day, month, year] = dateString.split('-');
      // const numericYear = parseInt(year, 10);
      // const numericMonth = parseInt(month, 10);

      // const passedDate = new Date(
      //   Date.UTC(numericYear, numericMonth - 1, +day),
      // );
      const passedDate = new Date(req.date);
      console.log(passedDate);
      // Sorting the deposits by a custom logic
      findSanghamDeposits.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // Compare dates to bring the matching date records to the front
        if (
          dateA.getDate() === passedDate.getDate() &&
          dateA.getMonth() === passedDate.getMonth() &&
          dateA.getFullYear() === passedDate.getFullYear()
        ) {
          return -1; // a comes first
        } else if (
          dateB.getDate() === passedDate.getDate() &&
          dateB.getMonth() === passedDate.getMonth() &&
          dateB.getFullYear() === passedDate.getFullYear()
        ) {
          return 1; // b comes first
        }
      });

      if(findSanghamDeposits.length>0) {
        return {
          statusCode: HttpStatus.OK,
          message: "List of sangham deposits",
          data: findSanghamDeposits,
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Sangham Deposits Not Found",
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
