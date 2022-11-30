SELECT DISTINCT "distinctAlias"."Project_id" AS "ids_Project_id", "distinctAlias"."Project_id"
FROM (SELECT "Project"."id"          AS "Project_id",
             "Project"."id"          AS "Project_id",
             "Project"."createdAt"   AS "Project_createdAt",
             "Project"."updatedAt"   AS "Project_updatedAt",
             "Project"."name"        AS "Project_name",
             "Project"."description" AS "Project_description",
             "Project"."isActive"    AS "Project_isActive",
             "Project"."companyId"   AS "Project_companyId",
             "company"."id"          AS "company_id",
             "company"."id"          AS "company_id",
             "company"."id"          AS "company_id",
             "company"."name"        AS "company_name",
             "company"."domain"      AS "company_domain",
             "company"."description" AS "company_description",
             "company"."deletedAt"   AS "company_deletedAt"
      FROM "projects" "Project"
               LEFT JOIN "companies" "company"
                         ON "company"."id" = "Project"."companyId" AND ("company"."deletedAt" IS NULL)
      WHERE (("Project"."name" LIKE $1 OR ("Project"."name" LIKE $2 AND "Project"."isActive" = $3)))) "distinctAlias"
ORDER BY "distinctAlias"."Project_id" ASC, "Project_id" ASC
LIMIT 100