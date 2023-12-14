import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schema/customer.schema';
import { Model } from 'mongoose';
import { customerDto } from './dto/customer.dto';
import { SharedService } from 'src/agent/shared.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    private readonly sharedService: SharedService,
  ) {}

  async addCustomer(req: customerDto, image) {
    try {
      const findCustomer = await this.customerModel.findOne({
        aadharNo: req.aadharNo,
      });
      if (findCustomer) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Customer Already Existed',
        };
      } else {
        if (image) {
          if (image.aadharImage && image.aadharImage[0]) {
            const attachmentFile = await this.sharedService.saveFile(
              image.aadharImage[0],
            );
            req.aadharImage = attachmentFile;
          }
          if (image.profileImage && image.profileImage[0]) {
            const attachmentFile = await this.sharedService.saveFile(
              image.profileImage[0],
            );

            req.profileImage = attachmentFile;
          }
        }
        const rawFingerprintData = req.fingerPrint;
        const base64EncodedFingerprintData = Buffer.from(rawFingerprintData).toString('base64');
        const addcustomer = await this.customerModel.create({
          firstName: req.firstName,
          aadharNo: req.aadharNo,
          aadharImage: req.aadharImage,
          mobileNo: req.mobileNo,
          sanghamId: req.sanghamId,
          profileImage: req.profileImage,
          address: req.address,
          fingerPrint: base64EncodedFingerprintData,
          otp: 0
        });
        if (addcustomer) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Customer Added Successfully',
            data: addcustomer,
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

  async listOfCustomersBySangam(req: customerDto) {
    try {
      const list = await this.customerModel.find({ sanghamId: req.sanghamId });
      if (list.length > 0) {
        const listbysangham = await this.customerModel.aggregate([
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
        const count = await this.customerModel
          .find({ sanghamId: req.sanghamId })
          .count();
        return {
          statusCode: HttpStatus.OK,
          message: 'List of customers of sangham',
          count: count,
          data: listbysangham,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No customers are Available',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      };
    }
  }

  async searchCustomerByName(req: customerDto) {
    try {
      const searchCustomer = await this.customerModel.find({
        $and: [
          { sanghamId: req.sanghamId },
          { firstName: { $regex: new RegExp(req.firstName, 'i') } },
        ],
      });
      if (searchCustomer.length > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Results of searched customer',
          data: searchCustomer,
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No customers Available by the searched name',
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
