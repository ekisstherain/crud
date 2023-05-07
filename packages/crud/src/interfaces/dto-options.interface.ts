import { ApiProperty } from '@nestjs/swagger';

export interface DtoOptions {
  create?: any;
  update?: any;
  replace?: any;
  search?: any;
}

export interface ResponseDtoOptions {
  create?: any;
  update?: any;
  replace?: any;
  search?: any;
  getOne?: any;
  getMany?: any;
}

export interface ResponseColumns {
  create?: string[];
  update?: string[];
  replace?: string[];
  search?: string[];
  getOne?: string[];
  getMany?: string[];
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
