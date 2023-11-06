import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin.schema';
import { Model } from 'mongoose';
import { adminDto } from './dto/admin.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly authService: AuthService,
  ) {}

  async adminregister(req: adminDto) {
    try {
        const findAdmin = await this.adminModel.findOne({emailId: req.emailId});
        if(!findAdmin) {
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
            message: "Admin already existed",
        }
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
}
