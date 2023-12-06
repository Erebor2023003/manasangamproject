import { ApiProperty } from "@nestjs/swagger";

export class sanghamdepositDetailsDto{
    @ApiProperty()
    sanghamdepositDetailsId: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    agentId: string
    @ApiProperty()
    interestRate: number
    @ApiProperty()
    depositDate: string
}