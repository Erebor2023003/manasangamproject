import { ApiProperty } from "@nestjs/swagger";

export class sanghamDto{
    @ApiProperty()
    sanghamId: string
    @ApiProperty()
    agentId: string
    @ApiProperty()
    sanghamName: string
    @ApiProperty()
    rateOfInterestPodupu: number
    @ApiProperty()
    rateOfInterestAppu: number
    @ApiProperty()
    rateOfInterestDeposit: number
    @ApiProperty()
    rateOfInterestPodupuFine: number
    @ApiProperty()
    startDate: string
    @ApiProperty()
    endDate: string
    @ApiProperty()
    longitude: string
    @ApiProperty()
    latitude: string
    @ApiProperty()
    address: string
    @ApiProperty()
    customersLimit: number
    @ApiProperty()
    customerId: string
}