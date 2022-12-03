import { ApiProperty } from '@nestjs/swagger';

export interface DtoOptions {
  create?: any;
  update?: any;
  replace?: any;
  search?: any;
}

export class SearchDto {
  @ApiProperty({ required: false })
  keyword?: string;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Sort format: column[,ASC|DESC]',
    example: ['firstName:ASC', 'lastName:DESC'],
    examples: ['firstName', ['firstName:DESC'], ['firstName:ASC', 'lastName,DESC']],
  })
  sort: string[];
}