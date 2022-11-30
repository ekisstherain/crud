// Credits to @recurrence
// https://gist.github.com/recurrence/b6a4cb04a8ddf42eda4e4be520921bd2

import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface {

  eagerJoinRelationAlias(alias: string, propertyPath: string): string {
    //return alias + '__' + propertyPath.replace('.', '_');
    return `r_${alias}_${propertyPath.replace('.', '_')}`
  }
}