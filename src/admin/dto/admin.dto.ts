import { ApiProperty } from "@nestjs/swagger";

export class adminDto{
    @ApiProperty()
    adminId: string
    @ApiProperty()
    emailId: string
    @ApiProperty()
    password: string
}