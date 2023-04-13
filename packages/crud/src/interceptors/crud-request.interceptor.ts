import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import {
  RequestQueryException,
  RequestQueryParser,
  SCondition,
  QueryFilter,
  QuerySort,
  ParsedRequestParams,
} from '@nestjsx/crud-request';
import { isNil, isFunction, isArrayFull, hasLength, isObject, isString, isObjectFull } from '@nestjsx/util';

import { PARSED_CRUD_REQUEST_KEY } from '../constants';
import { CrudActions } from '../enums';
import { MergedCrudOptions, CrudRequest, SearchDto } from '../interfaces';
import { QueryFilterFunction } from '../types';
import { CrudBaseInterceptor } from './crud-base.interceptor';
import * as _ from 'lodash';
import { validateSort } from '@nestjsx/crud-request/request-query.validator';

@Injectable()
export class CrudRequestInterceptor extends CrudBaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    try {
      /* istanbul ignore else */
      if (!req[PARSED_CRUD_REQUEST_KEY]) {
        const { ctrlOptions, crudOptions, action } = this.getCrudInfo(context);
        const parser = RequestQueryParser.create();
        let bodyConditions: SCondition[] = [];
        if (req.url.indexOf('/search') > -1) {
          const body: SearchDto = req.body;
          if (isObject(body)) {
            bodyConditions = this.buildSearchCondition(body, crudOptions);
            const query = {
              page: body.page,
              limit: body.limit,
              sort: this.handleSort(body.sort),
            } as ParsedRequestParams;
            parser.parseQuery(query);
          }
        } else {
          parser.parseQuery(req.query);
        }

        if (!isNil(ctrlOptions)) {
          const search = this.getSearch(parser, crudOptions, action, req.params);
          const allConditions = [...search, ...bodyConditions];
          const auth = this.getAuth(parser, crudOptions, req);
          parser.search = auth.or
            ? { $or: [auth.or, { $and: allConditions }] }
            : { $and: [auth.filter, ...allConditions] };
        } else {
          const search = this.getSearch(parser, crudOptions, action);
          const allConditions = [...search, ...bodyConditions];
          parser.search = { $and: allConditions };
        }

        req[PARSED_CRUD_REQUEST_KEY] = this.getCrudRequest(parser, crudOptions);
      }

