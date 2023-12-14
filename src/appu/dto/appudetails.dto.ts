import { ApiProperty } from "@nestjs/swagger";

export class appuDetailsDto{
    @ApiProperty()
    appuDetailsId: string
    @ApiProperty()
    appuDate: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    interest: number
    @ApiProperty()
    timePeriod: number
    @ApiProperty()
    customerId: string
    @ApiProperty()
    fine: number
}