import { ApiProperty } from "@nestjs/swagger"

export class depositDto{
    @ApiProperty()
    depositId: string
    @ApiProperty()
    depositAmount: number
    @ApiProperty()
    interest: number
    @ApiProperty()
    customerId: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    date: string
    @ApiProperty()
    withdraw: number
    @ApiProperty()
    total: number
    @ApiProperty()
    customerName: string
}