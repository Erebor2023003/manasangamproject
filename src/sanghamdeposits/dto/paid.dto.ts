import { ApiProperty } from "@nestjs/swagger";

export class paidDto{
    @ApiProperty()
    paidId: string
    @ApiProperty()
    amount: number
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    date: string
}