      return next.handle();
    } catch (error) {
      /* istanbul ignore next */
      throw error instanceof RequestQueryException ? new BadRequestException(error.message) : error;
    }
  }

  /**
   * 构建查询条件对象
   *
   * @param body
   * @param crudOptions
   */
  buildSearchCondition(body: any, crudOptions: Partial<MergedCrudOptions>): SCondition[] {
    const searchConditions: SCondition[] = [];
    const keywordsValue = body.keyword;
    const keywordFields = crudOptions.query?.keywordFields;
    // 关键词查询条件整理
    if (keywordFields && hasLength(keywordFields) && keywordsValue) {
      const keywordConditions: any = [];
      keywordFields.forEach((key) => {
        keywordConditions.push({
          [key]: {
            $cont: keywordsValue,
          },
        });
      });

      searchConditions.push({
        $or: keywordConditions,
      });
    }

    // 排除关键字处理
    const simpleQuery = _.omit(body, ['keyword', 'page', 'limit', 'sort']);
    Object.entries(simpleQuery).forEach(([key, value]) => {
      if (!isNil(value)) {
        searchConditions.push({
          [key]: {
            $cont: value,
          },
        });
      }
    });

    return searchConditions;
  }

  /**
   * 排序参数处理
   * 格式：['name,ASC','column,DESC']
   * 或者格式：[{field: firstName, order: 'ASC'}, {field: lastName, order: 'DESC'}]
   */
  handleSort(sort: any) {
    const querySorts: QuerySort[] = [];
    if (isArrayFull(sort)) {
      sort.forEach((sortItem) => {
        if (isObject(sortItem)) {
          validateSort(sortItem);
          querySorts.push(sortItem);
        } else {
          querySorts.push(this.buildQuerySortItem(sortItem));
        }
      });
    } else if (isString(sort)) {
      querySorts.push(this.buildQuerySortItem(sort));
    } else if (isObjectFull(sort)) {
      validateSort(sort);
      querySorts.push(sort);
    }

    return querySorts;
  }

  /**
   * 排序参数处理
   * 格式：
   * 'name'
   * 'name,ASC'
   * 'name,DESC'
   */
  buildQuerySortItem(value: string): QuerySort {
    const sortItem = value.split(',');
    if (sortItem.length === 2) {
      return {
        field: sortItem[0],
        order: sortItem[1].toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      };
    } else {
      return {
        field: value,
        order: 'ASC',
      };
    }
  }

  getCrudRequest(parser: RequestQueryParser, crudOptions: Partial<MergedCrudOptions>): CrudRequest {
    const parsed = parser.getParsed();
    const { query, routes, params } = crudOptions;

    return {
      parsed,
      options: {
        query,
        routes,
        params,
      },
    };
  }

  getSearch(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
    action: CrudActions,
    params?: any,
  ): SCondition[] {
    // params condition
    const paramsSearch = this.getParamsSearch(parser, crudOptions, params);

    // if `CrudOptions.query.filter` is a function then return transformed query search conditions
    if (isFunction(crudOptions.query.filter)) {
      const filterCond =
        (crudOptions.query.filter as QueryFilterFunction)(parser.search, action === CrudActions.ReadAll) ||
        /* istanbul ignore next */ {};

      return [...paramsSearch, filterCond];
    }

    // if `CrudOptions.query.filter` is array or search condition type
    const optionsFilter = isArrayFull(crudOptions.query.filter)
      ? (crudOptions.query.filter as QueryFilter[]).map(parser.convertFilterToSearch)
      : [(crudOptions.query.filter as SCondition) || {}];

    let search: SCondition[] = [];

    if (parser.search) {
      search = [parser.search];
    } else if (hasLength(parser.filter) && hasLength(parser.or)) {
      search =
        parser.filter.length === 1 && parser.or.length === 1
          ? [
              {
                $or: [parser.convertFilterToSearch(parser.filter[0]), parser.convertFilterToSearch(parser.or[0])],
              },
            ]
          : [
              {
                $or: [
                  { $and: parser.filter.map(parser.convertFilterToSearch) },
                  { $and: parser.or.map(parser.convertFilterToSearch) },
                ],
              },
            ];
    } else if (hasLength(parser.filter)) {
      search = parser.filter.map(parser.convertFilterToSearch);
    } else {
      if (hasLength(parser.or)) {
        search =
          parser.or.length === 1
            ? [parser.convertFilterToSearch(parser.or[0])]
            : /* istanbul ignore next */ [
                {
                  $or: parser.or.map(parser.convertFilterToSearch),
                },
              ];
      }
    }

    return [...paramsSearch, ...optionsFilter, ...search];
  }

  getParamsSearch(parser: RequestQueryParser, crudOptions: Partial<MergedCrudOptions>, params?: any): SCondition[] {
    if (params) {
      parser.parseParams(params, crudOptions.params);

      return isArrayFull(parser.paramsFilter) ? parser.paramsFilter.map(parser.convertFilterToSearch) : [];
    }

    return [];
  }

  getAuth(parser: RequestQueryParser, crudOptions: Partial<MergedCrudOptions>, req: any): { filter?: any; or?: any } {
    const auth: any = {};

    /* istanbul ignore else */
    if (crudOptions.auth) {
      const userOrRequest = crudOptions.auth.property ? req[crudOptions.auth.property] : req;

      if (isFunction(crudOptions.auth.or)) {
        auth.or = crudOptions.auth.or(userOrRequest);
      }

      if (isFunction(crudOptions.auth.filter) && !auth.or) {
        auth.filter = crudOptions.auth.filter(userOrRequest) || /* istanbul ignore next */ {};
      }

      if (isFunction(crudOptions.auth.persist)) {
        parser.setAuthPersist(crudOptions.auth.persist(userOrRequest));
      }
    }

    return auth;
  }
}
