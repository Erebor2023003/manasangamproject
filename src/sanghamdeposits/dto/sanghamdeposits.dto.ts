import { ApiProperty } from "@nestjs/swagger";

export class sanghamDepositDto {
    @ApiProperty()
    sanghamDepositId: string
    @ApiProperty()
    depositAmount: number
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    agentId: string
    @ApiProperty()
    interest: number
    @ApiProperty()
    total: number
    @ApiProperty()
    date: string
}