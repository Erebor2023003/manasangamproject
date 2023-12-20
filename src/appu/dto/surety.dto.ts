import { ApiProperty } from "@nestjs/swagger"

export class suretyDto{
    @ApiProperty()
    suretyId: string
    @ApiProperty()
    candidateName: string
    @ApiProperty()
    mobileNumber: number
    // @ApiProperty()
    // fingerPrint: string
    @ApiProperty()
    candidateImage: string
    @ApiProperty()
    aadharNumber: number
    @ApiProperty()
    customerId: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    candidateId: string
}