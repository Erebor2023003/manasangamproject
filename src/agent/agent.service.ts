import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Agent } from './schema/agent.schema';
import { Model } from 'mongoose';
import { SharedService } from './shared.service';
import { agentDto } from './dto/agent.dto';
import { AuthService } from 'src/auth/auth.service';
import { sanghamDto } from './dto/sangham.dto';
import { Sangham } from './schema/sangham.schema';
import { Customer } from 'src/customer/schema/customer.schema';
import { Podupu } from 'src/admin/schema/podhupu.schema';
import { Deposit } from 'src/admin/schema/deposit.schema';
import { SanghamDeposit } from 'src/sanghamdeposits/schema/sanghamdeposit.schema';
import { AppuDetails } from 'src/appu/schema/appudetails.schema';
import { Appu } from 'src/appu/schema/appu.schema';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Sangham.name) private readonly sanghamModel: Model<Sangham>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    private readonly sharedService: SharedService,
    private readonly authService: AuthService,
    @InjectModel(Podupu.name)
    private readonly podupuModel: Model<Podupu>,
    @InjectModel(Deposit.name) private readonly depositModel: Model<Deposit>,
    @InjectModel(SanghamDeposit.name)
    private readonly sanghamDepositModel: Model<SanghamDeposit>,
    @InjectModel(AppuDetails.name)
    private readonly appuDetailsModel: Model<AppuDetails>,
    @InjectModel(Appu.name)
    private readonly appuModel: Model<Appu>,
  ) {}

  private agentSanghamMap: Record<string, number> = {};

  async registerAgent(req: agentDto, image) {
    try {
      const findAgent = await this.agentModel.findOne({
        mobileNo: req.mobileNo,
      });
      if (findAgent) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Agent Already Existed',
        };
      } else {
        if (image) {
          if (image.aadharImage && image.aadharImage[0]) {
            const attachmentFile = await this.sharedService.saveFile(
              image.aadharImage[0],
            );
            req.aadharImage = attachmentFile;
          }
          if (image.aadharImage2 && image.aadharImage2[0]) {
            const attachmentFile = await this.sharedService.saveFile(
              image.aadharImage2[0],
            );

            req.aadharImage2 = attachmentFile;
          }
          if (image.tenthmemo && image.tenthmemo[0]) {
            const attachmentFile = await this.sharedService.saveFile(
              image.tenthmemo[0],
            );

            req.tenthmemo = attachmentFile;
          }
          if (image.profilePicture && image.profilePicture[0]) {
            const attachmentFile = await this.sharedService.saveFile(
              image.profilePicture[0],
            );

            req.profilePicture = attachmentFile;
          }
        }
        const bcryptPassword = await this.authService.hashPassword(
          req.password,
        );
        req.password = bcryptPassword;

        const addAgent = await this.agentModel.create(req);
        if (addAgent) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Agent registered Successfully',
            data: addAgent,
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

  async loginAgent(req: agentDto) {
    try {
      const findAgent = await this.agentModel.findOne({
        mobileNo: req.mobileNo,
      });
      //   console.log(findUser);
      if (!findAgent) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Agent Not Found',
        };
      } else {
        const matchPassword = await this.authService.comparePassword(
          req.password,
          findAgent.password,
        );
        // console.log(matchPassword);
        if (matchPassword) {
          const jwtToken = await this.authService.createToken({ findAgent });
          //   console.log(jwtToken);
          return {
            statusCode: HttpStatus.OK,
            message: 'Agent Login successfull',
            token: jwtToken,
            data: findAgent,
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

  async agentsList() {
    try {
      const list = await this.agentModel.find();
      const count = await this.agentModel.find().count();
      if (list.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Agents',
          count: count,
          data: list,
        };
      } else if (list.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Agents Not Found',
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

  async getAgentDetails(req: agentDto) {
    try {
      const findAgentById = await this.agentModel.findOne({
        agentId: req.agentId,
      });
      if (findAgentById) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Details of Agent',
          data: findAgentById,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Agent Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async updateAgent(req: agentDto, image) {
    try {
      const findAgent = await this.agentModel.findOne({ agentId: req.agentId });
      if (image) {
        if (image.aadharImage && image.aadharImage[0]) {
          const attachmentFile = await this.sharedService.saveFile(
            image.aadharImage[0],
          );
          req.aadharImage = attachmentFile;
        }
        if (image.aadharImage2 && image.aadharImage2[0]) {
          const attachmentFile = await this.sharedService.saveFile(
            image.aadharImage2[0],
          );

          req.aadharImage2 = attachmentFile;
        }
        if (image.tenthmemo && image.tenthmemo[0]) {
          const attachmentFile = await this.sharedService.saveFile(
            image.tenthmemo[0],
          );

          req.tenthmemo = attachmentFile;
        }
        if (image.profilePicture && image.profilePicture[0]) {
          const attachmentFile = await this.sharedService.saveFile(
            image.profilePicture[0],
          );

          req.profilePicture = attachmentFile;
        }
      }
      if (findAgent) {
        if (req.tenthmemo || req.aadharImage || req.profilePicture) {
          let password;
          if (req.password) {
            const bcryptPassword = await this.authService.hashPassword(
              req.password,
            );
            req.password = bcryptPassword;
          } else {
            password = findAgent.password;
          }
          const updateAgent = await this.agentModel.updateOne(
            { agentId: req.agentId },
            {
              $set: {
                agentName: req.agentName,
                mobileNo: req.mobileNo,
                emailId: req.emailId,
                aadharNo: req.aadharNo,
                aadharImage: req.aadharImage,
                tenthmemo: req.tenthmemo,
                address: req.address,
                password: password,
                profilePicture: req.profilePicture,
              },
            },
          );
          if (updateAgent) {
            const findAgent = await this.agentModel.findOne({
              agentId: req.agentId,
            });
            return {
              statusCode: HttpStatus.OK,
              message: 'Agent Updated Succesfully',
              data: findAgent,
            };
          } else {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Invalid Request',
            };
          }
        } else {
          let password;
          if (req.password) {
            const bcryptPassword = await this.authService.hashPassword(
              req.password,
            );
            req.password = bcryptPassword;
          } else {
            password = findAgent.password;
          }
          const updateAgent = await this.agentModel.updateOne(
            { agentId: req.agentId },
            {
              $set: {
                agentName: req.agentName,
                mobileNo: req.mobileNo,
                emailId: req.emailId,
                aadharNo: req.aadharNo,
                address: req.address,
                password: password,
              },
            },
          );
          if (updateAgent) {
            const findAgent = await this.agentModel.findOne({
              agentId: req.agentId,
            });
            return {
              statusCode: HttpStatus.OK,
              message: 'Agent Updated Succesfully',
              data: findAgent,
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
          message: 'Agent Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async createSangham(req: sanghamDto) {
    try {
      if (!this.agentSanghamMap[req.agentId]) {
        this.agentSanghamMap[req.agentId] = 1;
      } else {
        this.agentSanghamMap[req.agentId]++;
      }

      const findAgents = await this.sanghamModel
        .find({ agentId: req.agentId })
        .sort({ createdAt: -1 });
      if (findAgents.length > 0) {
        const nameString = findAgents[0].sanghamName.split(' ');
        const matches = nameString[1].match(/([a-zA-Z]+)(\d+)/);
        let alphabeticPart;
        let numericPart;
        alphabeticPart = matches[1];
        numericPart = parseInt(matches[2], 10);
        numericPart++;

        const sanghamNumber = numericPart.toString().padStart(2, '0');
        if (req.sanghamName) {
          req.sanghamName = req.sanghamName;
        } else {
          req.sanghamName =
            'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
        }
      } else {
        const alphabeticPart = await this.findNextAvailableAlphabet();
        console.log('alphabeticPart', alphabeticPart);
        const numericPart = this.agentSanghamMap[req.agentId];

        const sanghamNumber = numericPart.toString().padStart(2, '0');

        if (req.sanghamName) {
          req.sanghamName = req.sanghamName;
        } else {
          req.sanghamName =
            'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
        }
        console.log(req.sanghamName);
      }
      // Check if the generated Sangham name already exists
      const isExisting = await this.sanghamModel.findOne({
        sanghamName: req.sanghamName,
      });

      if (isExisting) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Sangham name already exists',
        };
      }

      const addSangham = await this.sanghamModel.create(req);

      if (addSangham) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Sangham added to the Agent Successfully',
          data: addSangham,
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid request',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async findNextAvailableAlphabet() {
    const sanghamsData = await this.sanghamModel.find();
    const allUsedAlphabets = new Set(
      sanghamsData.map((sangham) =>
        sangham.sanghamName.charAt(8).toUpperCase(),
      ),
    );
    console.log('allUsedAlphabets', allUsedAlphabets);
    for (let i = 65; i <= 90; i++) {
      const currentAlphabet = String.fromCharCode(i);

      // Check if the current alphabet is not in the used set
      if (!allUsedAlphabets.has(currentAlphabet)) {
        console.log('Next available alphabet:', currentAlphabet);
        return currentAlphabet; // Return the next available alphabet
      }
    }

    console.log('All alphabets are used');
    return 'AA';
  }

  async getSanghamsByAgentId(req: sanghamDto) {
    try {
      const findAgent = await this.agentModel.findOne({ agentId: req.agentId });
      if (findAgent) {
        const agentSanghams = await this.sanghamModel.find({
          agentId: req.agentId,
        });
        if (agentSanghams.length > 0) {
          const sanghamsAgent = await this.sanghamModel.aggregate([
            { $match: { agentId: findAgent.agentId } },
            {
              $lookup: {
                from: 'agents',
                localField: 'agentId',
                foreignField: 'agentId',
                as: 'agentId',
              },
            },
            {
              $lookup: {
                from: 'customers', // Assuming the name of your customer collection
                localField: 'sanghamId',
                foreignField: 'sanghamId',
                as: 'customers',
              },
            },
            {
              $addFields: {
                customerCount: { $size: '$customers' },
              },
            },
            {
              $unwind: '$customerCount',
            },
            {
              $addFields: {
                percentage: {
                  $multiply: [
                    { $divide: ['$customerCount', '$customersLimit'] },
                    100,
                  ],
                },
              },
            },
            {
              $project: {
                customers: 0,
              },
            },
          ]);

          return {
            statusCode: HttpStatus.OK,
            message: 'Sanghams of an Agent',
            data: sanghamsAgent,
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid request',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Agent Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getSanghamDetails(req: sanghamDto) {
    try {
      const getDetails = await this.sanghamModel.findOne({
        sanghamId: req.sanghamId,
      });
      if (getDetails) {
        const count = await this.customerModel
          .find({ sanghamId: req.sanghamId })
          .count();
        const getagentdetails = await this.sanghamModel.aggregate([
          { $match: { sanghamId: getDetails.sanghamId } },
          {
            $lookup: {
              from: 'agents',
              localField: 'agentId',
              foreignField: 'agentId',
              as: 'agentId',
            },
          },
        ]);
        return {
          statusCode: HttpStatus.OK,
          message: 'Sangham Details',
          count: count + ' ' + 'members',
          data: getagentdetails,
        };
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

  async searchBySanghamname(req: sanghamDto) {
    try {
      const searchItem = await this.sanghamModel.find({
        $and: [
          { agentId: req.agentId },
          { sanghamName: { $regex: new RegExp(req.sanghamName, 'i') } },
        ],
      });
      if (searchItem.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Searched Sanghams',
          data: searchItem,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No sanghams found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getSanghamAvailableBalance(req: sanghamDto) {
    try {
      const findCustomerInterest = await this.appuDetailsModel.findOne({
        $and: [{ sanghamId: req.sanghamId }, { customerId: req.customerId }],
      });
      // console.log(findCustomerInterest);
      const podupubalance = await this.podupuModel.find({
        $and: [{ sanghamId: req.sanghamId }, { status: 'paid' }],
      });
      let totalpodupuAmount = 0;
      if (podupubalance.length > 0) {
        // Use reduce to sum up podhupuAmount and fine
        totalpodupuAmount = podupubalance.reduce((acc, current) => {
          const podhupuAmount = current.podhupuAmount || 0;
          const fine = current.fine || 0;
          return acc + podhupuAmount + fine;
        }, 0);
      }
      const balance = await this.depositModel.find({
        sanghamId: req.sanghamId,
      });
      let totalAmount = 0;
      if (balance.length > 0) {
        const firstIndexedTotals = {};

      balance.forEach((record) => {
        const customerId = record.customerId; // Assuming there's a customerId field

        // Check if this is the first indexed record for the customer
        if (!firstIndexedTotals[customerId]) {
          // If it is, store its total
          firstIndexedTotals[customerId] = record.total || 0;
        }
      });

      // Sum up the first indexed totals for all customers
      const totalFirstIndexed:any = Object.values(firstIndexedTotals).reduce(
        (acc:number, total:number) => acc + total,
        0,
      );
      totalAmount = totalFirstIndexed
      //   // Use reduce to sum up podhupuAmount and fine
      //   totalAmount = balance.reduce((acc, current) => {
      //     const podhupuAmount = current.depositAmount || 0;
      //     const fine = current.interest || 0;
      //     return acc + podhupuAmount + fine;
      //   }, 0);
      }


      const appubalance = await this.appuModel.find({
        sanghamId: req.sanghamId,
      });
      let appuTotal = 0;
      if (appubalance.length > 0) {
        const appufirstIndexedTotals = {};

        appubalance.forEach((record) => {
        const customerId = record.customerId; // Assuming there's a customerId field

        if (!appufirstIndexedTotals[customerId]) {
          appufirstIndexedTotals[customerId] = [];
        }
    
        appufirstIndexedTotals[customerId].push(record);
      });

      // Sum up the first indexed totals for all customers
      const apputotalFirstIndexed:any = Object.values(appufirstIndexedTotals).reduce((acc, records: any) => {
        // Sort records inversely based on some criteria, assuming 'date' field here
        records.sort((a, b) => b.createdAt - a.createdAt);
        // Add total of the first indexed record of each customerId
        acc += records[0].total || 0;
        return acc;
      }, 0);
      appuTotal = apputotalFirstIndexed
      }
      
      const sanghamdepositbalance = await this.sanghamDepositModel.find({
        sanghamId: req.sanghamId,
      });
      let totalSanghamAmount = 0;
      if (sanghamdepositbalance.length > 0) {
        totalSanghamAmount = sanghamdepositbalance.reduce((acc, current) => {
          const podhupuAmount = current.depositAmount || 0;
          const fine = current.interest || 0;
          return acc + podhupuAmount + fine;
        }, 0);
      }
      console.log(totalpodupuAmount);
      console.log(totalAmount);
      console.log(totalSanghamAmount);
      console.log(appuTotal);
      if (findCustomerInterest) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Available Balance of Sangham',
          data: {
            availableBalance:
              totalpodupuAmount + totalAmount + totalSanghamAmount - appuTotal,
            appuAmount: appuTotal,
            podhupuAmount: totalpodupuAmount,
            depositAmount: totalAmount + totalSanghamAmount,
            interestRate: findCustomerInterest.interest,
          },
        };
      } else {
        return {
          statusCode: HttpStatus.OK,
          message: 'Available Balance of Sangham',
          data: {
            availableBalance:
              totalpodupuAmount + totalAmount + totalSanghamAmount - appuTotal,
            appuAmount: appuTotal,
            podhupuAmount: totalpodupuAmount,
            depositAmount: totalAmount + totalSanghamAmount,
          },
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getAllSanghams() {
    try {
      const sanghams = await this.sanghamModel.aggregate([
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentId',
          },
        },
        {
          $lookup: {
            from: 'customers', // Assuming the name of your customer collection
            localField: 'sanghamId',
            foreignField: 'sanghamId',
            as: 'customers',
          },
        },
        {
          $addFields: {
            customerCount: { $size: '$customers' },
          },
        },
        {
          $project: {
            customers: 0,
          },
        },
      ]);
      const count = await this.sanghamModel.find().count();
      if (sanghams.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of All sanghams',
          count: count,
          data: sanghams,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sanghams Not Found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async getAllCustomers() {
    try {
      const customers = await this.customerModel.aggregate([
        {
          $lookup: {
            from: 'sanghams',
            localField: 'sanghamId',
            foreignField: 'sanghamId',
            as: 'sanghamId',
          },
        },
      ]);
      const count = await this.customerModel.find().count();
      if (customers.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of All Customers',
          count: count,
          data: customers,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Customers not found',
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
