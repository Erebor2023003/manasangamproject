import { ApiProperty } from "@nestjs/swagger";

export class withdrawDto{
    @ApiProperty()
    withdrawId: string
    @ApiProperty()
    amount: number
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    customerId: string
    @ApiProperty()
    date: string
}