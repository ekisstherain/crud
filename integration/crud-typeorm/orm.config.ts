import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const type = (process.env.TYPEORM_CONNECTION as any) || 'postgres';

export const withCache: TypeOrmModuleOptions = {
  type,
  host: '192.168.3.27',
  port: type === 'postgres' ? 8002 : 3316,
  username: type === 'mysql' ? 'nestjsx_crud' : 'nestjsx_crud_admin',
  password: type === 'mysql' ? 'nestjsx_crud' : 'V6apGYXyEbPc_pcxHDH43F_8qLsDRTiZ',
  database: 'nestjsx_crud',
  logging: false,
  synchronize: false,
  entities: [join(__dirname, './**/*.entity{.ts,.js}')]
  /*namingStrategy: new SnakeNamingStrategy(),*/
};
