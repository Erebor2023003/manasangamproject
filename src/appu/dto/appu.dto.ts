import { ApiProperty } from "@nestjs/swagger";

export class appuDto{
    @ApiProperty()
    appuId: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    customerId: string
    @ApiProperty()
    appuAmount: number
    @ApiProperty()
    interest: number
    @ApiProperty()
    fine: number
    @ApiProperty()
    paidAmount: number
    @ApiProperty()
    total: number
    @ApiProperty()
    date: string
    @ApiProperty()
    timePeriod: number
    @ApiProperty()
    appuStatus: string
    @ApiProperty()
    dueDate: string
    @ApiProperty()
    approveStatus: string
    @ApiProperty()
    customerName: string
}