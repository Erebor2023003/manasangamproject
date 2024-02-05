import { ApiProperty } from '@nestjs/swagger';

export class interestDto {
  @ApiProperty()
  interestId: string;
  @ApiProperty()
  interest: number;
}
