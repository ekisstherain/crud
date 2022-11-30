import * as moduleAlias from 'module-alias';

//
// Register alias
//
//moduleAlias.addAlias('@common', __dirname + '/../common/');
// Or let module-alias to figure where your package.json is
// located. By default it will look in the same directory
// where you have your node_modules (application's root)
moduleAlias();

import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const typeOrmModuleOptions: DataSourceOptions = {
  type: 'postgres',
  host: '192.168.3.27',
  port: 8002,
  schema: 'public',
  database: 'nestjsx_crud',
  username: 'nestjsx_crud_admin',
  password: 'V6apGYXyEbPc_pcxHDH43F_8qLsDRTiZ',
  entities: [join(__dirname, './**/*.entity{.ts,.js}')],
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/seeds.ts'],
  logger: 'file',
  /* Note : it is unsafe to use synchronize: true for schema synchronization
    on production once you get data in your database. */
  synchronize: false,
};


/**
 * for typeorm migration cli
 */
export default new DataSource(typeOrmModuleOptions);
