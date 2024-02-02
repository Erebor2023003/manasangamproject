import { ApiProperty } from '@nestjs/swagger';

export class interestDto {
  @ApiProperty()
  interestId: number;
  @ApiProperty()
  interest: string;
}
