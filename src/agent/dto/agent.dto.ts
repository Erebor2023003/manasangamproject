import { ApiProperty } from "@nestjs/swagger";

export class agentDto{
    @ApiProperty()
    agentId: string
    @ApiProperty()
    agentName: string
    @ApiProperty()
    mobileNo: number
    @ApiProperty()
    emailId: string
    @ApiProperty()
    aadharNo: string
    @ApiProperty()
    aadharImage: string
    @ApiProperty()
    aadharImage2: string
    @ApiProperty()
    tenthmemo: string
    @ApiProperty()
    address:string
    @ApiProperty()
    password: string
    @ApiProperty()
    profilePicture: string
    @ApiProperty()
    role: string
}