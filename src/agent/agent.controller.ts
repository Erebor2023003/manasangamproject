import { Body, Controller, Get, HttpStatus, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AgentService } from './agent.service';
import { agentDto } from './dto/agent.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/roles.enum';
import { sanghamDto } from './dto/sangham.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/registerAgent')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aadharImage' }, { name: 'tenthmemo' }, { name: 'profilePicture' }]),
  )
  async addAgent(@Body() req: agentDto, @UploadedFiles() image) {
    try{
      const addagent = await this.agentService.registerAgent(req, image);
      return addagent
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/loginagent')
  async loginAgent(@Body() req: agentDto) {
    try{
      const findAgent = await this.agentService.loginAgent(req);
      return findAgent
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/agentslist')
  async getAgentsList(){
    try{
      const list = await this.agentService.agentsList();
      return list
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AGENT)
  @Post('/agentbyid')
  async getAgentById(@Body() req: agentDto){
    try{
      const agentDetails = await this.agentService.getAgentDetails(req);
      return agentDetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  // @Post('/updateAgent')
  // @UseInterceptors(
  //   FileFieldsInterceptor([{ name: 'aadharImage' }, { name: 'tenthmemo' }, { name: 'profilePicture' }]),
  // )
  // async updateAgent(@Body() req: agentDto, @UploadedFiles() image) {
  //   try{
  //     const moderate = await this.agentService.updateAgent(req, image);
  //     return moderate
  //   } catch(error) {
  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: error,
  //     }
  //   }
  // }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/addsangham')
  async addSangham(@Body() req: sanghamDto) {
    try{  
       const createsangham = await this.agentService.createSangham(req);
       return createsangham
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN,Role.AGENT)
  @Post('/getAgentSanghams')
  async getAgentSanghams(@Body() req: sanghamDto) {
    try{
      const getlist = await this.agentService.getSanghamsByAgentId(req);
      return getlist
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/getsanghambyid')
  async getSanghamById(@Body() req: sanghamDto) {
    try{
      const getDetails = await this.agentService.getSanghamDetails(req);
      return getDetails
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/searchsanghambyname')
  async searchSanghamByName(@Body() req: sanghamDto) {
    try{
      const searchItem = await this.agentService.searchBySanghamname(req);
      return searchItem
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }

  @Post('/viewsanghambalance')
  async viewSanghamBalance(@Body() req: sanghamDto) {
    try{
      const balance = await this.agentService.getSanghamAvailableBalance(req);
      return balance
    } catch(error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      }
    }
  }
}
