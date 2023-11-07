import { ApiProperty } from "@nestjs/swagger";

export class podhupuDto{
    @ApiProperty()
    podhuId: string
    @ApiProperty()
    customerId: string
    @ApiProperty()
    podhupuAmount: number
    @ApiProperty()
    date: string
    @ApiProperty()
    fine: number
    @ApiProperty()
    Total: number
    @ApiProperty()
    interest: number
    @ApiProperty()
    status: string
}