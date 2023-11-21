import { ApiProperty } from "@nestjs/swagger";

export class depositDetailsDto{
    @ApiProperty()
    depositDetailsId: string
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    depositLimit: number
    @ApiProperty()
    interest: number
    @ApiProperty()
    depositDate: string
}