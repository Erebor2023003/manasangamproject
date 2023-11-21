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

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<Agent>,
    @InjectModel(Sangham.name) private readonly sanghamModel: Model<Sangham>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    private readonly sharedService: SharedService,
    private readonly authService: AuthService,
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
      if (list.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of Agents',
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

  async createSangham(req: sanghamDto) {
    try {
      if (!this.agentSanghamMap[req.agentId]) {
        this.agentSanghamMap[req.agentId] = 1;
      } else {
        this.agentSanghamMap[req.agentId]++;
      }

      const agentCode = String.fromCharCode(
        65 + Object.keys(this.agentSanghamMap).length - 1,
      );
      const sanghamNumber = this.agentSanghamMap[req.agentId]
        .toString()
        .padStart(2, '0');
      if (req.sanghamName) {
        req.sanghamName = req.sanghamName;
      } else {
        req.sanghamName = 'manasangham' + ' ' + `${agentCode}${sanghamNumber}`;
      }
      const addSangham = await this.sanghamModel.create(req);
      if (addSangham) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Sangham added to the Agent Succesfully',
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
                customerCount: { $size: "$customers" },
              },
            },
            {
              $unwind: '$customerCount'
            },
            {
              $addFields: {
                percentage: {
                  $multiply: [
                    { $divide: ['$customerCount', '$customersLimit'] },
                    100,
                  ],
                },
              }
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
}
