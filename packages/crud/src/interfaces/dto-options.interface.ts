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
    example: { field: 'firstName', order: 'ASC' },
    examples: [
      { field: 'firstName', order: 'ASC' },
      [{ field: 'firstName', order: 'ASC' }, { field: 'lastName', order: 'DESC' }],
    ],
  })
  sort: string[];
}
