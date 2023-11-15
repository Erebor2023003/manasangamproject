import { ApiProperty } from "@nestjs/swagger";

export class podupuDetailsDto{
    @ApiProperty()
    podupuDetailsId: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    monthlyAmount: number
    @ApiProperty()
    interest: number
    @ApiProperty()
    fine: number
    @ApiProperty()
    startDate: string
    @ApiProperty()
    podupuPeriod: number
}