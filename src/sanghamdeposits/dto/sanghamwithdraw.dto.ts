import { ApiProperty } from "@nestjs/swagger";

export class sanghamWithdrawDto{
    @ApiProperty()
    sanghamWithdrawId: string
    @ApiProperty()
    withdrawAmount: number
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    agentId: string
    @ApiProperty()
    date: string
}