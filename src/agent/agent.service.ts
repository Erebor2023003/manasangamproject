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

  // async createSangham(req: sanghamDto) {
  //   try {
  //     if (!this.agentSanghamMap[req.agentId]) {
  //       this.agentSanghamMap[req.agentId] = 1;
  //     } else {
  //       this.agentSanghamMap[req.agentId]++;
  //     }

  //     const agentCode = String.fromCharCode(
  //       65 + Object.keys(this.agentSanghamMap).length - 1,
  //     );
  //     const sanghamNumber = this.agentSanghamMap[req.agentId]
  //       .toString()
  //       .padStart(2, '0');
  //     if (req.sanghamName) {
  //       req.sanghamName = req.sanghamName;
  //     } else {
  //       req.sanghamName = 'sangham' + ' ' + `${agentCode}${sanghamNumber}`;
  //     }
  //     const addSangham = await this.sanghamModel.create(req);
  //     if (addSangham) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Sangham added to the Agent Succesfully',
  //         data: addSangham,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }

  // async createSangham(req: sanghamDto) {
  //   try {
  //     if (!this.agentSanghamMap[req.agentId]) {
  //       this.agentSanghamMap[req.agentId] = 1;
  //     } else {
  //       this.agentSanghamMap[req.agentId]++;
  //     }

  //     // Retrieve the latest Sangham number for the agent
  //     const latestSangham = await this.sanghamModel
  //       .find({
  //         agentId: req.agentId,
  //       })
  //       .sort({ createdAt: -1 });
  //     if(latestSangham.length>0) {
  //       const lastRecordNumber = latestSangham[0].sanghamName.split(' ');
  //     const inputString = lastRecordNumber[1];
  //     const matches = inputString.match(/([a-zA-Z]+)(\d+)/);
  //     let alphabeticPart;
  //     let numericPart;
  //     if(matches) {
  //       alphabeticPart = matches[1];
  //       numericPart =  parseInt(matches[2], 10);
  //       numericPart++;
  //     }
  //     // console.log(numericPart)
  //     const sanghamNumber = (numericPart).toString().padStart(2, '0');
  //     if (req.sanghamName) {
  //       req.sanghamName = req.sanghamName;
  //     } else {
  //       req.sanghamName = 'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
  //     }
  //     } else {
  //       const agentCode = String.fromCharCode(
  //         65 + Object.keys(this.agentSanghamMap).length - 1,
  //       );
  //       const sanghamNumber = "01";
  //           if (req.sanghamName) {
  //             req.sanghamName = req.sanghamName;
  //           } else {
  //             req.sanghamName = 'sangham' + ' ' + `${agentCode}${sanghamNumber}`;
  //           }
  //           console.log(req.sanghamName);
  //     }

  //     // Check if the generated Sangham name already exists
  //     const isExisting = await this.sanghamModel.findOne({
  //       sanghamName: req.sanghamName
  //     });

  //     if (isExisting) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Sangham name already exists',
  //       };
  //     }

  //     const addSangham = await this.sanghamModel.create(req);

  //     if (addSangham) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Sangham added to the Agent Successfully',
  //         data: addSangham,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }

  // async createSangham(req: sanghamDto) {
  //   try {
  //     if (!this.agentSanghamMap[req.agentId]) {
  //       this.agentSanghamMap[req.agentId] = 1;
  //     } else {
  //       this.agentSanghamMap[req.agentId]++;
  //     }

  //     // Retrieve the latest Sangham number for the agent
  //     const latestSangham = await this.sanghamModel
  //       .find({ agentId: req.agentId })
  //       .sort({ createdAt: -1 });

  //     let alphabeticPart;
  //     let numericPart;

  //     if (latestSangham.length > 0) {
  //       const lastRecordNumber = latestSangham[0].sanghamName.split(' ');
  //       const inputString = lastRecordNumber[1];
  //       const matches = inputString.match(/([a-zA-Z]+)(\d+)/);

  //       if (matches) {
  //         alphabeticPart = matches[1];
  //         numericPart = parseInt(matches[2], 10);
  //         numericPart++;
  //       }
  //     } else {
  //       // If no previous Sangham records, use a default value
  //       alphabeticPart = String.fromCharCode(65 + parseInt(req.agentId, 10) - 1);
  //       numericPart = 1;
  //     }

  //     const sanghamNumber = numericPart.toString().padStart(2, '0');

  //     if (req.sanghamName) {
  //       req.sanghamName = req.sanghamName;
  //     } else {
  //       req.sanghamName = 'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
  //     }

  //     // Check if the generated Sangham name already exists
  //     const isExisting = await this.sanghamModel.findOne({
  //       sanghamName: req.sanghamName,
  //     });

  //     if (isExisting) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Sangham name already exists',
  //       };
  //     }

  //     const addSangham = await this.sanghamModel.create(req);

  //     if (addSangham) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Sangham added to the Agent Successfully',
  //         data: addSangham,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }

  // async createSangham(req: sanghamDto) {
  //   try {
  //     if (!this.agentSanghamMap[req.agentId]) {
  //       this.agentSanghamMap[req.agentId] = 1;
  //     } else {
  //       this.agentSanghamMap[req.agentId]++;
  //     }

  //     // Retrieve the latest Sangham number for the agent
  //     const latestSangham = await this.sanghamModel
  //       .find({ agentId: req.agentId })
  //       .sort({ createdAt: -1 });

  //     let alphabeticPart;
  //     let numericPart;

  //     if (latestSangham.length > 0) {
  //       const lastRecordNumber = latestSangham[0].sanghamName.split(' ');
  //       const inputString = lastRecordNumber[1];
  //       const matches = inputString.match(/([a-zA-Z]+)(\d+)/);

  //       if (matches) {
  //         alphabeticPart = matches[1];
  //         numericPart = parseInt(matches[2], 10);
  //         numericPart++;
  //       }
  //     } else {
  //       // If no previous Sangham records, use the next alphabet
  //       const currentAgentCode = String.fromCharCode(65 + Object.keys(this.agentSanghamMap).length - 1);
  //       alphabeticPart = String.fromCharCode(currentAgentCode.charCodeAt(0) + 1);
  //       numericPart = 1;
  //     }

  //     const sanghamNumber = numericPart.toString().padStart(2, '0');

  //     if (req.sanghamName) {
  //       req.sanghamName = req.sanghamName;
  //     } else {
  //       req.sanghamName = 'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
  //     }
  //     console.log(req.sanghamName);
  //     // Check if the generated Sangham name already exists
  //     const isExisting = await this.sanghamModel.findOne({
  //       sanghamName: req.sanghamName,
  //     });

  //     if (isExisting) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Sangham name already exists',
  //       };
  //     }

  //     const addSangham = await this.sanghamModel.create(req);

  //     if (addSangham) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Sangham added to the Agent Successfully',
  //         data: addSangham,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }

  // async createSangham(req: sanghamDto) {
  //   try {
  //     if (!this.agentSanghamMap[req.agentId]) {
  //       this.agentSanghamMap[req.agentId] = 1;
  //     } else {
  //       this.agentSanghamMap[req.agentId]++;
  //     }

  //     // Retrieve the latest Sangham number for the agent
  //     const latestSangham = await this.sanghamModel
  //       .find({ agentId: req.agentId })
  //       .sort({ createdAt: -1 });

  //     let alphabeticPart;
  //     let numericPart;

  //     if (latestSangham.length > 0) {
  //       const lastRecordNumber = latestSangham[0].sanghamName.split(' ');
  //       const inputString = lastRecordNumber[1];
  //       const matches = inputString.match(/([a-zA-Z]+)(\d+)/);

  //       if (matches) {
  //         alphabeticPart = matches[1];
  //         numericPart = parseInt(matches[2], 10);
  //         numericPart++;
  //       }
  //     } else {
  //       // If no previous Sangham records, find the next available alphabet
  //       const usedAlphabets = new Set(
  //         Object.values(this.agentSanghamMap).map((count) =>
  //           String.fromCharCode(65 + count - 1),
  //         ),
  //       );
  //       const availableAlphabet = Array.from({ length: 26 }, (_, i) =>
  //         String.fromCharCode(65 + i),
  //       ).find((alphabet) => !usedAlphabets.has(alphabet));

  //       alphabeticPart = availableAlphabet || 'A';
  //       numericPart = 1;
  //     }

  //     const sanghamNumber = numericPart.toString().padStart(2, '0');

  //     if (req.sanghamName) {
  //       req.sanghamName = req.sanghamName;
  //     } else {
  //       req.sanghamName = 'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
  //     }
  //     console.log(req.sanghamName);
  //     // Check if the generated Sangham name already exists
  //     const isExisting = await this.sanghamModel.findOne({
  //       sanghamName: req.sanghamName,
  //     });

  //     if (isExisting) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Sangham name already exists',
  //       };
  //     }

  //     const addSangham = await this.sanghamModel.create(req);

  //     if (addSangham) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Sangham added to the Agent Successfully',
  //         data: addSangham,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }

  // async createSangham(req: sanghamDto) {
  //   try {
  //     if (!this.agentSanghamMap[req.agentId]) {
  //       this.agentSanghamMap[req.agentId] = 1;
  //     } else {
  //       this.agentSanghamMap[req.agentId]++;
  //     }

  //     const alphabeticPart = this.findNextAvailableAlphabet(req.agentId);
  //     const numericPart = this.agentSanghamMap[req.agentId];
  //     // console.log(numericPart);
  //     const sanghamNumber = numericPart.toString().padStart(2, '0');
  //     // console.log(alphabeticPart);
  //     if (req.sanghamName) {
  //       req.sanghamName = req.sanghamName;
  //     } else {
  //       req.sanghamName = 'sangham' + ' ' + `${alphabeticPart}${sanghamNumber}`;
  //     }
  //     console.log(req.sanghamName);
  //     // Check if the generated Sangham name already exists
  //     const isExisting = await this.sanghamModel.findOne({
  //       sanghamName: req.sanghamName,
  //     });

  //     if (isExisting) {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Sangham name already exists',
  //       };
  //     }

  //     const addSangham = await this.sanghamModel.create(req);

  //     if (addSangham) {
  //       return {
  //         statusCode: HttpStatus.OK,
  //         message: 'Sangham added to the Agent Successfully',
  //         data: addSangham,
  //       };
  //     } else {
  //       return {
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'Invalid request',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     };
  //   }
  // }

  // findNextAvailableAlphabet(agentId: string): string {
  //   const usedAlphabets = new Set(Object.values(this.agentSanghamMap).map(count => String.fromCharCode(65 + count - 1)));
  //   console.log(usedAlphabets);
  //   const agentCode = String.fromCharCode(65 + parseInt(agentId, 10) - 1);

  //   for (let i = 0; i < 26; i++) {
  //     const nextAlphabet = String.fromCharCode(65 + i);
  //     console.log(nextAlphabet);
  //     if (!usedAlphabets.has(nextAlphabet) && nextAlphabet > agentCode) {
  //       return nextAlphabet;
  //     }
  //   }

  //   // If no available alphabet is found, fallback to agent code
  //   return agentCode;
  // }

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
        console.log("alphabeticPart",alphabeticPart);
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
        // Use reduce to sum up podhupuAmount and fine
        totalAmount = balance.reduce((acc, current) => {
          const podhupuAmount = current.depositAmount || 0;
          const fine = current.interest || 0;
          return acc + podhupuAmount + fine;
        }, 0);
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
      if (findCustomerInterest) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Available Balance of Sangham',
          data: {
            availableBalance:
              totalpodupuAmount + totalAmount + totalSanghamAmount,
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
              totalpodupuAmount + totalAmount + totalSanghamAmount,
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
      ]);
      if (sanghams.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of All sanghams',
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
      if (customers.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'List of All Customers',
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
